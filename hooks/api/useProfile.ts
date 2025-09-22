'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Profile } from '@/types/database'

const supabase = createClient()

// Fetch profile by username
async function fetchProfileByUsername(username: string): Promise<Profile | null> {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)

  return profiles && profiles.length > 0 ? profiles[0] : null
}

// Update profile
async function updateProfile(profileId: string, updates: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', profileId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Hook to get profile by username - replaces your manual fetching
export function useProfile(username: string) {
  return useQuery({
    queryKey: ['profile', 'username', username],
    queryFn: () => fetchProfileByUsername(username),
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

// Hook to update profile - with optimistic updates
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ profileId, updates }: { profileId: string; updates: Partial<Profile> }) =>
      updateProfile(profileId, updates),
    
    onMutate: async ({ profileId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['profile'] })
      
      // Snapshot previous values
      const previousProfiles = queryClient.getQueriesData({ queryKey: ['profile'] })
      
      // Optimistically update profile data
      queryClient.setQueriesData(
        { queryKey: ['profile'] },
        (oldData: Profile | undefined) => {
          if (oldData && oldData.id === profileId) {
            return { ...oldData, ...updates }
          }
          return oldData
        }
      )
      
      // Also update auth cache if it's the current user's profile
      queryClient.setQueryData(['auth'], (oldData: any) => {
        if (oldData?.profile?.id === profileId) {
          return {
            ...oldData,
            profile: { ...oldData.profile, ...updates }
          }
        }
        return oldData
      })
      
      return { previousProfiles }
    },
    
    onError: (err, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousProfiles) {
        context.previousProfiles.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    
    onSettled: (data, error, { profileId }) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}
