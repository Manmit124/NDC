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

  // Chat related queries
  chat: {
    rooms: ['chat', 'rooms'] as const,
    messages: (roomId: string) => ['chat', 'messages', roomId] as const,
    room: (roomId: string) => ['chat', 'room', roomId] as const,
    anonymousUser: (sessionToken: string) => ['chat', 'anonymous', sessionToken] as const,
  },
  
  // Resources related queries
  resources: {
    list: (filters?: { category?: string; tag?: string }) => ['resources', 'list', filters] as const,
    byId: (id: string) => ['resources', 'id', id] as const,
  },
  
  // Blog related queries
  blogs: {
    published: (filters?: { tag?: string }) => ['blogs', 'published', filters] as const,
    bySlug: (slug: string) => ['blogs', 'slug', slug] as const,
    byAuthor: (authorId: string, includeUnpublished?: boolean) => ['blogs', 'author', authorId, includeUnpublished] as const,
    byId: (id: string) => ['blogs', 'id', id] as const,
    slugs: ['blogs', 'slugs'] as const,
  },
} as const
