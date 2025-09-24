'use client'

import { useQuestions } from '@/hooks/api/useQA'
import { useUIStore } from '@/stores/ui'
import { QuestionCard } from './QuestionCard'
import { Button } from '@/components/ui/button'
import { Loader2, MessageSquare, Plus, RefreshCw } from 'lucide-react'

export function QuestionsList() {
  const { qaFilters, openAskQuestionModal } = useUIStore()
  const { data: questions = [], isLoading, error, refetch } = useQuestions(qaFilters)

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Failed to load questions
          </h3>
          <p className="text-muted-foreground mb-4">
            Something went wrong while fetching questions.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {Object.keys(qaFilters).length > 0 ? 'No questions found' : 'No questions yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {Object.keys(qaFilters).length > 0 
              ? 'Try adjusting your filters to see more questions.'
              : 'Be the first to ask a question and start the conversation!'
            }
          </p>
          <Button onClick={openAskQuestionModal}>
            <Plus className="h-4 w-4 mr-2" />
            Ask First Question
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header - Fixed */}
      <div className="p-4 border-b border-border bg-card/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Questions
            </h1>
            <p className="text-sm text-muted-foreground">
              {questions.length} {questions.length === 1 ? 'question' : 'questions'}
              {Object.keys(qaFilters).length > 0 && ' (filtered)'}
            </p>
          </div>
          
          <Button onClick={openAskQuestionModal}>
            <Plus className="h-4 w-4 mr-2" />
            Ask Question
          </Button>
        </div>
      </div>

      {/* Questions List - Scrollable content */}
      <div className="p-4 space-y-4">
        {questions.map((question) => (
          <QuestionCard 
            key={question.id} 
            question={question}
          />
        ))}

        {/* Load more placeholder - could implement pagination later */}
        {questions.length >= 20 && (
          <div className="pt-4 text-center">
            <Button variant="outline" disabled>
              Load More Questions
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
