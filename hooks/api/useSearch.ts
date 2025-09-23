'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Profile } from '@/types/database'

const supabase = createClient()

// Fetch all profiles for search
async function fetchAllProfiles(): Promise<Profile[]> {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, full_name, bio, skills, avatar_url, updated_at, created_at')
    .not('username', 'is', null)

  return profiles || []
}

// Hook to get all profiles for search - with caching
export function useSearchProfiles() {
  return useQuery({
    queryKey: ['search', 'profiles'],
    queryFn: fetchAllProfiles,
    staleTime: 2 * 60 * 1000, // 2 minutes - search data doesn't change frequently
    retry: 1,
  })
}

