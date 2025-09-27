'use client'

import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { useUIStore } from '@/stores/ui'
import { useAuth } from '@/hooks/auth/useAuth'
import { queryKeys } from '@/lib/queryKeys'
import { ChatMessage, TypingIndicator } from '@/types/database'

const supabase = createClient()

// Real-time message subscriptions
export function useRealtimeMessages(roomId: string) {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    if (!roomId) return

    // Subscribe to message changes in the specific room
    const channel = supabase
      .channel(`room_messages_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          // Invalidate and refetch messages for this room
          queryClient.invalidateQueries({
            queryKey: queryKeys.chat.messages(roomId)
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, queryClient])
}

// Real-time typing indicators
export function useRealtimeTyping(roomId: string) {
  const { 
    chat: { sessionToken, isAnonymousMode },
    addTypingIndicator,
    removeTypingIndicator,
    clearTypingIndicators
  } = useUIStore()
  const { user } = useAuth()

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!roomId) return

    const channel = supabase.channel(`typing_${roomId}`)
    
    if (isTyping) {
      const indicator: TypingIndicator = {
        room_id: roomId,
        anonymous_user_id: sessionToken, // Using session token as anonymous user ID
        display_name: 'Anonymous User', // We'll use a generic name since we don't have the full anonymous user data here
        timestamp: new Date().toISOString()
      }

      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: indicator
      })
    } else {
      channel.send({
        type: 'broadcast',
        event: 'stop_typing',
        payload: {
          room_id: roomId,
          anonymous_user_id: sessionToken,
        }
      })
    }
  }, [roomId, isAnonymousMode, user, sessionToken])

  useEffect(() => {
    if (!roomId) return

    // Subscribe to typing indicators for this room
    const channel = supabase
      .channel(`typing_${roomId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const indicator = payload.payload as TypingIndicator
        // Don't show typing indicator for current user
        const isCurrentUser = indicator.anonymous_user_id === sessionToken

        if (!isCurrentUser) {
          addTypingIndicator(indicator)
        }
      })
      .on('broadcast', { event: 'stop_typing' }, (payload) => {
        const { anonymous_user_id } = payload.payload
        removeTypingIndicator(anonymous_user_id)
      })
      .subscribe()

    return () => {
      clearTypingIndicators()
      supabase.removeChannel(channel)
    }
  }, [roomId, isAnonymousMode, user, sessionToken, addTypingIndicator, removeTypingIndicator, clearTypingIndicators])

  return { sendTypingIndicator }
}

// Real-time room updates
export function useRealtimeRooms() {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    // Subscribe to room changes
    const channel = supabase
      .channel('chat_rooms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms'
        },
        (payload) => {
          // Invalidate and refetch rooms list
          queryClient.invalidateQueries({
            queryKey: queryKeys.chat.rooms
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}

// Real-time presence for room members
export function useRealtimePresence(roomId: string) {
  const { 
    chat: { sessionToken, isAnonymousMode },
  } = useUIStore()
  const { user } = useAuth()

  useEffect(() => {
    if (!roomId) return

    const channel = supabase.channel(`presence_${roomId}`, {
      config: {
        presence: {
          key: isAnonymousMode ? sessionToken : user?.id || 'unknown',
        },
      },
    })

    // Track presence
    channel
      .on('presence', { event: 'sync' }, () => {
        // Presence synced
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // User joined
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // User left
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return

        // Send presence data
        await channel.track({
          anonymous_user_id: sessionToken,
          display_name: 'Anonymous User',
          joined_at: new Date().toISOString(),
        })
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, isAnonymousMode, user, sessionToken])
}

// Main hook that combines all real-time features
export function useRealtimeChat(roomId: string) {
  // Enable all real-time features
  useRealtimeMessages(roomId)
  useRealtimeRooms()
  const { sendTypingIndicator } = useRealtimeTyping(roomId)
  useRealtimePresence(roomId)

  return {
    sendTypingIndicator
  }
}