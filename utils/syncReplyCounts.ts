import { createClient } from '@/utils/supabase/client'

/**
 * Utility function to sync reply counts for all questions
 * This can be called manually if reply counts get out of sync
 */
export async function syncReplyCounts() {
  const supabase = createClient()
  
  try {
    // Get all questions
    const { data: questions, error: questionsError } = await supabase
      .from('qa_messages')
      .select('id')
      .eq('is_question', true)

    if (questionsError) throw questionsError

    // Update each question's reply count
    for (const question of questions || []) {
      // Count replies for this question
      const { count, error: countError } = await supabase
        .from('qa_messages')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', question.id)
        .eq('is_question', false)

      if (countError) throw countError

      // Update the question's reply count
      const { error: updateError } = await supabase
        .from('qa_messages')
        .update({ 
          reply_count: count || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', question.id)

      if (updateError) throw updateError
    }

    console.log('Reply counts synced successfully')
    return { success: true }
  } catch (error) {
    console.error('Error syncing reply counts:', error)
    return { success: false, error }
  }
}

/**
 * Sync reply count for a specific question
 */
export async function syncQuestionReplyCount(questionId: string) {
  const supabase = createClient()
  
  try {
    // Count replies for this question
    const { count, error: countError } = await supabase
      .from('qa_messages')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', questionId)
      .eq('is_question', false)

    if (countError) throw countError

    // Update the question's reply count
    const { error: updateError } = await supabase
      .from('qa_messages')
      .update({ 
        reply_count: count || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', questionId)

    if (updateError) throw updateError

    return { success: true, count: count || 0 }
  } catch (error) {
    console.error('Error syncing question reply count:', error)
    return { success: false, error }
  }
}
