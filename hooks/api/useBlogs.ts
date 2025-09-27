'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Blog, BlogInsert, BlogUpdate, BlogWithAuthor } from '@/types/database'
import { queryKeys } from '@/lib/queryKeys'

const supabase = createClient()

// Utility function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

// Utility function to estimate reading time
function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

// Fetch all published blogs for public listing
async function fetchPublishedBlogs(filters?: { tag?: string }): Promise<BlogWithAuthor[]> {
  let query = supabase
    .from('blogs')
    .select(`
      *,
      author:profiles!blogs_author_id_fkey(
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (filters?.tag) {
    query = query.contains('tags', [filters.tag])
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

// Fetch single blog by slug
async function fetchBlogBySlug(slug: string): Promise<BlogWithAuthor | null> {
  const { data, error } = await supabase
    .from('blogs')
    .select(`
      *,
      author:profiles!blogs_author_id_fkey(
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data
}

// Fetch blogs by author (for user's blog admin)
async function fetchBlogsByAuthor(authorId: string, includeUnpublished = false): Promise<Blog[]> {
  let query = supabase
    .from('blogs')
    .select('*')
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })

  if (!includeUnpublished) {
    query = query.eq('published', true)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

// Fetch single blog by ID (for editing)
async function fetchBlogById(id: string): Promise<Blog | null> {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data
}

// Create new blog
async function createBlog(blogData: Omit<BlogInsert, 'slug' | 'read_time_minutes'>): Promise<Blog> {
  const slug = generateSlug(blogData.title)
  const readTime = estimateReadingTime(blogData.content)
  
  const { data, error } = await supabase
    .from('blogs')
    .insert({
      ...blogData,
      slug,
      read_time_minutes: readTime,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Update existing blog
async function updateBlog(id: string, updates: Partial<BlogUpdate>): Promise<Blog> {
  const updateData: BlogUpdate = { ...updates }
  
  // Regenerate slug if title changed
  if (updates.title) {
    updateData.slug = generateSlug(updates.title)
  }
  
  // Recalculate reading time if content changed
  if (updates.content) {
    updateData.read_time_minutes = estimateReadingTime(updates.content)
  }

  // Set published_at when publishing
  if (updates.published && !updates.published_at) {
    updateData.published_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('blogs')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete blog
async function deleteBlog(id: string): Promise<void> {
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Get all blog slugs (for static generation)
async function fetchAllBlogSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('blogs')
    .select('slug')
    .eq('published', true)

  if (error) throw error
  return data?.map(blog => blog.slug) || []
}

// HOOKS

// Get published blogs for public listing
export function usePublishedBlogs(filters?: { tag?: string }) {
  return useQuery({
    queryKey: queryKeys.blogs.published(filters),
    queryFn: () => fetchPublishedBlogs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

// Get blog by slug for public viewing
export function useBlogBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.blogs.bySlug(slug),
    queryFn: () => fetchBlogBySlug(slug),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    enabled: !!slug,
  })
}

// Get blogs by author for user's blog admin
export function useBlogsByAuthor(authorId: string, includeUnpublished = true) {
  return useQuery({
    queryKey: queryKeys.blogs.byAuthor(authorId, includeUnpublished),
    queryFn: () => fetchBlogsByAuthor(authorId, includeUnpublished),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    enabled: !!authorId,
  })
}

// Get blog by ID for editing
export function useBlogById(id: string) {
  return useQuery({
    queryKey: queryKeys.blogs.byId(id),
    queryFn: () => fetchBlogById(id),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 1,
    enabled: !!id,
  })
}

// Get all blog slugs for static generation
export function useAllBlogSlugs() {
  return useQuery({
    queryKey: queryKeys.blogs.slugs,
    queryFn: fetchAllBlogSlugs,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  })
}

// Create blog mutation
export function useCreateBlog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBlog,
    onSuccess: (newBlog) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.byAuthor(newBlog.author_id, true) })
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.published() })
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.slugs })
    },
  })
}

// Update blog mutation
export function useUpdateBlog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<BlogUpdate> }) =>
      updateBlog(id, updates),
    onSuccess: (updatedBlog) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.byId(updatedBlog.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.bySlug(updatedBlog.slug) })
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.byAuthor(updatedBlog.author_id, true) })
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.published() })
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.slugs })
    },
  })
}

// Delete blog mutation
export function useDeleteBlog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => {
      // Invalidate all blog queries
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    },
  })
}
