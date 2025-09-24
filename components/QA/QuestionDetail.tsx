'use client'

import { useState } from 'react'
import { useQuestionWithReplies, useMarkQuestionSolved, useDeleteQuestion } from '@/hooks/api/useQA'
import { useAuth } from '@/hooks/auth/useAuth'
import { ReplyCard } from './ReplyCard'
import { ReplyForm } from './ReplyForm'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  User,
  Loader2,
  AlertCircle,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface QuestionDetailProps {
  questionId: string
}

export function QuestionDetail({ questionId }: QuestionDetailProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { data, isLoading, error } = useQuestionWithReplies(questionId)
  const markSolved = useMarkQuestionSolved()
  const deleteQuestion = useDeleteQuestion()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading question...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Question not found
          </h3>
          <p className="text-muted-foreground mb-4">
            This question may have been deleted or doesn&apos;t exist.
          </p>
          <Link href="/qa">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questions
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const { question, replies } = data
  const timeAgo = formatDistanceToNow(new Date(question.created_at), { addSuffix: true })
  const isAuthor = user?.id === question.author_id

  const handleMarkSolved = async () => {
    try {
      await markSolved.mutateAsync({ 
        questionId: question.id, 
        solved: !question.is_solved 
      })
      toast.success(
        question.is_solved 
          ? 'Question marked as unsolved' 
          : 'Question marked as solved!'
      )
    } catch {
      toast.error('Failed to update question status')
    }
  }

  const handleDeleteQuestion = () => {
    setShowDeleteDialog(true)
  }

  const confirmDeleteQuestion = async () => {
    try {
      await deleteQuestion.mutateAsync(question.id)
      toast.success('Question deleted successfully')
      setShowDeleteDialog(false)
      router.push('/qa')
    } catch {
      toast.error('Failed to delete question')
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      {/* Header - Fixed */}
      <div className="p-4 border-b border-border bg-card/50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/qa">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questions
            </Button>
          </Link>
          
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground line-clamp-1">
              {question.question_title}
            </h1>
          </div>

          {question.is_solved && (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Solved
            </Badge>
          )}
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="p-4 space-y-6">
        {/* Original Question */}
        <div className="bg-card border border-border rounded-lg p-6">
          {/* Question Header */}
          <div className="flex items-start gap-3 mb-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {question.profiles?.avatar_url ? (
                  <img
                    src={question.profiles.avatar_url}
                    alt={question.profiles.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>

              {/* Author info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground">
                    {question.profiles?.full_name || 'Anonymous'}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    OP
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    @{question.profiles?.username || 'unknown'}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Asked {timeAgo}
                </div>
              </div>

              {/* Author actions */}
              {isAuthor && (
                <div className="flex items-center gap-2">
                  <Button
                    variant={question.is_solved ? "outline" : "default"}
                    size="sm"
                    onClick={handleMarkSolved}
                    disabled={markSolved.isPending}
                  >
                    {markSolved.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : question.is_solved ? (
                      <Clock className="h-4 w-4 mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {question.is_solved ? 'Mark Unsolved' : 'Mark Solved'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteQuestion}
                    disabled={deleteQuestion.isPending}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {deleteQuestion.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete
                  </Button>
                </div>
              )}
            </div>

            {/* Question Title */}
            <h2 className="text-xl font-bold text-foreground mb-4">
              {question.question_title}
            </h2>

            {/* Question Content */}
            <div className="prose prose-sm max-w-none mb-4">
              <p className="text-foreground whitespace-pre-wrap">
                {question.content}
              </p>
            </div>

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Question Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{question.reply_count} {question.reply_count === 1 ? 'reply' : 'replies'}</span>
              </div>
            </div>
          </div>

          {/* Replies Section */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {replies.length === 0 ? 'No replies yet' : `${replies.length} ${replies.length === 1 ? 'Reply' : 'Replies'}`}
            </h3>

            <div className="space-y-4">
              {replies.map((reply) => (
                <ReplyCard key={reply.id} reply={reply} />
              ))}
            </div>
          </div>

          {/* Reply Form */}
          {user ? (
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-4">Write a reply</h4>
              <ReplyForm questionId={question.id} />
            </div>
          ) : (
            <div className="bg-muted/30 border border-border rounded-lg p-6 text-center">
              <p className="text-muted-foreground mb-4">
                You need to be logged in to reply to this question.
              </p>
              <Link href="/login">
                <Button>Sign In to Reply</Button>
              </Link>
            </div>
          )}
        </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDeleteQuestion}
        title="Delete Question"
        description="Are you sure you want to delete this question? This will also delete all replies and cannot be undone."
        isLoading={deleteQuestion.isPending}
        type="question"
      />
    </>
  )
}
