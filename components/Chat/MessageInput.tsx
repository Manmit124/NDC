'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, X, Reply, Code, Image, Paperclip, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useUIStore } from '@/stores/ui'
import { useSendMessage, useAnonymousUser, useRoom, useUserProfile } from '@/hooks/api/useChat'
import { useAuth } from '@/hooks/auth/useAuth'
import { ProfileRequiredPrompt } from './ProfileRequiredPrompt'

interface MessageInputProps {
  roomId: string
}

export function MessageInput({ roomId }: MessageInputProps) {
  const { 
    chat: { 
      sessionToken, 
      messageInput, 
      replyingTo 
    },
    setMessageInput,
    setReplyingTo
  } = useUIStore()
  
  const { user } = useAuth()
  const { data: room } = useRoom(roomId)
  const { data: userProfile } = useUserProfile(user?.id)
  const sendMessage = useSendMessage()
  const { data: anonymousUser } = useAnonymousUser(roomId, sessionToken, user?.id)
  
  const [messageType, setMessageType] = useState<'text' | 'code'>('text')
  const [showProfileRequired, setShowProfileRequired] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [messageInput])

  // Focus textarea when replying
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [replyingTo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const content = messageInput?.trim()
    if (!content || sendMessage.isPending || !anonymousUser?.id) return

    // Only check profile requirement for identity rooms (non-anonymous rooms)
    // Anonymous rooms should allow all users to chat regardless of profile status
    if (!room?.is_anonymous && user && !userProfile?.hasProfile) {
      // Don't send message if profile is required but not complete for identity room
      // This should not happen as UI prevents typing, but safety check
      return
    }

    try {
      await sendMessage.mutateAsync({
        roomId,
        content,
        messageType,
        anonymousUserId: anonymousUser.id,
        replyTo: replyingTo || undefined
      })
      
      // Clear input and reset states
      setMessageInput('')
      setReplyingTo(null)
      setMessageType('text')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleCancelReply = () => {
    setReplyingTo(null)
  }

  const getUserDisplayInfo = () => {
    // If room forces anonymity, use anonymous user
    if (room?.is_anonymous && anonymousUser) {
      return {
        name: anonymousUser.display_name,
        color: anonymousUser.avatar_color
      }
    } 
    // If room allows identity and user is logged in, check profile
    else if (!room?.is_anonymous && user) {
      if (userProfile?.hasProfile && userProfile.username) {
        return {
          name: userProfile.username,
          color: '#3B82F6' // Default blue
        }
      } else {
        return {
          name: 'Profile Required',
          color: '#EF4444' // Red to indicate action needed
        }
      }
    }
    // Fallback to anonymous (for loading states or edge cases)
    return {
      name: anonymousUser?.display_name || 'Anonymous',
      color: anonymousUser?.avatar_color || '#6B7280' // Gray
    }
  }

  const displayInfo = getUserDisplayInfo()
  const needsProfile = !room?.is_anonymous && user && !userProfile?.hasProfile

  return (
    <div className="border-t border-border bg-card">
      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-4 py-2 bg-muted/30 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Reply className="w-4 h-4" />
              <span>Replying to message</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelReply}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Message type selector */}
      <div className="px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Button
            variant={messageType === 'text' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMessageType('text')}
            className="h-7 text-xs"
          >
            Text
          </Button>
          <Button
            variant={messageType === 'code' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMessageType('code')}
            className="h-7 text-xs"
          >
            <Code className="w-3 h-3 mr-1" />
            Code
          </Button>
          
          {/* User indicator */}
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <div 
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: displayInfo.color }}
              />
              {displayInfo.name}
            </Badge>
          </div>
        </div>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4">
        
        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              placeholder={
                needsProfile 
                  ? "Complete your profile to send messages in this identity room..."
                  : `Type your ${messageType} message... (Enter to send, Shift+Enter for new line)`
              }
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`min-h-[40px] max-h-[120px] resize-none ${
                messageType === 'code' ? 'font-mono text-sm' : ''
              }`}
              disabled={sendMessage.isPending || !!needsProfile}
            />
          </div>
          <Button
            type="submit"
            disabled={!messageInput?.trim() || sendMessage.isPending || !anonymousUser?.id || !!needsProfile}
            className="self-end"
          >
            {sendMessage.isPending ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {/* Message preview for code */}
        {messageType === 'code' && messageInput?.trim() && (
          <div className="mt-2 p-3 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Preview:</div>
            <pre className="text-sm font-mono whitespace-pre-wrap break-words">
              {messageInput}
            </pre>
          </div>
        )}
      </form>

      {/* Profile Required Dialog */}
      <Dialog open={showProfileRequired} onOpenChange={setShowProfileRequired}>
        <DialogContent className="sm:max-w-md">
          <ProfileRequiredPrompt roomName={room?.name} />
        </DialogContent>
      </Dialog>
    </div>
  )
}