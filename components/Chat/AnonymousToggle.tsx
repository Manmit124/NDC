'use client'

import { Shield, User, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUIStore } from '@/stores/ui'
import { useAuth } from '@/hooks/auth/useAuth'
import { useRoom } from '@/hooks/api/useChat'

interface AnonymousToggleProps {
  roomId: string
}

export function AnonymousToggle({ roomId }: AnonymousToggleProps) {
  const { user } = useAuth()
  const { data: room } = useRoom(roomId)

  // If room data isn't loaded yet, show loading state
  if (!room) {
    return (
      <div className="flex items-center gap-3 p-4 bg-card border-b border-border">
        <div className="flex-1">
          <div className="h-4 bg-muted animate-pulse rounded mb-1"></div>
          <div className="h-3 bg-muted animate-pulse rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  const isAnonymousRoom = room.is_anonymous

  return (
    <div className="flex items-center gap-3 p-4 bg-card border-b border-border">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-foreground mb-1">
          Chat Mode
        </h3>
        <p className="text-xs text-muted-foreground">
          {isAnonymousRoom 
            ? "This room enforces anonymous chat - all users are assigned random anonymous names for privacy" 
            : user 
              ? "This room allows identified chat - you're chatting with your real username" 
              : "This room allows identified chat - sign in to chat with your identity"
          }
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Room mode badge (not toggleable) */}
        <Badge 
          variant={isAnonymousRoom ? "secondary" : "default"}
          className={`transition-colors ${
            isAnonymousRoom 
              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" 
              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          }`}
        >
          {isAnonymousRoom ? (
            <>
              <Shield className="w-3 h-3 mr-1" />
              Anonymous Room
            </>
          ) : (
            <>
              <User className="w-3 h-3 mr-1" />
              Identity Room
            </>
          )}
        </Badge>
        
      </div>
    </div>
  )
}