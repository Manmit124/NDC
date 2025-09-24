import { createClient } from '@/utils/supabase/client'

/**
 * Fix reply count for a specific question by counting actual replies
 */
export async function fixQuestionReplyCount(questionId: string) {
  const supabase = createClient()
  
  try {
    console.log('Fixing reply count for question:', questionId)
    
    // Count actual replies for this question
    const { count, error: countError } = await supabase
      .from('qa_messages')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', questionId)
      .eq('is_question', false)

    if (countError) {
      console.error('Error counting replies:', countError)
      throw countError
    }

    console.log('Found', count, 'replies')

    // Update the question's reply count
    const { data, error: updateError } = await supabase
      .from('qa_messages')
      .update({ 
        reply_count: count || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', questionId)
      .select()

    if (updateError) {
      console.error('Error updating reply count:', updateError)
      throw updateError
    }

    console.log('Updated question reply count to:', count)
    return { success: true, count: count || 0, data }
  } catch (error) {
    console.error('Error fixing reply count:', error)
    return { success: false, error }
  }
}

/**
 * Fix reply counts for ALL questions
 */
export async function fixAllReplyCounts() {
  const supabase = createClient()
  
  try {
    console.log('Fixing reply counts for all questions...')
    
    // Get all questions
    const { data: questions, error: questionsError } = await supabase
      .from('qa_messages')
      .select('id, question_title')
      .eq('is_question', true)

    if (questionsError) throw questionsError

    console.log('Found', questions?.length, 'questions')

    let fixed = 0
    
    // Fix each question
    for (const question of questions || []) {
      const result = await fixQuestionReplyCount(question.id)
      if (result.success) {
        fixed++
        console.log(`Fixed "${question.question_title}" - ${result.count} replies`)
      }
    }

    console.log(`Successfully fixed ${fixed} questions`)
    return { success: true, fixed }
  } catch (error) {
    console.error('Error fixing all reply counts:', error)
    return { success: false, error }
  }
}
