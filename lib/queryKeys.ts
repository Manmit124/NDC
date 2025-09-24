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
  
  // QA related queries
  qa: {
    questions: (filters?: { tag?: string; solved?: boolean; category?: string }) => ['qa', 'questions', filters] as const,
    question: (id: string) => ['qa', 'question', id] as const,
    replies: (questionId: string) => ['qa', 'replies', questionId] as const,
    questionWithReplies: (id: string) => ['qa', 'question-with-replies', id] as const,
  },
} as const
