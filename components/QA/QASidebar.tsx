'use client'

import { useUIStore } from '@/stores/ui'
import { useTags } from '@/hooks/api/useQA'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useRouter, usePathname } from 'next/navigation'
import {
  Hash,
  MessageSquare,
  CheckCircle,
  Clock, 
  Plus,
  Filter
} from 'lucide-react'

export function QASidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { 
    qaFilters, 
    setQAFilters, 
    clearQAFilters,
    openAskQuestionModal,
    qaSidebarOpen,
    setQASidebarOpen
  } = useUIStore()
  
  const { data: tags = [] } = useTags()

  const categories = [
    { id: 'all', label: 'All Questions', icon: MessageSquare, count: null },
    { id: 'unsolved', label: 'Unsolved', icon: Clock, count: null },
    { id: 'solved', label: 'Solved', icon: CheckCircle, count: null },
  ]

  const handleCategoryClick = (categoryId: string) => {
    switch (categoryId) {
      case 'all':
        clearQAFilters()
        break
      case 'unsolved':
        setQAFilters({ solved: false })
        break
      case 'solved':
        setQAFilters({ solved: true })
        break
    }
    
    // Navigate to questions list if not already there
    if (pathname !== '/qa') {
      router.push('/qa')
    }
    
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setQASidebarOpen(false)
    }
  }

  const handleTagClick = (tag: string) => {
    if (qaFilters.tag === tag) {
      // If same tag is clicked, remove filter
      const { tag: _removedTag, ...rest } = qaFilters
      setQAFilters(rest)
    } else {
      setQAFilters({ tag })
    }
    
    // Navigate to questions list if not already there
    if (pathname !== '/qa') {
      router.push('/qa')
    }
    
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setQASidebarOpen(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Ask Question Button */}
      <div className="p-4">
        <Button 
          onClick={() => {
            openAskQuestionModal()
            // Close sidebar on mobile when opening modal
            if (window.innerWidth < 1024) {
              setQASidebarOpen(false)
            }
          }}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ask Question
        </Button>
      </div>

      {/* Categories Section */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Categories
          </h3>
        </div>
        
        <div className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = 
              (category.id === 'all' && Object.keys(qaFilters).length === 0) ||
              (category.id === 'unsolved' && qaFilters.solved === false) ||
              (category.id === 'solved' && qaFilters.solved === true)

            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 truncate">{category.label}</span>
                {category.count && (
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tags Section */}
      {tags.length > 0 && (
        <div className="px-4 pb-4 flex-1 min-h-0">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Tags
            </h3>
          </div>
          
          <div className="space-y-1 overflow-y-auto max-h-64">
            {tags.map((tag) => {
              const isActive = qaFilters.tag === tag

              return (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Hash className="h-3 w-3 flex-shrink-0" />
                  <span className="flex-1 truncate">{tag}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Active Filters */}
      {Object.keys(qaFilters).length > 0 && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Active Filters
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearQAFilters()
                // Navigate to questions list if not already there
                if (pathname !== '/qa') {
                  router.push('/qa')
                }
              }}
              className="text-xs h-6 px-2"
            >
              Clear All
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {qaFilters.tag && (
              <Badge 
                variant="secondary" 
                className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleTagClick(qaFilters.tag!)}
              >
                #{qaFilters.tag} ×
              </Badge>
            )}
                {qaFilters.solved === true && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      setQAFilters({ solved: undefined })
                      if (pathname !== '/qa') {
                        router.push('/qa')
                      }
                    }}
                  >
                    Solved ×
                  </Badge>
                )}
                {qaFilters.solved === false && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      setQAFilters({ solved: undefined })
                      if (pathname !== '/qa') {
                        router.push('/qa')
                      }
                    }}
                  >
                    Unsolved ×
                  </Badge>
                )}
          </div>
        </div>
      )}
    </div>
  )
}
