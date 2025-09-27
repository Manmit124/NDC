"use client";

import { useEffect } from 'react'
import { MessageSquare, Users, Hash } from 'lucide-react'
import { AnonymousToggle } from '@/components/Chat/AnonymousToggle'
import { ChatRoomList } from '@/components/Chat/ChatRoomList'
import { MessageList } from '@/components/Chat/MessageList'
import { MessageInput } from '@/components/Chat/MessageInput'
import { useUIStore } from '@/stores/ui'
import { useRoom } from '@/hooks/api/useChat'
import { useRealtimeChat } from '@/hooks/useRealtimeChat'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function ChatPage() {
  const { 
    chat: { 
      activeRoomId, 
      showRoomList, 
      typingIndicators 
    },
    setRoomListVisible,
    toggleRoomList
  } = useUIStore()
  
  const { data: activeRoom } = useRoom(activeRoomId || '')
  const { sendTypingIndicator } = useRealtimeChat(activeRoomId || '')

  // Auto-hide room list on mobile when room is selected
  useEffect(() => {
    if (activeRoomId && window.innerWidth < 1024) {
      setRoomListVisible(false)
    }
  }, [activeRoomId, setRoomListVisible])

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Room List Sidebar */}
      {showRoomList && <ChatRoomList />}
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeRoomId ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-border bg-card px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Mobile room list toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleRoomList}
                    className="lg:hidden h-8 w-8 p-0"
                  >
                    <Hash className="w-4 h-4" />
                  </Button>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-semibold text-foreground">
                        {activeRoom?.name || 'Loading...'}
                      </h1>
                      {activeRoom?.is_anonymous && (
                        <Badge 
                          variant="secondary" 
                          className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                        >
                          Anonymous Room
                        </Badge>
                      )}
                    </div>
                    {activeRoom?.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {activeRoom.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Typing indicators */}
                  {typingIndicators?.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {typingIndicators?.length === 1 
                        ? `${typingIndicators[0].display_name} is typing...`
                        : `${typingIndicators?.length} people are typing...`
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Anonymous Toggle */}
            <AnonymousToggle />

            {/* Messages Area */}
            <MessageList roomId={activeRoomId} />

            {/* Message Input */}
            <MessageInput roomId={activeRoomId} />
          </>
        ) : (
          /* Welcome/Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="text-6xl mb-6">💬</div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Welcome to NDC Community Chat
              </h2>
              <p className="text-muted-foreground mb-6">
                Connect with fellow developers from Nagpur in real-time. Choose a chat room to get started or create your own!
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <h3 className="font-medium text-foreground">Real-time Messaging</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Send and receive messages instantly with live updates
                    </p>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <h3 className="font-medium text-foreground">Anonymous Chat</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Chat anonymously with random display names for privacy
                    </p>
                  </div>
                </div>
                
                {!showRoomList && (
                  <Button 
                    onClick={() => setRoomListVisible(true)}
                    className="w-full"
                  >
                    <Hash className="w-4 h-4 mr-2" />
                    Browse Chat Rooms
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
