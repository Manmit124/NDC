// Database types - matches your actual Supabase schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
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
