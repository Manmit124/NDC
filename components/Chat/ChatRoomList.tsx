'use client'

import { Hash, Plus, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUIStore } from '@/stores/ui'
import { useChatRooms, useCreateRoom, useUserProfile } from '@/hooks/api/useChat'
import { useAuth } from '@/hooks/auth/useAuth'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ProfileRequiredPrompt } from './ProfileRequiredPrompt'

export function ChatRoomList() {
  const { 
    chat: { activeRoomId },
    setActiveRoom
  } = useUIStore()
  
  const { data: rooms, isLoading, error } = useChatRooms()
  const { user } = useAuth()
  const { data: userProfile } = useUserProfile(user?.id)
  
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [showProfileRequired, setShowProfileRequired] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [roomDescription, setRoomDescription] = useState('')
  const [isAnonymousRoom, setIsAnonymousRoom] = useState(true)
  
  const createRoom = useCreateRoom()

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !user) return
    
    // Check if user is trying to create identity room without profile
    if (!isAnonymousRoom && !userProfile?.hasProfile) {
      setShowProfileRequired(true)
      return
    }
    
    try {
      await createRoom.mutateAsync({
        name: roomName.trim(),
        description: roomDescription.trim() || undefined,
        isAnonymous: isAnonymousRoom,
        createdBy: user.id
      })
      
      // Reset form
      setRoomName('')
      setRoomDescription('')
      setIsAnonymousRoom(true)
      setShowCreateRoom(false)
    } catch (error) {
      console.error('Failed to create room:', error)
    }
  }

  const handleRoomTypeChange = (anonymous: boolean) => {
    // If user is trying to select identity room but doesn't have profile
    if (!anonymous && user && !userProfile?.hasProfile) {
      setShowProfileRequired(true)
      return
    }
    setIsAnonymousRoom(anonymous)
  }

  // Check if this is a database table error
  const isDatabaseError = error?.message?.includes('relation "public.chat_rooms" does not exist') ||
                          error?.message?.includes('table "chat_rooms" does not exist')

  if (isDatabaseError) {
    return (
      <div className="w-80 bg-card border-r border-border flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Chat Rooms</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="font-medium text-foreground mb-2">Database Setup Required</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Chat tables haven&apos;t been created yet. Please run the database setup script.
            </p>
            <div className="bg-muted/30 rounded-lg p-3 text-left">
              <p className="text-xs text-muted-foreground mb-1">To fix this:</p>
              <ol className="text-xs text-muted-foreground space-y-1">
                <li>1. Open your Supabase dashboard</li>
                <li>2. Go to SQL Editor</li>
                <li>3. Run the database-setup.sql script</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !isDatabaseError) {
    return (
      <div className="w-80 bg-card border-r border-border flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Chat Rooms</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="font-medium text-foreground mb-2">Connection Error</h3>
            <p className="text-sm text-muted-foreground">
              {error.message}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-80 bg-card border-r border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Chat Rooms</h2>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Chat Rooms</h2>
        {user && (
          <Dialog open={showCreateRoom} onOpenChange={setShowCreateRoom}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Room</DialogTitle>
                <DialogDescription>
                  Create a new chat room for the community
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="room-name">Room Name</Label>
                  <Input
                    id="room-name"
                    placeholder="Enter room name..."
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="room-description">Description (Optional)</Label>
                  <Textarea
                    id="room-description"
                    placeholder="Describe what this room is for..."
                    value={roomDescription}
                    onChange={(e) => setRoomDescription(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Room Type</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="anonymous-room"
                        name="room-type"
                        checked={isAnonymousRoom}
                        onChange={() => setIsAnonymousRoom(true)}
                        className="rounded"
                      />
                      <Label htmlFor="anonymous-room" className="text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4 text-orange-600" />
                        Anonymous room (members chat with random names)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="identity-room"
                        name="room-type"
                        checked={!isAnonymousRoom}
                        onChange={() => handleRoomTypeChange(false)}
                        className="rounded"
                        disabled={!userProfile?.hasProfile}
                      />
                      <Label htmlFor="identity-room" className={`text-sm flex items-center gap-2 ${!userProfile?.hasProfile ? 'text-muted-foreground' : ''}`}>
                        <Hash className="w-4 h-4 text-blue-600" />
                        Identity room (members chat with real names)
                        {!userProfile?.hasProfile && (
                          <Badge variant="secondary" className="ml-2 text-xs">Profile Required</Badge>
                        )}
                      </Label>
                    </div>
                  </div>
                  {!userProfile?.hasProfile && (
                    <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                      Complete your profile to create identity rooms where members chat with their real names.
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateRoom(false)}
                    disabled={createRoom.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateRoom}
                    disabled={!roomName.trim() || createRoom.isPending}
                  >
                    {createRoom.isPending ? 'Creating...' : 'Create Room'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {rooms?.length === 0 ? (
            <div className="text-center py-8">
              <Hash className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No chat rooms yet</p>
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateRoom(true)}
                  className="mt-2"
                >
                  Create the first room
                </Button>
              )}
            </div>
          ) : (
            rooms?.map((room) => (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeRoomId === room.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted/50 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    room.is_anonymous 
                      ? 'bg-orange-100 dark:bg-orange-900/30' 
                      : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {room.is_anonymous ? (
                      <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    ) : (
                      <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground text-sm truncate">
                        {room.name}
                      </h3>
                      {room.is_anonymous && (
                        <Badge 
                          variant="secondary" 
                          className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs"
                        >
                          Anon
                        </Badge>
                      )}
                    </div>
                    {room.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {room.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          {rooms?.length || 0} room{rooms?.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Profile Required Dialog */}
      <Dialog open={showProfileRequired} onOpenChange={setShowProfileRequired}>
        <DialogContent className="sm:max-w-md">
          <ProfileRequiredPrompt isCreatingRoom={true} />
        </DialogContent>
      </Dialog>
    </div>
  )
}