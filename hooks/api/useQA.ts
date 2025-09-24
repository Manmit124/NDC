'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { QAMessage, QAMessageInsert } from '@/types/database'
import { queryKeys } from '@/lib/queryKeys'

const supabase = createClient()

// Extended type for QA messages with author profile
export interface QAMessageWithAuthor extends QAMessage {
  profiles: {
    username: string
    full_name: string
    avatar_url?: string
  } | null
}

// Filters for questions
export interface QAFilters {
  tag?: string
  solved?: boolean
  category?: string
}

// Fetch questions with author profiles
async function fetchQuestions(filters?: QAFilters): Promise<QAMessageWithAuthor[]> {
  let query = supabase
    .from('qa_messages')
    .select(`
      *,
      profiles:author_id (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('is_question', true)
    .order('last_reply_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.tag) {
    query = query.contains('tags', [filters.tag])
  }
  
  if (filters?.solved !== undefined) {
    query = query.eq('is_solved', filters.solved)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// Fetch single question with replies
async function fetchQuestionWithReplies(questionId: string): Promise<{
  question: QAMessageWithAuthor
  replies: QAMessageWithAuthor[]
}> {
  // Get question
  const { data: question, error: questionError } = await supabase
    .from('qa_messages')
    .select(`
      *,
      profiles:author_id (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('id', questionId)
    .eq('is_question', true)
    .single()

  if (questionError) throw questionError

  // Get replies
  const { data: replies, error: repliesError } = await supabase
    .from('qa_messages')
    .select(`
      *,
      profiles:author_id (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('parent_id', questionId)
    .eq('is_question', false)
    .order('created_at', { ascending: true })

  if (repliesError) throw repliesError

  // Note: View count tracking removed as requested

  return { question, replies: replies || [] }
}

// Create question
async function createQuestion(data: {
  title: string
  content: string
  tags?: string[]
}): Promise<QAMessage> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: result, error } = await supabase
    .from('qa_messages')
    .insert({
      question_title: data.title,
      content: data.content,
      tags: data.tags || [],
      author_id: user.id,
      is_question: true,
      parent_id: null,
      is_solved: false,
      reply_count: 0,
    })
    .select()
    .single()

  if (error) throw error
  return result
}

// Create reply
async function createReply(data: {
  questionId: string
  content: string
}): Promise<QAMessage> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Create the reply
  const { data: reply, error: replyError } = await supabase
    .from('qa_messages')
    .insert({
      content: data.content,
      author_id: user.id,
      parent_id: data.questionId,
      is_question: false,
      question_title: null,
      tags: null,
      is_solved: false,
      reply_count: 0,
    })
    .select()
    .single()

  if (replyError) throw replyError

  // Update question reply count and last_reply_at
  // First get current reply count
  const { data: currentQuestion, error: fetchError } = await supabase
    .from('qa_messages')
    .select('reply_count')
    .eq('id', data.questionId)
    .single()

  if (fetchError) throw fetchError

  const { error: updateError } = await supabase
    .from('qa_messages')
    .update({ 
      reply_count: (currentQuestion.reply_count || 0) + 1,
      last_reply_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', data.questionId)

  if (updateError) throw updateError

  return reply
}

// Mark question as solved
async function markQuestionSolved(questionId: string, solved: boolean = true): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if user is the question author
  const { data: question, error: checkError } = await supabase
    .from('qa_messages')
    .select('author_id')
    .eq('id', questionId)
    .single()

  if (checkError) throw checkError
  if (question.author_id !== user.id) {
    throw new Error('Only question author can mark as solved')
  }

  const { error } = await supabase
    .from('qa_messages')
    .update({ 
      is_solved: solved,
      updated_at: new Date().toISOString()
    })
    .eq('id', questionId)

  if (error) throw error
}

// Delete question (and all its replies)
async function deleteQuestion(questionId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if user is the question author
  const { data: question, error: checkError } = await supabase
    .from('qa_messages')
    .select('author_id')
    .eq('id', questionId)
    .eq('is_question', true)
    .single()

  if (checkError) throw checkError
  if (question.author_id !== user.id) {
    throw new Error('You can only delete your own questions')
  }

  // Delete all replies first
  const { error: repliesError } = await supabase
    .from('qa_messages')
    .delete()
    .eq('parent_id', questionId)
    .eq('is_question', false)

  if (repliesError) throw repliesError

  // Delete the question
  const { error: questionError } = await supabase
    .from('qa_messages')
    .delete()
    .eq('id', questionId)

  if (questionError) throw questionError
}

// Delete reply
async function deleteReply(replyId: string): Promise<{ questionId: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if user is the reply author and get question ID
  const { data: reply, error: checkError } = await supabase
    .from('qa_messages')
    .select('author_id, parent_id')
    .eq('id', replyId)
    .eq('is_question', false)
    .single()

  if (checkError) throw checkError
  if (reply.author_id !== user.id) {
    throw new Error('You can only delete your own replies')
  }

  // Delete the reply
  const { error: deleteError } = await supabase
    .from('qa_messages')
    .delete()
    .eq('id', replyId)

  if (deleteError) throw deleteError

  // Update question reply count
  const { data: currentQuestion, error: fetchError } = await supabase
    .from('qa_messages')
    .select('reply_count')
    .eq('id', reply.parent_id)
    .single()

  if (fetchError) throw fetchError

  const { error: updateError } = await supabase
    .from('qa_messages')
    .update({ 
      reply_count: Math.max((currentQuestion.reply_count || 0) - 1, 0),
      updated_at: new Date().toISOString()
    })
    .eq('id', reply.parent_id)

  if (updateError) throw updateError

  return { questionId: reply.parent_id }
}

// Get unique tags for filtering
async function fetchTags(): Promise<string[]> {
  const { data, error } = await supabase
    .from('qa_messages')
    .select('tags')
    .eq('is_question', true)
    .not('tags', 'is', null)

  if (error) throw error

  // Flatten and deduplicate tags
  const allTags = data?.flatMap(item => item.tags || []) || []
  return [...new Set(allTags)].sort()
}

// REACT QUERY HOOKS

// Hook to fetch questions
export function useQuestions(filters?: QAFilters) {
  return useQuery({
    queryKey: queryKeys.qa.questions(filters),
    queryFn: () => fetchQuestions(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  })
}

// Hook to fetch question with replies
export function useQuestionWithReplies(questionId: string) {
  return useQuery({
    queryKey: queryKeys.qa.questionWithReplies(questionId),
    queryFn: () => fetchQuestionWithReplies(questionId),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 1,
    enabled: !!questionId,
  })
}

// Hook to fetch available tags
export function useTags() {
  return useQuery({
    queryKey: ['qa', 'tags'],
    queryFn: fetchTags,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  })
}

// Hook to create question
export function useCreateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      // Invalidate questions list to show new question
      queryClient.invalidateQueries({ queryKey: ['qa', 'questions'] })
      queryClient.invalidateQueries({ queryKey: ['qa', 'tags'] })
    },
  })
}

// Hook to create reply
export function useCreateReply() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createReply,
    onSuccess: (_, variables) => {
      // Invalidate the specific question to show new reply
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.qa.questionWithReplies(variables.questionId) 
      })
      // Invalidate questions list to update reply count
      queryClient.invalidateQueries({ queryKey: ['qa', 'questions'] })
    },
  })
}

// Hook to mark question as solved
export function useMarkQuestionSolved() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ questionId, solved }: { questionId: string; solved?: boolean }) =>
      markQuestionSolved(questionId, solved),
    onSuccess: (_, variables) => {
      // Invalidate the specific question
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.qa.questionWithReplies(variables.questionId) 
      })
      // Invalidate questions list to update solved status
      queryClient.invalidateQueries({ queryKey: ['qa', 'questions'] })
    },
  })
}

// Hook to delete question
export function useDeleteQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      // Invalidate questions list to remove deleted question
      queryClient.invalidateQueries({ queryKey: ['qa', 'questions'] })
      queryClient.invalidateQueries({ queryKey: ['qa', 'tags'] })
    },
  })
}

// Hook to delete reply
export function useDeleteReply() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteReply,
    onSuccess: (data) => {
      // Invalidate the specific question to update reply count and remove reply
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.qa.questionWithReplies(data.questionId) 
      })
      // Invalidate questions list to update reply count
      queryClient.invalidateQueries({ queryKey: ['qa', 'questions'] })
    },
  })
}
