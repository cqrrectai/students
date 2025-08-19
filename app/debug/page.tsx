"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function DebugPage() {
  const [directDbTest, setDirectDbTest] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const testDirectConnection = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setDirectDbTest({
        success: !error,
        data: data || [],
        error: error?.message || null,
        count: data?.length || 0
      })
    } catch (err) {
      setDirectDbTest({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        data: [],
        count: 0
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      testDirectConnection()
    }
  }, [mounted])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading debug page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Debug Page</h1>
          <p className="text-gray-600">Testing database connections and data loading</p>
        </div>

        {/* Direct Database Test */}
        <Card>
          <CardHeader>
            <CardTitle>Direct Database Connection Test</CardTitle>
            <CardDescription>Testing direct Supabase client connection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={testDirectConnection} disabled={loading}>
                {loading ? 'Testing...' : 'Test Direct Connection'}
              </Button>
              
              {directDbTest && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={directDbTest.success ? 'default' : 'destructive'}>
                      {directDbTest.success ? 'Success' : 'Failed'}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Found {directDbTest.count} exams
                    </span>
                  </div>
                  
                  {directDbTest.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-red-700 text-sm">Error: {directDbTest.error}</p>
                    </div>
                  )}
                  
                  {directDbTest.data.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-green-700 text-sm font-medium mb-2">Recent Exams:</p>
                      <ul className="text-sm text-green-600 space-y-1">
                        {directDbTest.data.map((exam: any) => (
                          <li key={exam.id}>
                            {exam.title} ({exam.status}) - {new Date(exam.created_at).toLocaleDateString()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Test */}
        <Card>
          <CardHeader>
            <CardTitle>API Endpoint Test</CardTitle>
            <CardDescription>Testing the public exams API</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/exams')
                    const result = await response.json()
                    console.log('API Test Result:', result)
                  } catch (error) {
                    console.error('API Test Error:', error)
                  }
                }}
              >
                Test API Endpoint
              </Button>
              
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <p className="text-gray-700 font-medium mb-2">Check browser console for API results</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Information</CardTitle>
            <CardDescription>Current configuration details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Supabase URL:</span>
                <span className="text-gray-600 font-mono">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Has Anon Key:</span>
                <span className="text-gray-600">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Timestamp:</span>
                <span className="text-gray-600">
                  {new Date().toISOString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}