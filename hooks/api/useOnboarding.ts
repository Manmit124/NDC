'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Profile, ProfileInsert, ProfileUpdate } from '@/types/database'

const supabase = createClient()

// Update profile with additional info (Step 2 & 3)
async function updateProfile(data: {
  id: string
  updates: ProfileUpdate
}): Promise<Profile> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .update({
      ...data.updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', data.id)
    .select()
    .single()

  if (error) throw error
  return profile
}

// Complete onboarding with all data
async function completeOnboarding(data: {
  id: string
  username: string
  fullName: string
  bio?: string
  skills?: string[]
  githubUrl?: string
  linkedinUrl?: string
  portfolioUrl?: string
}): Promise<Profile> {
  const normalizeUrl = (url: string) => {
    if (!url) return undefined
    return url.startsWith('http') ? url : `https://${url}`
  }

  const profileData: ProfileInsert = {
    id: data.id,
    username: data.username.toLowerCase(),
    full_name: data.fullName,
    bio: data.bio?.trim() || undefined,
    skills: data.skills && data.skills.length > 0 ? data.skills : undefined,
    github_url: data.githubUrl ? normalizeUrl(data.githubUrl) : undefined,
    linkedin_url: data.linkedinUrl ? normalizeUrl(data.linkedinUrl) : undefined,
    portfolio_url: data.portfolioUrl ? normalizeUrl(data.portfolioUrl) : undefined,
    updated_at: new Date().toISOString()
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .upsert(profileData)
    .select()
    .single()

  if (error) throw error
  return profile
}

// Check username availability
async function checkUsernameAvailability(username: string): Promise<boolean> {
  if (!username || username.length < 3) {
    return false
  }

  const { data } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username.toLowerCase())

  // Username is available if no data is returned
  return !data || data.length === 0
}

// Hook to update profile (Steps 2 & 3)
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      // Invalidate auth queries to refetch user profile
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
    onError: (error) => {
      console.error('Update profile error:', error)
    }
  })
}

// Hook to complete full onboarding process
export function useCompleteOnboarding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      // Invalidate auth queries to refetch user profile
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
    onError: (error) => {
      console.error('Complete onboarding error:', error)
    }
  })
}

// Hook to check username availability
export function useCheckUsername() {
  return useMutation({
    mutationFn: checkUsernameAvailability,
    onError: (error) => {
      console.error('Username check error:', error)
    }
  })
}