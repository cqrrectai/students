"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function DebugExamFlow() {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testExam, setTestExam] = useState<any>(null)

  const fetchExams = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/exams')
      const result = await response.json()
      
      if (result.success) {
        setExams(result.exams)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch exams')
    } finally {
      setLoading(false)
    }
  }

  const createTestExam = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/test-create-complete-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const result = await response.json()
      
      if (result.success) {
        setTestExam(result)
        // Refresh exams list
        await fetchExams()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create test exam')
    } finally {
      setLoading(false)
    }
  }

  const testExamById = async (examId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/exams/${examId}`)
      const result = await response.json()
      
      if (result.success) {
        alert(`Exam loaded successfully: ${result.exam.title} with ${result.exam.questionsData.length} questions`)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch exam')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Debug Exam Flow</h1>
          <p className="text-gray-600">Test the complete exam creation and fetching flow</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        {testExam && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">
              ✅ Test exam created successfully: {testExam.exam.title}
            </p>
            <p className="text-sm text-green-600 mt-1">
              Questions: {testExam.questions.created}/{testExam.questions.total} created
            </p>
            <Link 
              href={testExam.testUrl} 
              className="inline-block mt-2 text-blue-600 hover:text-blue-800 underline"
            >
              Take the exam →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Test Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={createTestExam} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating...' : 'Create Test Exam'}
              </Button>
              
              <Button 
                onClick={fetchExams} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Loading...' : 'Fetch All Exams'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/exams" className="block text-blue-600 hover:text-blue-800 underline">
                → Public Exams Page
              </Link>
              <Link href="/dashboard/create-exam" className="block text-blue-600 hover:text-blue-800 underline">
                → Dashboard Create Exam
              </Link>
              <Link href="/admin" className="block text-blue-600 hover:text-blue-800 underline">
                → Admin Dashboard
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Exams ({exams.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {exams.length === 0 ? (
              <p className="text-gray-500">No exams loaded. Click "Fetch All Exams" to load them.</p>
            ) : (
              <div className="space-y-3">
                {exams.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{exam.title}</h3>
                      <p className="text-sm text-gray-600">
                        {exam.type} • {exam.subject} • {exam.duration}min • {exam.total_marks} marks
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{exam.status}</Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => testExamById(exam.id)}
                        disabled={loading}
                      >
                        Test Load
                      </Button>
                      <Link href={`/exam/${exam.id}`}>
                        <Button size="sm">Take Exam</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}