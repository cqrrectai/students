"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Brain, BarChart3, TrendingUp } from 'lucide-react'
import { AIInsightsDashboard } from '@/components/ai-analytics/ai-insights-dashboard'
import { useAuth } from '@/lib/auth-context'

export default function ExamAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const examId = params.id as string

  const [examAttempt, setExamAttempt] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && examId) {
      loadExamAttempt()
    }
  }, [user, examId])

  const loadExamAttempt = async () => {
    if (!user) return

    try {
      setLoading(true)
      // Get the latest exam attempt for this user and exam
      const response = await fetch(`/api/exam-attempts?exam_id=${examId}&user_id=${user.id}&limit=1`)
      const result = await response.json()

      if (result.success && result.data.length > 0) {
        setExamAttempt(result.data[0])
      }
    } catch (error) {
      console.error('Error loading exam attempt:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00e4a0] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!examAttempt) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Available</h2>
              <p className="text-gray-600 mb-4">
                You need to complete this exam first to view AI-powered analytics.
              </p>
              <Button onClick={() => router.push(`/exam/${examId}`)}>
                Take Exam
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">Exam Analytics</h1>
            <p className="text-gray-600">AI-powered performance insights</p>
          </div>
        </div>

        {/* Exam Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#00e4a0]" />
              Exam Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-900">
                  {examAttempt.score}
                </div>
                <div className="text-sm text-blue-700">Score</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-900">
                  {examAttempt.percentage}%
                </div>
                <div className="text-sm text-green-700">Percentage</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-900">
                  {examAttempt.total_marks}
                </div>
                <div className="text-sm text-purple-700">Total Marks</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-900">
                  {Math.round((examAttempt.time_taken || 0) / 60)}
                </div>
                <div className="text-sm text-orange-700">Minutes Taken</div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center">
              <Badge 
                className={`text-lg px-4 py-2 ${
                  examAttempt.percentage >= 60 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {examAttempt.percentage >= 60 ? 'PASSED' : 'FAILED'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights Dashboard */}
        <AIInsightsDashboard 
          examAttemptId={examAttempt.id} 
          userId={user?.id}
        />

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/exam/${examId}`)}
          >
            Retake Exam
          </Button>
          <Button 
            onClick={() => router.push('/exams')}
            className="bg-[#00e4a0] hover:bg-[#00d494] text-black"
          >
            Browse More Exams
          </Button>
        </div>
      </div>
    </div>
  )
}