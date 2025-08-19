"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

export default function TestAuthFlowPage() {
  const { user, session, loading, signIn, signOut } = useAuth()
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('testpassword123')
  const [testLoading, setTestLoading] = useState(false)
  const [result, setResult] = useState('')

  const handleTestSignIn = async () => {
    setTestLoading(true)
    setResult('Testing sign in...')
    
    try {
      const { success, error } = await signIn(email, password)
      
      if (success) {
        setResult('✅ Sign in successful! Check if user state updated above.')
      } else {
        setResult(`❌ Sign in failed: ${error}`)
      }
    } catch (err) {
      setResult(`❌ Sign in error: ${err}`)
    }
    
    setTestLoading(false)
  }

  const handleTestSignOut = async () => {
    setTestLoading(true)
    setResult('Testing sign out...')
    
    try {
      await signOut()
      setResult('✅ Sign out successful! Check if user state cleared above.')
    } catch (err) {
      setResult(`❌ Sign out error: ${err}`)
    }
    
    setTestLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Auth Flow Test</h1>
        
        {/* Current Auth State */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? user.email : 'None'}</p>
            <p><strong>User ID:</strong> {user ? user.id : 'None'}</p>
            <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
            <p><strong>Session Expires:</strong> {session ? new Date(session.expires_at! * 1000).toLocaleString() : 'N/A'}</p>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Authentication</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleTestSignIn}
                disabled={testLoading || !!user}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {testLoading ? 'Testing...' : 'Test Sign In'}
              </button>
              
              <button
                onClick={handleTestSignOut}
                disabled={testLoading || !user}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {testLoading ? 'Testing...' : 'Test Sign Out'}
              </button>
            </div>
          </div>
        </div>

        {/* Test Result */}
        {result && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <p className="text-sm">{result}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Instructions</h2>
          <div className="text-sm text-blue-700 space-y-2">
            <p>1. Open browser console (F12) to see debug messages</p>
            <p>2. Click "Test Sign In" to authenticate</p>
            <p>3. Watch the "Current Auth State" section update</p>
            <p>4. If sign in works, the user email should appear above</p>
            <p>5. Click "Test Sign Out" to clear authentication</p>
            <p>6. If this works, the sign-in page redirect should work too</p>
          </div>
        </div>
      </div>
    </div>
  )
}