'use client'

import { Shield, User, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUIStore } from '@/stores/ui'
import { useAuth } from '@/hooks/auth/useAuth'

export function AnonymousToggle() {
  const { 
    chat: { isAnonymousMode },
    toggleAnonymousMode,
    setAnonymousMode
  } = useUIStore()
  const { user } = useAuth()

  return (
    <div className="flex items-center gap-3 p-4 bg-card border-b border-border">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-foreground mb-1">
          Chat Mode
        </h3>
        <p className="text-xs text-muted-foreground">
          {isAnonymousMode 
            ? "You're chatting anonymously with a random name" 
            : user 
              ? "You're chatting as yourself" 
              : "Sign in or continue anonymously"
          }
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Current mode badge */}
        <Badge 
          variant={isAnonymousMode ? "secondary" : "default"}
          className={`transition-colors ${
            isAnonymousMode 
              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" 
              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          }`}
        >
          {isAnonymousMode ? (
            <>
              <Shield className="w-3 h-3 mr-1" />
              Anonymous
            </>
          ) : (
            <>
              <User className="w-3 h-3 mr-1" />
              {user ? 'Identified' : 'Guest'}
            </>
          )}
        </Badge>
        
        {/* Toggle button - only show if user is authenticated */}
        {user && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAnonymousMode}
            className="h-8 w-8 p-0"
            title={isAnonymousMode ? "Switch to identified mode" : "Switch to anonymous mode"}
          >
            {isAnonymousMode ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  )
}