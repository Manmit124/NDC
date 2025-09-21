'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error caught by error boundary:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-black">
      <nav className="bg-black border-b border-pink-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white">
                NDC - Nagpur Developer Club
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center mb-6">
            <svg
              className="h-10 w-10 text-pink-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            Something went <span className="text-pink-500">wrong!</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            We encountered an unexpected error. Please try again or contact support if the problem persists.
          </p>
          
          <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center space-y-3 sm:space-y-0 sm:space-x-3">
            <Button
              onClick={reset}
              className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 text-base font-medium rounded-md transition-colors duration-200"
            >
              Try again
            </Button>
            
         
          </div>
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-gray-900 border border-pink-500/20 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Error Details:</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">Error Message:</p>
                <div className="bg-gray-800 border border-gray-700 rounded p-3">
                  <p className="font-mono text-pink-400 break-all text-sm">
                    {error.message}
                  </p>
                </div>
              </div>
              
              {error.stack && (
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-2">Stack Trace:</p>
                  <div className="bg-gray-800 border border-gray-700 rounded p-3">
                    <pre className="font-mono text-gray-300 text-xs whitespace-pre-wrap overflow-x-auto">
                      {error.stack}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
