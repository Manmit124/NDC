'use client'

import { useState } from 'react'
import { QAMessageWithAuthor, useDeleteReply } from '@/hooks/api/useQA'
import { useAuth } from '@/hooks/auth/useAuth'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import { Button } from '@/components/ui/button'
import { User, Trash2, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface ReplyCardProps {
  reply: QAMessageWithAuthor
}

export function ReplyCard({ reply }: ReplyCardProps) {
  const { user } = useAuth()
  const deleteReply = useDeleteReply()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const timeAgo = formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })
  const isAuthor = user?.id === reply.author_id

  const handleDeleteReply = () => {
    setShowDeleteDialog(true)
  }

  const confirmDeleteReply = async () => {
    try {
      await deleteReply.mutateAsync(reply.id)
      toast.success('Reply deleted successfully')
      setShowDeleteDialog(false)
    } catch {
      toast.error('Failed to delete reply')
      setShowDeleteDialog(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      {/* Reply Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {reply.profiles?.avatar_url ? (
            <img
              src={reply.profiles.avatar_url}
              alt={reply.profiles.full_name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>

        {/* Author info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-foreground text-sm">
              {reply.profiles?.full_name || 'Anonymous'}
            </span>
            <span className="text-xs text-muted-foreground">
              @{reply.profiles?.username || 'unknown'}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {timeAgo}
            </span>
          </div>
        </div>

        {/* Delete button for reply author */}
        {isAuthor && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteReply}
            disabled={deleteReply.isPending}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
          >
            {deleteReply.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>

      {/* Reply Content */}
      <div className="ml-11">
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground whitespace-pre-wrap mb-0">
            {reply.content}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDeleteReply}
        title="Delete Reply"
        description="Are you sure you want to delete this reply? This cannot be undone."
        isLoading={deleteReply.isPending}
        type="reply"
      />
    </div>
  )
}
