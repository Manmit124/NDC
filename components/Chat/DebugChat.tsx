'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useChatRooms, useMessages } from '@/hooks/api/useChat'
import { useUIStore } from '@/stores/ui'

interface TestResult {
  data?: unknown
  error?: unknown
}

interface TestResults {
  connection?: TestResult
  rooms?: TestResult
  messages?: TestResult
  anonymous?: TestResult
  error?: string
}

export function DebugChat() {
  const [testResults, setTestResults] = useState<TestResults>({})
  const { data: rooms, isLoading: roomsLoading, error: roomsError } = useChatRooms()
  const { chat: { activeRoomId } } = useUIStore()
  const { data: messages, isLoading: messagesLoading, error: messagesError } = useMessages(activeRoomId || '')

  useEffect(() => {
    const runTests = async () => {
      const supabase = createClient()
      
      try {
        // Test 1: Basic connection
        const { data: testConnection, error: connectionError } = await supabase.from('profiles').select('count').limit(1)
        
        // Test 2: Chat rooms table
        const { data: testRooms, error: roomsTestError } = await supabase.from('chat_rooms').select('*').limit(1)
        
        // Test 3: Messages table
        const { data: testMessages, error: messagesTestError } = await supabase.from('chat_messages').select('*').limit(1)
        
        // Test 4: Anonymous users table
        const { data: testAnonymous, error: anonymousTestError } = await supabase.from('anonymous_users').select('*').limit(1)

        setTestResults({
          connection: { data: testConnection, error: connectionError },
          rooms: { data: testRooms, error: roomsTestError },
          messages: { data: testMessages, error: messagesTestError },
          anonymous: { data: testAnonymous, error: anonymousTestError }
        })
      } catch (error) {
        console.error('Debug test error:', error)
        setTestResults({ error: String(error) })
      }
    }

    runTests()
  }, [])

  return (
    <div className="p-6 bg-card border rounded-lg max-w-4xl mx-auto my-6">
      <h2 className="text-xl font-bold mb-4">Chat Debug Information</h2>
      
      <div className="space-y-4">
        {/* Connection Tests */}
        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg mb-2">Database Connection Tests</h3>
          <pre className="bg-muted p-3 rounded text-sm overflow-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>

        {/* React Query States */}
        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg mb-2">React Query States</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Chat Rooms</h4>
              <p>Loading: {roomsLoading ? 'Yes' : 'No'}</p>
              <p>Error: {roomsError ? roomsError.message : 'None'}</p>
              <p>Data: {rooms?.length || 0} rooms</p>
              <pre className="bg-muted p-2 rounded text-xs mt-2">
                {JSON.stringify(rooms, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium">Messages (Room: {activeRoomId || 'None'})</h4>
              <p>Loading: {messagesLoading ? 'Yes' : 'No'}</p>
              <p>Error: {messagesError ? messagesError.message : 'None'}</p>
              <p>Data: {messages?.length || 0} messages</p>
              <pre className="bg-muted p-2 rounded text-xs mt-2">
                {JSON.stringify(messages, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* UI Store State */}
        <div>
          <h3 className="font-semibold text-lg mb-2">UI Store State</h3>
          <pre className="bg-muted p-3 rounded text-sm overflow-auto">
            {JSON.stringify({
              activeRoomId: activeRoomId,
              showRoomList: useUIStore.getState().chat.showRoomList,
              isAnonymousMode: useUIStore.getState().chat.isAnonymousMode,
              sessionToken: useUIStore.getState().chat.sessionToken,
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}