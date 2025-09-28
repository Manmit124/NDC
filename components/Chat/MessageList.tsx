'use client'

import { useEffect, useRef, useState } from 'react'
import { Reply, MoreVertical, Edit, Trash2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUIStore } from '@/stores/ui'
import { useMessages, useDeleteMessage, useEditMessage, useAnonymousUser } from '@/hooks/api/useChat'
import { useAuth } from '@/hooks/auth/useAuth'
import { ChatMessageWithUser, AnonymousUser } from '@/types/database'
import { formatDistance } from 'date-fns'
import { cn } from "@/lib/utils"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MessageListProps {
  roomId: string
}

interface MessageItemProps {
  message: ChatMessageWithUser
  onReply: (messageId: string) => void
  currentAnonymousUser?: AnonymousUser
}

interface ReplyPreviewProps {
  repliedMessage: NonNullable<ChatMessageWithUser['replied_message']>
  isOwnMessage: boolean
}

function ReplyPreview({ repliedMessage, isOwnMessage }: ReplyPreviewProps) {
  const getSenderInfo = () => {
    if (repliedMessage.user) {
      return {
        name: repliedMessage.user.display_name,
        color: repliedMessage.user.avatar_color || '#3B82F6'
      }
    }
    return {
      name: 'Unknown User',
      color: '#6B7280'
    }
  }

  const senderInfo = getSenderInfo()

  // Truncate long messages for preview
  const truncateMessage = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <div className={cn(
      `mb-2 p-2 rounded-md border-l-4 text-xs bg-background/20 border-${senderInfo.color}`,

    )}>
      <div className={cn(
        "flex items-center gap-1 mb-1",
      )}>
        <span className="font-medium" style={{ color: senderInfo.color }}>
          {senderInfo.name}
        </span>
      </div>
      <div className={cn(
        "opacity-80",
      )}>
        {repliedMessage.message_type === 'code' ? (
          <code className="bg-background/20 px-1 rounded text-xs">
            {truncateMessage(repliedMessage.content, 80)}
          </code>
        ) : (
          truncateMessage(repliedMessage.content)
        )}
      </div>
    </div>
  )
}

function MessageItem({ message, onReply, currentAnonymousUser }: MessageItemProps) {
  const deleteMessage = useDeleteMessage()
  const editMessage = useEditMessage()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)

  // Determine if message is from current user (based on anonymous user ID)
  const isOwnMessage = message.anonymous_user_id === currentAnonymousUser?.id

  // Get sender information
  const getSenderInfo = () => {
    if (message.user) {
      return {
        name: message.user.display_name || message.user.id,
        avatar: message.user.avatar_url,
        color: '#3B82F6' // Blue for authenticated users
      }
    } else if (message.anonymous_users) {
      return {
        name: message.anonymous_users.display_name,
        avatar: null,
        color: message.anonymous_users.avatar_color
      }
    }
    return {
      name: 'Unknown User',
      avatar: null,
      color: '#6B7280'
    }
  }

  const senderInfo = getSenderInfo()

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content)
  }

  const handleDeleteMessage = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage.mutateAsync(message.id)
      } catch (error) {
        console.error('Failed to delete message:', error)
      }
    }
  }

  const handleEditSave = async () => {
    if (editContent.trim() === message.content || !editContent.trim()) {
      setIsEditing(false)
      setEditContent(message.content)
      return
    }

    try {
      await editMessage.mutateAsync({
        messageId: message.id,
        content: editContent.trim()
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to edit message:', error)
      setEditContent(message.content)
      setIsEditing(false)
    }
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditContent(message.content)
  }

  return (
  <div
    className={cn(
      "group flex gap-3 p-4 hover:bg-muted/30",
      // For own messages, this single class reverses the order of all direct children
      isOwnMessage && "flex-row-reverse" 
    )}
  >
    {/* 1. Avatar */}
    <div className="flex-shrink-0">
      {senderInfo.avatar ? (
        <img
          src={senderInfo.avatar}
          alt={senderInfo.name}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
          style={{ backgroundColor: senderInfo.color }}
        >
          {senderInfo.name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>

    {/* 2. Message Body (Always stays in the middle visually) */}
    <div className="max-w-xs sm:max-w-md lg:max-w-lg">
      {/* Header */}
      <div className={cn(
          "flex items-center gap-2 mb-1", 
          isOwnMessage && "flex-row-reverse" // Reverses name/timestamp order
      )}>
        <span className="font-medium text-foreground text-sm">
          {senderInfo.name}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDistance(new Date(message.created_at), new Date(), { addSuffix: true })}
        </span>
        {message.edited_at && (
          <Badge variant="outline" className="text-xs">Edited</Badge>
        )}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "rounded-lg p-2 bg-muted rounded-bl-sm",
        )}
      >
        {/* Reply Preview - show the original message being replied to */}
        {message.replied_message && (
          <ReplyPreview 
            repliedMessage={message.replied_message} 
            isOwnMessage={isOwnMessage}
          />
        )}

        {/* Editing state or message content */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none min-h-[60px] bg-background text-foreground"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEditSave} disabled={editMessage.isPending}>
                {editMessage.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button size="sm" variant="outline" onClick={handleEditCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className={`text-sm ${message.message_type === 'code' ? 'font-mono' : ''}`}>
            {message.message_type === 'code' ? (
              <pre
                className={cn(
                  "p-2 rounded overflow-x-auto whitespace-pre-wrap break-words",
                  isOwnMessage ? "bg-background/10" : "bg-background"
                )}
              >
                {message.content}
              </pre>
            ) : (
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
            )}
          </div>
        )}
      </div>
    </div>

    {/* 3. Actions (Reply, More Options) */}
    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReply(message.id)}
          className="h-7 w-7 p-0"
          title="Reply"
        >
          <Reply className="w-3 h-3" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="More options">
              <MoreVertical className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align={isOwnMessage ? "start" : "end"} 
            className="w-48"
          >
            <DropdownMenuItem onClick={handleCopyMessage}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Message
            </DropdownMenuItem>
            
            {isOwnMessage && (
              <>
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Message
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteMessage}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Message
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
);
}

export function MessageList({ roomId }: MessageListProps) {
  const { data: messages, isLoading, error } = useMessages(roomId)
  const { user } = useAuth()
  const { setReplyingTo, chat: { sessionToken } } = useUIStore()
  const { data: currentAnonymousUser } = useAnonymousUser(roomId, sessionToken, user?.id)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId)
  }

  // Check if this is a database table error
  const isDatabaseError = error?.message?.includes('relation "public.chat_messages" does not exist') ||
                          error?.message?.includes('table "chat_messages" does not exist')

  if (isDatabaseError) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div>
          <div className="text-6xl mb-6">⚠️</div>
          <h3 className="text-xl font-medium text-foreground mb-4">
            Database Setup Required
          </h3>
          <p className="text-muted-foreground mb-6">
            The chat message tables haven&apos;t been created yet. Please run the database setup script to enable messaging.
          </p>
          <div className="bg-muted/30 rounded-lg p-4 text-left max-w-md">
            <p className="text-sm font-medium text-foreground mb-2">To fix this:</p>
            <ol className="text-sm text-muted-foreground space-y-1">
              <li>1. Open your Supabase dashboard</li>
              <li>2. Go to SQL Editor</li>
              <li>3. Copy and run the database-setup.sql script</li>
              <li>4. Refresh this page</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  if (error && !isDatabaseError) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div>
          <div className="text-6xl mb-6">❌</div>
          <h3 className="text-xl font-medium text-foreground mb-4">
            Error Loading Messages
          </h3>
          <p className="text-muted-foreground">
            {error.message}
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!messages?.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div>
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No messages yet
          </h3>
          <p className="text-muted-foreground">
            Start the conversation by sending the first message!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="min-h-full">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onReply={handleReply}
            currentAnonymousUser={currentAnonymousUser}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}