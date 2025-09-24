'use client'

import { useState } from 'react'
import { QAMessageWithAuthor, useDeleteQuestion } from '@/hooks/api/useQA'
import { useAuth } from '@/hooks/auth/useAuth'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  MessageSquare, 
  CheckCircle,
  Clock,
  User,
  Trash2,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface QuestionCardProps {
  question: QAMessageWithAuthor
  onClick?: () => void
  className?: string
}

export function QuestionCard({ question, onClick, className }: QuestionCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const deleteQuestion = useDeleteQuestion()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const timeAgo = formatDistanceToNow(new Date(question.created_at), { addSuffix: true })
  const lastReplyAgo = question.last_reply_at 
    ? formatDistanceToNow(new Date(question.last_reply_at), { addSuffix: true })
    : null
  const isAuthor = user?.id === question.author_id

  const handleDeleteQuestion = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation()
    setShowDeleteDialog(true)
  }

  const handleProfileClick = (e: React.MouseEvent, username: string) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation()
    router.push(`/profile/${username}`)
  }

  const confirmDeleteQuestion = async () => {
    try {
      await deleteQuestion.mutateAsync(question.id)
      toast.success('Question deleted successfully')
      setShowDeleteDialog(false)
    } catch {
      toast.error('Failed to delete question')
      setShowDeleteDialog(false)
    }
  }

  const CardContent = (
    <div className={cn(
      "group p-4 bg-card border border-border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer",
      className
    )}>
      {/* Header with author info */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {question.profiles?.username ? (
            <div 
              onClick={(e) => handleProfileClick(e, question.profiles!.username)}
              className="block hover:opacity-80 transition-opacity cursor-pointer"
            >
              {question.profiles?.avatar_url ? (
                <Image
                  src={question.profiles.avatar_url}
                  alt={question.profiles.full_name || 'User avatar'}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>

        {/* Author and timestamp */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {question.profiles?.username ? (
              <span 
                onClick={(e) => handleProfileClick(e, question.profiles!.username)}
                className="font-medium text-foreground text-sm hover:text-primary transition-colors cursor-pointer"
              >
                {question.profiles?.full_name || 'Anonymous'}
              </span>
            ) : (
              <span className="font-medium text-foreground text-sm">
                Anonymous
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              @{question.profiles?.username || 'unknown'}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {timeAgo}
            </span>
          </div>

          {/* Question title */}
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {question.question_title}
          </h3>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Solved indicator */}
          {question.is_solved && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          
          {/* Delete button for question author */}
          {isAuthor && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteQuestion}
              disabled={deleteQuestion.isPending}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {deleteQuestion.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Content preview */}
      <div className="mb-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {question.content}
        </p>
      </div>

      {/* Tags */}
      {question.tags && question.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {question.tags.slice(0, 3).map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="text-xs px-2 py-0.5 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {tag}
            </Badge>
          ))}
          {question.tags.length > 3 && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              +{question.tags.length - 3} more
            </Badge>
          )}
        </div>
      )}

      {/* Footer stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          {/* Reply count */}
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <span>{question.reply_count} {question.reply_count === 1 ? 'reply' : 'replies'}</span>
          </div>
        </div>

        {/* Last activity */}
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>
            {lastReplyAgo ? `Last reply ${lastReplyAgo}` : `Asked ${timeAgo}`}
          </span>
        </div>
      </div>
    </div>
  )

  // If onClick is provided, render as button, otherwise as Link
  return (
    <>
      {onClick ? (
        <button onClick={onClick} className="w-full text-left">
          {CardContent}
        </button>
      ) : (
        <Link href={`/qa/${question.id}`} className="block">
          {CardContent}
        </Link>
      )}

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
