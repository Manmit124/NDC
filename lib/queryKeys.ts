// Centralized query keys for consistent caching
export const queryKeys = {
  // Auth related queries
  auth: ['auth'] as const,
  
  // Profile related queries
  profile: {
    byUsername: (username: string) => ['profile', 'username', username] as const,
    byId: (id: string) => ['profile', 'id', id] as const,
  },
  
  // Dashboard related queries (just for profile count)
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
  },
} as const
