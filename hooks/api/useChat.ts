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
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      anonymous_users:anonymous_user_id (
        id,
        display_name,
        avatar_color
      )
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
  
  if (error) throw error

  // Transform the data to include user information
  const transformedMessages: ChatMessageWithUser[] = (data || []).map(message => ({
    ...message,
    user: message.anonymous_users ? {
      id: message.anonymous_users.id,
      display_name: message.anonymous_users.display_name,
      avatar_color: message.anonymous_users.avatar_color,
      is_anonymous: true
    } : {
      id: 'unknown',
      display_name: 'Unknown User',
      avatar_color: '#6b7280',
      is_anonymous: true
    }
  }))

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
  // First try to find existing anonymous user by user_id if provided
  if (userId) {
    const { data: existing } = await supabase
      .from('anonymous_users')
      .select('*')
      .eq('user_id', userId)
      .eq('room_id', roomId)
      .single()
    
    if (existing) {
      // Update last_seen and session_token for the existing user
      const { data, error } = await supabase
        .from('anonymous_users')
        .update({ 
          last_seen: new Date().toISOString(),
          session_token: sessionToken // Update session token for current session
        })
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
  const anonymousNames = [
    'Anonymous Coder', 'Mystery Developer', 'Secret Hacker', 'Hidden Programmer', 
    'Phantom Builder', 'Shadow Engineer', 'Stealth Creator', 'Ghost Debugger',
    'Ninja Architect', 'Masked Designer', 'Covert Analyst', 'Unknown Genius'
  ]
  
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
  ]
  
  const anonymousUserData: AnonymousUserInsert = {
    user_id: userId, // Link to actual user account if provided
    display_name: anonymousNames[Math.floor(Math.random() * anonymousNames.length)],
    avatar_color: colors[Math.floor(Math.random() * colors.length)],
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