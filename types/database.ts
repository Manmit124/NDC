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

export interface QAMessageInsert extends Omit<QAMessage, 'id' | 'created_at' | 'updated_at' | 'reply_count' | 'views_count' | 'last_reply_at'> {
  id?: string
  reply_count?: number
  views_count?: number
  last_reply_at?: string | null
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
