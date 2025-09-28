'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { 
  ChatRoom, 
  ChatRoomInsert, 
  ChatMessage, 
  ChatMessageInsert, 
  ChatMessageWithUser,
  AnonymousUser,
  AnonymousUserInsert 
} from '@/types/database'
import { queryKeys } from '@/lib/queryKeys'

const supabase = createClient()

// =====================================================
// FETCH FUNCTIONS
// =====================================================

// Fetch all chat rooms
async function fetchChatRooms(): Promise<ChatRoom[]> {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Fetch messages for a specific room with user information
async function fetchMessages(roomId: string): Promise<ChatMessageWithUser[]> {
  // First get room details to know if it's anonymous
  const { data: room } = await supabase
    .from('chat_rooms')
    .select('is_anonymous')
    .eq('id', roomId)
    .single()

  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      anonymous_users:anonymous_user_id (
        id,
        user_id,
        display_name,
        avatar_color
      ),
      replied_message:reply_to (
        id,
        content,
        message_type,
        created_at,
        anonymous_users:anonymous_user_id (
          id,
          user_id,
          display_name,
          avatar_color
        )
      )
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
  
  if (error) throw error

  // For identity rooms, we need to fetch actual usernames from profiles
  let profilesMap = new Map()
  
  if (!room?.is_anonymous) {
    // Collect all unique user_ids that need profile data
    const userIds = new Set()
    data?.forEach(message => {
      if (message.anonymous_users?.user_id) {
        userIds.add(message.anonymous_users.user_id)
      }
      if (message.replied_message?.anonymous_users?.user_id) {
        userIds.add(message.replied_message.anonymous_users.user_id)
      }
    })

    // Fetch profiles for all users at once
    if (userIds.size > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', Array.from(userIds))

      // Create a map for quick lookup
      profiles?.forEach(profile => {
        profilesMap.set(profile.id, profile)
      })
    }
  }

  // Transform the data to include user information
  const transformedMessages: ChatMessageWithUser[] = (data || []).map(message => {
    let userDisplayInfo
    
    if (message.anonymous_users) {
      if (room?.is_anonymous) {
        // For anonymous rooms, always use the anonymous display name
        userDisplayInfo = {
          id: message.anonymous_users.id,
          display_name: message.anonymous_users.display_name,
          avatar_color: message.anonymous_users.avatar_color,
          is_anonymous: true
        }
      } else {
        // For identity rooms, use real username from profiles if available
        const profile = message.anonymous_users.user_id ? profilesMap.get(message.anonymous_users.user_id) : null
        if (profile?.username) {
          userDisplayInfo = {
            id: message.anonymous_users.user_id,
            display_name: profile.username,
            avatar_color: '#3B82F6', // Blue for identified users
            avatar_url: profile.avatar_url,
            is_anonymous: false
          }
        } else {
          // No profile found or incomplete profile
          userDisplayInfo = {
            id: message.anonymous_users.user_id || message.anonymous_users.id,
            display_name: 'Profile Required',
            avatar_color: '#EF4444', // Red to indicate profile needed
            is_anonymous: false
          }
        }
      }
    } else {
      // Fallback for missing user data
      userDisplayInfo = {
        id: 'unknown',
        display_name: 'Unknown User',
        avatar_color: '#6b7280',
        is_anonymous: room?.is_anonymous ?? true
      }
    }

    const transformedMessage: ChatMessageWithUser = {
      ...message,
      user: userDisplayInfo
    }

    // Add replied message data if this is a reply
    if (message.replied_message && message.replied_message.anonymous_users) {
      let repliedUserInfo
      
      if (room?.is_anonymous) {
        // For anonymous rooms, use anonymous display name
        repliedUserInfo = {
          id: message.replied_message.anonymous_users.id,
          display_name: message.replied_message.anonymous_users.display_name,
          avatar_color: message.replied_message.anonymous_users.avatar_color,
          is_anonymous: true
        }
      } else {
        // For identity rooms, use real username from profiles if available
        const repliedProfile = message.replied_message.anonymous_users.user_id ? 
          profilesMap.get(message.replied_message.anonymous_users.user_id) : null
        if (repliedProfile?.username) {
          repliedUserInfo = {
            id: message.replied_message.anonymous_users.user_id,
            display_name: repliedProfile.username,
            avatar_color: '#3B82F6', // Blue for identified users
            avatar_url: repliedProfile.avatar_url,
            is_anonymous: false
          }
        } else {
          repliedUserInfo = {
            id: message.replied_message.anonymous_users.user_id || message.replied_message.anonymous_users.id,
            display_name: 'Profile Required',
            avatar_color: '#EF4444', // Red to indicate profile needed
            is_anonymous: false
          }
        }
      }

      transformedMessage.replied_message = {
        id: message.replied_message.id,
        content: message.replied_message.content,
        message_type: message.replied_message.message_type,
        created_at: message.replied_message.created_at,
        user: repliedUserInfo
      }
    }

    return transformedMessage
  })

  return transformedMessages
}

// Fetch single room details
async function fetchRoom(roomId: string): Promise<ChatRoom> {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('id', roomId)
    .single()
  
  if (error) throw error
  return data
}

// Create or get anonymous user
async function getOrCreateAnonymousUser(
  roomId: string, 
  sessionToken: string, 
  userId?: string
): Promise<AnonymousUser> {
  // Get room details to check if it's anonymous
  const { data: room } = await supabase
    .from('chat_rooms')
    .select('is_anonymous')
    .eq('id', roomId)
    .single()

  // // First try to find existing anonymous user by user_id if provided
  if (userId) {
    const { data: existing } = await supabase
      .from('anonymous_users')
      .select('*')
      .eq('user_id', userId)
      .eq('room_id', roomId)
      .single()
    
    if (existing) {
      // Update last_seen and session_token for the existing user
      let updateData: { last_seen: string; session_token: string; display_name?: string; avatar_color?: string } = {
        last_seen: new Date().toISOString(),
        session_token: sessionToken
      }

      // Handle display name based on room type
      if (room?.is_anonymous) {
        // For anonymous rooms, keep the existing anonymous name - don't update display name
        // This ensures consistency and anonymity
      } else {
        // For identity rooms, always update display name to real username
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', userId)
          .single()
        
        if (profile?.username) {
          updateData.display_name = profile.username
          updateData.avatar_color = '#3B82F6' // Blue for identified users
        } else {
          // User exists but no profile - needs onboarding
          updateData.display_name = 'Profile Required'
          updateData.avatar_color = '#EF4444' // Red to indicate profile required
        }
      }

      const { data, error } = await supabase
        .from('anonymous_users')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  }

  // Fallback: try to find existing anonymous user by session_token (for backwards compatibility)
  const { data: existing } = await supabase
    .from('anonymous_users')
    .select('*')
    .eq('session_token', sessionToken)
    .eq('room_id', roomId)
    .single()
  
  if (existing) {
    // Update last_seen and optionally link to user_id if not already linked
    const updateData: { last_seen: string; user_id?: string } = {
      last_seen: new Date().toISOString()
    }
    
    // Link to user_id if provided and not already linked
    if (userId && !existing.user_id) {
      updateData.user_id = userId
    }
    
    const { data, error } = await supabase
      .from('anonymous_users')
      .update(updateData)
      .eq('id', existing.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
  
  // Create new anonymous user
  let displayName: string
  let avatarColor: string

  if (room?.is_anonymous) {
    // For anonymous rooms, ALWAYS use random anonymous names regardless of user authentication
    const anonymousNames = [
      'Anonymous Coder', 'Mystery Developer', 'Secret Hacker', 'Hidden Programmer', 
      'Phantom Builder', 'Shadow Engineer', 'Stealth Creator', 'Ghost Debugger',
      'Ninja Architect', 'Masked Designer', 'Covert Analyst', 'Unknown Genius',
      'Silent Scripter', 'Enigma Engineer', 'Cipher Coder', 'Veiled Validator',
      'Incognito Innovator', 'Disguised Developer', 'Nameless Navigator', 'Faceless Full-Stack'
    ]
    
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
    ]
    
    displayName = anonymousNames[Math.floor(Math.random() * anonymousNames.length)]
    avatarColor = colors[Math.floor(Math.random() * colors.length)]
  } else {
    // For identity rooms, try to get user's real profile data
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', userId)
        .single()
      
      if (profile?.username) {
        displayName = profile.username
        avatarColor = '#3B82F6' // Blue for identified users
      } else {
        // User exists but no profile - this will trigger onboarding prompt
        displayName = 'Profile Required'
        avatarColor = '#EF4444' // Red to indicate profile required
      }
    } else {
      // No userId provided for identity room - fallback to guest name
      displayName = 'Guest User'
      avatarColor = '#6B7280' // Gray for guest users
    }
  }
  const anonymousUserData: AnonymousUserInsert = {
    // user_id: userId, // Link to actual user account if provided
    display_name: displayName,
    avatar_color: avatarColor,
    session_token: sessionToken,
    room_id: roomId,
    last_seen: new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from('anonymous_users')
    .insert(anonymousUserData)
    .select()
    .single()

  if (error) throw error
  return data
}

// Check if user has completed their profile
async function checkUserProfile(userId: string): Promise<{ hasProfile: boolean; username?: string }> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name')
    .eq('id', userId)
    .single()
  
  return {
    hasProfile: !!(profile?.username),
    username: profile?.username || undefined
  }
}

// =====================================================
// MUTATION FUNCTIONS
// =====================================================

// Send a message
async function sendMessage({
  roomId,
  content,
  messageType = 'text',
  anonymousUserId,
  replyTo
}: {
  roomId: string
  content: string
  messageType?: 'text' | 'image' | 'file' | 'code'
  anonymousUserId: string
  replyTo?: string
}): Promise<ChatMessage> {
  const messageData: ChatMessageInsert = {
    room_id: roomId,
    content,
    message_type: messageType,
    anonymous_user_id: anonymousUserId,
    reply_to: replyTo
  }
  
  const { data, error } = await supabase
    .from('chat_messages')
    .insert(messageData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Create a chat room
async function createRoom({
  name,
  description,
  isAnonymous = false,
  maxMembers,
  createdBy
}: {
  name: string
  description?: string
  isAnonymous?: boolean
  maxMembers?: number
  createdBy: string
}): Promise<ChatRoom> {
  const roomData: ChatRoomInsert = {
    name,
    description,
    is_anonymous: isAnonymous,
    max_members: maxMembers,
    created_by: createdBy
  }
  
  const { data, error } = await supabase
    .from('chat_rooms')
    .insert(roomData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Delete a message (only by sender)
async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('id', messageId)
  
  if (error) throw error
}

// Edit a message
async function editMessage(messageId: string, content: string): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .update({ 
      content, 
      edited_at: new Date().toISOString() 
    })
    .eq('id', messageId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// =====================================================
// REACT QUERY HOOKS
// =====================================================

// Get all chat rooms
export function useChatRooms() {
  return useQuery({
    queryKey: queryKeys.chat.rooms,
    queryFn: fetchChatRooms,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  })
}

// Get messages for a room
export function useMessages(roomId: string) {
  return useQuery({
    queryKey: queryKeys.chat.messages(roomId),
    queryFn: () => fetchMessages(roomId),
    staleTime: 30 * 1000, // 30 seconds (messages update frequently)
    retry: 1,
    enabled: !!roomId,
  })
}

// Get single room
export function useRoom(roomId: string) {
  return useQuery({
    queryKey: queryKeys.chat.room(roomId),
    queryFn: () => fetchRoom(roomId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!roomId,
  })
}

// Get or create anonymous user
export function useAnonymousUser(roomId: string, sessionToken: string, userId?: string) {
  return useQuery({
    queryKey: queryKeys.chat.anonymousUser(sessionToken),
    queryFn: () => getOrCreateAnonymousUser(roomId, sessionToken, userId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    enabled: !!roomId && !!sessionToken,
  })
}

// Check if user has completed profile
export function useUserProfile(userId?: string) {
  return useQuery({
    queryKey: ['user', 'profile', userId],
    queryFn: () => checkUserProfile(userId!),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!userId,
  })
}

// =====================================================
// MUTATION HOOKS
// =====================================================

// Send message mutation
export function useSendMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (data) => {
      // Invalidate messages for the room
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.chat.messages(data.room_id) 
      })
    },
  })
}

// Create room mutation
export function useCreateRoom() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      // Invalidate rooms list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.chat.rooms 
      })
    },
  })
}

// Delete message mutation
export function useDeleteMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteMessage,
    onSuccess: (_, messageId) => {
      // Invalidate all message queries (we don't know which room it belonged to)
      queryClient.invalidateQueries({ 
        queryKey: ['chat', 'messages'] 
      })
    },
  })
}

// Edit message mutation
export function useEditMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      editMessage(messageId, content),
    onSuccess: (data) => {
      // Invalidate messages for the room
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.chat.messages(data.room_id) 
      })
    },
  })
}