'use client'

import { ReactNode } from 'react'
import { useUIStore } from '@/stores/ui'
import { cn } from '@/lib/utils'
import { QASidebar } from './QASidebar'
import { AskQuestionForm } from './AskQuestionForm'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

interface QALayoutProps {
  children: ReactNode
  sidebar?: ReactNode
  rightPanel?: ReactNode
}

export function QALayout({ children, sidebar, rightPanel }: QALayoutProps) {
  const { qaSidebarOpen, toggleQASidebar } = useUIStore()

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {qaSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleQASidebar}
        />
      )}

      {/* Left Sidebar - Fixed position like ClientLayout */}
      <div className={cn(
        "fixed inset-y-0 left-64 z-50 w-64 bg-card/80 backdrop-blur-xl border-r border-border/50 shadow-2xl transform transition-all duration-300 ease-in-out lg:relative lg:left-0 lg:translate-x-0",
        qaSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border/50 bg-card/50">
            <h2 className="text-lg font-semibold text-foreground">Q&A Community</h2>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden w-8 h-8 rounded-full bg-muted/50 hover:bg-muted"
              onClick={toggleQASidebar}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Sidebar Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {sidebar || <QASidebar />}
          </div>
        </div>
      </div>

      {/* Main Content Area - Scrollable like ClientLayout */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-30 flex-shrink-0 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleQASidebar}
            className="w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Q&A</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Center Panel - Questions List or Question Detail - Scrollable */}
          <div className={cn(
            "flex-1 flex flex-col min-w-0 overflow-hidden",
            rightPanel ? "lg:max-w-2xl" : "max-w-none"
          )}>
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </div>

          {/* Right Panel - Question Detail (optional) - Scrollable */}
          {rightPanel && (
            <div className="hidden lg:flex lg:w-96 xl:w-[28rem] border-l border-border bg-card overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                {rightPanel}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ask Question Modal */}
      <AskQuestionForm />
    </div>
  )
}
