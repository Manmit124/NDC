'use client'

import { useState } from 'react'
import { useCreateQuestion } from '@/hooks/api/useQA'
import { useUIStore } from '@/stores/ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, X, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function AskQuestionForm() {
  const router = useRouter()
  const { askQuestionModalOpen, closeAskQuestionModal } = useUIStore()
  const createQuestion = useCreateQuestion()
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase()
      
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag])
        setTagInput('')
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Please enter a question title')
      return
    }
    
    if (!content.trim()) {
      toast.error('Please describe your question')
      return
    }

    try {
      const question = await createQuestion.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        tags: tags.length > 0 ? tags : undefined
      })
      
      // Reset form
      setTitle('')
      setContent('')
      setTags([])
      setTagInput('')
      
      closeAskQuestionModal()
      toast.success('Question posted successfully!')
      
      // Navigate to the new question
      router.push(`/qa/${question.id}`)
    } catch {
      toast.error('Failed to post question. Please try again.')
    }
  }

  const handleClose = () => {
    if (!createQuestion.isPending) {
      closeAskQuestionModal()
    }
  }

  return (
    <Dialog open={askQuestionModalOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ask a Question</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Question Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your programming question?"
              disabled={createQuestion.isPending}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              Be specific and clear. Good titles get better answers.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Question Details *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your question in detail. Include any code, error messages, or context that might help others understand your problem."
              className="min-h-[150px] resize-none"
              disabled={createQuestion.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Include relevant code, error messages, and what you&apos;ve already tried.
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <div className="space-y-2">
              {/* Tag input */}
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags (press Enter or comma to add)"
                disabled={createQuestion.isPending || tags.length >= 5}
              />
              
              {/* Current tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Add up to 5 tags to help categorize your question (e.g., react, javascript, css)
              </p>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createQuestion.isPending}
            >
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              disabled={createQuestion.isPending || !title.trim() || !content.trim()}
              className="min-w-[120px]"
            >
              {createQuestion.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post Question
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
