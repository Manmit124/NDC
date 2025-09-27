'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Resource, ResourceInsert, ResourceUpdate } from '@/types/database'

const supabase = createClient()

// Fetch all resources with optional filtering
async function fetchResources(filters?: {
  category?: string
  search?: string
}): Promise<Resource[]> {
  let query = supabase
    .from('resources')
    .select(`
      *,
      profiles:submitted_by(username, full_name)
    `)
    .order('created_at', { ascending: false })

  // Apply category filter
  if (filters?.category && filters.category !== 'All') {
    query = query.eq('category', filters.category)
  }

  // Apply search filter
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

// Fetch single resource by id
async function fetchResourceById(id: string): Promise<Resource | null> {
  const { data, error } = await supabase
    .from('resources')
    .select(`
      *,
      profiles:submitted_by(username, full_name)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Create new resource
async function createResource(resource: ResourceInsert): Promise<Resource> {
  const { data, error } = await supabase
    .from('resources')
    .insert({
      ...resource,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Update existing resource
async function updateResource(id: string, updates: ResourceUpdate): Promise<Resource> {
  const { data, error } = await supabase
    .from('resources')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete resource
async function deleteResource(id: string): Promise<void> {
  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Hook to get all resources with filtering
export function useResources(filters?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ['resources', filters],
    queryFn: () => fetchResources(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

// Hook to get single resource by id
export function useResource(id: string) {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: () => fetchResourceById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Hook to create new resource
export function useCreateResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createResource,
    
    onSuccess: (newResource) => {
      // Invalidate and refetch resources list
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      
      // Add the new resource to existing cache if possible
      queryClient.setQueryData(['resource', newResource.id], newResource)
    },
  })
}

// Hook to update resource
export function useUpdateResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ResourceUpdate }) =>
      updateResource(id, updates),
    
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['resource', id] })
      
      // Snapshot previous value
      const previousResource = queryClient.getQueryData(['resource', id])
      
      // Optimistically update resource
      queryClient.setQueryData(['resource', id], (oldData: Resource | undefined) => {
        if (oldData) {
          return { ...oldData, ...updates }
        }
        return oldData
      })
      
      return { previousResource }
    },
    
    onError: (err, { id }, context) => {
      // Rollback optimistic update
      if (context?.previousResource) {
        queryClient.setQueryData(['resource', id], context.previousResource)
      }
    },
    
    onSettled: (data, error, { id }) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['resource', id] })
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })
}

// Hook to delete resource
export function useDeleteResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteResource,
    
    onSuccess: (_, deletedId) => {
      // Remove from cache and invalidate resources list
      queryClient.removeQueries({ queryKey: ['resource', deletedId] })
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })
}
