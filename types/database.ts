// Database types - matches your actual Supabase schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      qa_messages: {
        Row: QAMessage
        Insert: QAMessageInsert
        Update: QAMessageUpdate
      }
      resources: {
        Row: Resource
        Insert: ResourceInsert
        Update: ResourceUpdate
      }
      chat_rooms: {
        Row: ChatRoom
        Insert: ChatRoomInsert
        Update: ChatRoomUpdate
      }
      chat_messages: {
        Row: ChatMessage
        Insert: ChatMessageInsert
        Update: ChatMessageUpdate
      }
      anonymous_users: {
        Row: AnonymousUser
        Insert: AnonymousUserInsert
        Update: AnonymousUserUpdate
      }
      blogs: {
        Row: Blog
        Insert: BlogInsert
        Update: BlogUpdate
      }
    }
  }
}

// Profile types - based on your actual table structure
export interface Profile {
  id: string
  username: string
  full_name: string
  avatar_url?: string
  bio?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  skills?: string[]
  updated_at: string
  created_at: string
}

export interface ProfileInsert extends Omit<Profile, 'updated_at' | 'created_at'> {
  updated_at?: string
  created_at?: string
}

export interface ProfileUpdate extends Partial<Omit<Profile, 'id'>> {
  updated_at?: string
}

// QA Message types - based on your qa_messages table structure
export interface QAMessage {
  id: string
  content: string
  author_id: string
  parent_id: string | null  // NULL for questions, question_id for replies
  is_question: boolean
  question_title: string | null  // only for questions
  tags: string[] | null  // for question categorization
  is_solved: boolean
  reply_count: number
  last_reply_at: string | null
  views_count: number
  created_at: string
  updated_at: string
}
// Chat Room types
export interface ChatRoom {
  id: string
  name: string
  description?: string
  is_anonymous: boolean
  max_members?: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface QAMessageInsert extends Omit<QAMessage, 'id' | 'created_at' | 'updated_at' | 'reply_count' | 'views_count' | 'last_reply_at'> {
  id?: string
  reply_count?: number
  views_count?: number
  last_reply_at?: string | null
}

export interface ChatRoomInsert extends Omit<ChatRoom, 'id' | 'created_at' | 'updated_at'> {
  id?: string
  created_at?: string
  updated_at?: string
}

export interface QAMessageUpdate extends Partial<Omit<QAMessage, 'id' | 'created_at'>> {
  updated_at?: string
}

// Resource types - for open source software and free resources
export interface Resource {
  id: string
  title: string
  url: string
  description?: string
  category: string
  tags: string[]
  submitted_by?: string
  created_at: string
  updated_at: string
}

export interface ResourceInsert extends Omit<Resource, 'id' | 'created_at' | 'updated_at'> {
  id?: string
  created_at?: string
  updated_at?: string
}

export interface ResourceUpdate extends Partial<Omit<Resource, 'id' | 'created_at'>> {
  updated_at?: string
}

// Resource categories
export const RESOURCE_CATEGORIES = [
  'Frontend',
  'Backend', 
  'Database',
  'DevOps',
  'Mobile',
  'Design',
  'Testing',
  'AI/ML',
  'Blockchain',
  'Security',
  'Productivity',
  'Learning',
  'Other'
] as const;

export type ResourceCategory = typeof RESOURCE_CATEGORIES[number];
export interface ChatRoomUpdate extends Partial<Omit<ChatRoom, 'id' | 'created_at'>> {
  updated_at?: string
}

// Chat Message types
export interface ChatMessage {
  id: string
  room_id: string
  content: string
  message_type: 'text' | 'image' | 'file' | 'code'
  anonymous_user_id: string // all messages are linked to anonymous users
  reply_to?: string // for threaded replies
  edited_at?: string
  created_at: string
  updated_at: string
}

export interface ChatMessageInsert extends Omit<ChatMessage, 'id' | 'created_at' | 'updated_at'> {
  id?: string
  created_at?: string
  updated_at?: string
}

export interface ChatMessageUpdate extends Partial<Omit<ChatMessage, 'id' | 'created_at'>> {
  updated_at?: string
}

// Anonymous User types for pseudonymous chat
export interface AnonymousUser {
  id: string
  user_id?: string // Links anonymous identity to actual user account
  display_name: string
  avatar_color: string
  session_token: string
  room_id: string
  last_seen: string
  created_at: string
}

export interface AnonymousUserInsert extends Omit<AnonymousUser, 'id' | 'created_at'> {
  id?: string
  created_at?: string
}

export interface AnonymousUserUpdate extends Partial<Omit<AnonymousUser, 'id' | 'created_at'>> {}

// Enhanced message type with user information
export interface ChatMessageWithUser extends ChatMessage {
  anonymous_users?: Pick<AnonymousUser, 'id' | 'display_name' | 'avatar_color'>
  user?: {
    id: string
    display_name: string
    avatar_color?: string
    avatar_url?: string
    is_anonymous: boolean
  }
  replied_message?: {
    id: string
    content: string
    message_type: 'text' | 'image' | 'file' | 'code'
    created_at: string
    anonymous_users?: Pick<AnonymousUser, 'id' | 'display_name' | 'avatar_color'>
    user?: {
      id: string
      display_name: string
      avatar_color?: string
      avatar_url?: string
      is_anonymous: boolean
    }
  }
}

// Typing indicator type for real-time features
export interface TypingIndicator {
  room_id: string
  anonymous_user_id: string
  display_name: string
  timestamp: string
}
// Blog types - for developer blog posts
export interface Blog {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  author_id: string
  published: boolean
  featured_image_url?: string
  meta_title?: string
  meta_description?: string
  tags: string[]
  read_time_minutes: number
  published_at?: string
  created_at: string
  updated_at: string
}

export interface BlogInsert extends Omit<Blog, 'id' | 'created_at' | 'updated_at'> {
  id?: string
  created_at?: string
  updated_at?: string
}

export interface BlogUpdate extends Partial<Omit<Blog, 'id' | 'created_at'>> {
  updated_at?: string
}

// Blog with author info (for listings)
export interface BlogWithAuthor extends Blog {
  author: {
    username: string
    full_name: string
    avatar_url?: string
  }
}
