'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'

interface DashboardStats {
  totalDevelopers: number
}

const supabase = createClient()

// Fetch dashboard stats
async function fetchDashboardStats(): Promise<DashboardStats> {
  // Get total developers count
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id')

  return {
    totalDevelopers: allProfiles?.length || 0,
  }
}

// Hook for dashboard stats - replaces your manual fetching in dashboard
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutes - stats don't change frequently
    retry: 1,
  })
}
