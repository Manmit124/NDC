'use client'

import { User, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

interface ProfileRequiredPromptProps {
  roomName?: string
  isCreatingRoom?: boolean
}

export function ProfileRequiredPrompt({ roomName, isCreatingRoom = false }: ProfileRequiredPromptProps) {
  const router = useRouter()

  const handleCompleteProfile = () => {
    router.push('/onboarding')
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="max-w-md mx-auto p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-foreground mb-3">
          Profile Required for Identity {isCreatingRoom ? 'Room Creation' : 'Chat'}
        </h2>
        
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {isCreatingRoom ? (
            "To create identity rooms where members chat with their real names, you need to complete your profile first. Anonymous rooms are still available without a profile."
          ) : roomName ? (
            <>
              <strong>`&quot;{roomName}`&quot;</strong> is an identity room where users chat with their real names. 
              Please complete your profile to participate in this room.
            </>
          ) : (
            "This is an identity room where users chat with their real names. Please complete your profile to participate."
          )}
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={handleCompleteProfile}
            className="w-full"
            size="lg"
          >
            Complete Profile
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <p className="text-xs text-muted-foreground">
            {isCreatingRoom 
              ? "After completing your profile, you can create both anonymous and identity rooms."
              : "After completing your profile, return here to start chatting with your identity."
            }
          </p>
        </div>
      </Card>
    </div>
  )
}