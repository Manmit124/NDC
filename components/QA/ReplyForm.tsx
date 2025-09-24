'use client'

import { useState } from 'react'
import { useCreateReply } from '@/hooks/api/useQA'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'

interface ReplyFormProps {
  questionId: string
}

export function ReplyForm({ questionId }: ReplyFormProps) {
  const [content, setContent] = useState('')
  const createReply = useCreateReply()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      toast.error('Please write a reply before submitting')
      return
    }

    createReply.mutate({
      questionId,
      content: content.trim()
    }, {
      onSuccess: () => {
        setContent('')
        toast.success('Reply posted successfully!')
      },
      onError: () => {
        toast.error('Failed to post reply. Please try again.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your reply here... You can help by sharing your knowledge and experience."
        className="min-h-[120px] resize-none"
        disabled={createReply.isPending}
      />
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Be respectful and constructive in your replies.
        </p>
        
        <Button 
          type="submit" 
          disabled={createReply.isPending || !content.trim()}
          className="min-w-[100px]"
        >
          {createReply.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Post Reply
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
