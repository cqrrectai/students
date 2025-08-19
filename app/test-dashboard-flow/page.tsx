"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function TestDashboardFlow() {
  const [studentExams, setStudentExams] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newExam, setNewExam] = useState<any>(null)

  const loadStudentExams = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/dashboard/student-exams')
      const result = await response.json()
      
      if (result.success) {
        setStudentExams(result.exams)
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
      const response = await fetch('/api/test-dashboard-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const result = await response.json()
      
      if (result.success) {
        setNewExam(result)
        // Refresh the list
        await loadStudentExams()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create exam')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Dashboard Flow</h1>
          <p className="text-gray-600">Test student exam creation and display</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        {newExam && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">
              ✅ Exam created successfully: {newExam.exam.title}
            </p>
            <Link 
              href={newExam.testUrl} 
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
                className="w-full bg-[#00e4a0] hover:bg-[#00d494] text-black"
              >
                {loading ? 'Creating...' : 'Create Test Student Exam'}
              </Button>
              
              <Button 
                onClick={loadStudentExams} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Loading...' : 'Load Student Exams'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard" className="block text-blue-600 hover:text-blue-800 underline">
                → Dashboard (should show student exams)
              </Link>
              <Link href="/dashboard/create-exam" className="block text-blue-600 hover:text-blue-800 underline">
                → Create Exam (student flow)
              </Link>
              <Link href="/exams" className="block text-blue-600 hover:text-blue-800 underline">
                → Public Exams (admin exams only)
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Created Exams ({studentExams.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {studentExams.length === 0 ? (
              <p className="text-gray-500">No student exams loaded. Click "Load Student Exams" to load them.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentExams.map((exam) => (
                  <Card key={exam.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {exam.type}
                        </Badge>
                        <Badge 
                          className={`text-xs ${
                            exam.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {exam.status}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                        {exam.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {exam.subject} • {exam.duration}min • {exam.total_marks} marks
                      </p>
                      <div className="flex gap-2">
                        <Link href={`/exam/${exam.id}`} className="flex-1">
                          <Button size="sm" className="w-full">
                            Take Exam
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}