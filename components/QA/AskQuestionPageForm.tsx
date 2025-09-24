'use client'

import { useState } from 'react'
import { useCreateQuestion } from '@/hooks/api/useQA'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, X, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function AskQuestionPageForm() {
  const router = useRouter()
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
      
      toast.success('Question posted successfully!')
      
      // Navigate to the new question
      router.push(`/qa/${question.id}`)
    } catch {
      toast.error('Failed to post question. Please try again.')
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-4">
          <Link href="/qa">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questions
            </Button>
          </Link>
          
          <h1 className="text-xl font-semibold text-foreground">
            Ask a Question
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Question</CardTitle>
              <p className="text-sm text-muted-foreground">
                Be specific and clear to get the best answers from the community.
              </p>
            </CardHeader>
            
            <CardContent>
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
                    className="min-h-[200px] resize-none"
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
                  <Link href="/qa">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={createQuestion.isPending}
                    >
                      Cancel
                    </Button>
                  </Link>
                  
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
