"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugExamsPage() {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExams = async () => {
      try {
        console.log('Fetching exams...')
        
        const { data, error } = await supabase
          .from('exams')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Error:', error)
          setError(error.message)
        } else {
          console.log('Fetched exams:', data)
          setExams(data || [])
        }
      } catch (err) {
        console.error('Catch error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchExams()
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Exams Page</h1>
      <p className="mb-4">Found {exams.length} exams</p>
      
      <div className="space-y-4">
        {exams.map((exam) => (
          <div key={exam.id} className="border p-4 rounded">
            <h3 className="font-semibold">{exam.title}</h3>
            <p className="text-gray-600">{exam.description}</p>
            <div className="text-sm text-gray-500 mt-2">
              <span>Type: {exam.type}</span> | 
              <span>Subject: {exam.subject}</span> | 
              <span>Status: {exam.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}