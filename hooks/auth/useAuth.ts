'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/types/database'
import { getURL } from '@/utils/getURL'

interface AuthData {
  user: User | null
  profile: Profile | null
}

const supabase = createClient()

// Get current auth data
async function getAuthData(): Promise<AuthData> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { user: null, profile: null }
  }

  // Get user profile
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)

  const profile = profiles && profiles.length > 0 ? profiles[0] : null

  return { user, profile }
}

// Login function
async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}

// Signup function
async function signupUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getURL()
    }
  })
  
  if (error) throw error
  return data
}

// Logout function
async function logoutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Main auth hook - replaces the manual useEffect patterns
export function useAuth() {
  const queryClient = useQueryClient()
  const router = useRouter()

  // Get auth data with caching
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['auth'],
    queryFn: getAuthData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      loginUser(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      // Let the component handle navigation
    },
    onError: (error) => {
      console.error('Login error:', error)
    }
  })

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      signupUser(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      // Let the component handle navigation
    },
    onError: (error) => {
      console.error('Signup error:', error)
    }
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear() // Clear all cached data
      router.push('/login')
    }
  })

  return {
    // Data
    user: data?.user || null,
    profile: data?.profile || null,
    isAuthenticated: !!data?.user,
    
    // Loading states
    isLoading,
    isLoggingIn: loginMutation.isPending,
    isSigningUp: signupMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    
    // Actions
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout: logoutMutation.mutate,
    refetch,
    
    // Errors
    error,
    loginError: loginMutation.error,
    signupError: signupMutation.error,
    logoutError: logoutMutation.error,
  }
}

// Hook for checking if user needs onboarding - matches your current pattern
export function useOnboardingCheck() {
  const { user, profile, isLoading } = useAuth()
  
  const needsOnboarding = user && (!profile?.username)
  
  return {
    needsOnboarding,
    isLoading,
    user,
    profile
  }
}
