"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  TrendingUp, 
  Target, 
  BookOpen, 
  Clock, 
  Award,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Lightbulb,
  RefreshCw,
  Zap
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface AIAnalytics {
  id: string
  analysis_type: string
  insights: any
  recommendations: any
  confidence_score: number
  ai_model: string
  processing_time_ms: number
  created_at: string
  exam?: {
    title: string
    subject: string
    type: string
  }
  exam_attempt?: {
    score: number
    percentage: number
    created_at: string
  }
}

interface AIInsightsDashboardProps {
  examAttemptId?: string
  userId?: string
}

export function AIInsightsDashboard({ examAttemptId, userId }: AIInsightsDashboardProps) {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<AIAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const effectiveUserId = userId || user?.id

  useEffect(() => {
    if (effectiveUserId) {
      loadAnalytics()
    }
  }, [effectiveUserId, examAttemptId])

  const loadAnalytics = async () => {
    if (!effectiveUserId) return

    try {
      setLoading(true)
      const params = new URLSearchParams({ user_id: effectiveUserId })
      if (examAttemptId) params.append('exam_attempt_id', examAttemptId)

      const response = await fetch(`/api/ai-analytics?${params}`)
      const result = await response.json()

      if (result.success) {
        setAnalytics(result.data)
      }
    } catch (error) {
      console.error('Error loading AI analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAnalytics = async () => {
    if (!examAttemptId || !effectiveUserId) return

    try {
      setGenerating(true)
      const response = await fetch('/api/ai-analytics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_attempt_id: examAttemptId,
          user_id: effectiveUserId
        })
      })

      const result = await response.json()
      if (result.success) {
        await loadAnalytics()
      }
    } catch (error) {
      console.error('Error generating analytics:', error)
    } finally {
      setGenerating(false)
    }
  }

  const performanceAnalytics = analytics.find(a => a.analysis_type === 'performance')
  const learningPathAnalytics = analytics.find(a => a.analysis_type === 'learning_path')

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00e4a0] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading AI insights...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (analytics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-[#00e4a0]" />
            AI Performance Insights
          </CardTitle>
          <CardDescription>
            Get personalized insights powered by Llama 4 Scout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insights available</h3>
            <p className="text-gray-600 mb-4">
              {examAttemptId 
                ? 'Generate AI-powered insights for this exam attempt'
                : 'Complete an exam to get personalized AI insights'
              }
            </p>
            {examAttemptId && (
              <Button 
                onClick={generateAnalytics} 
                disabled={generating}
                className="bg-[#00e4a0] hover:bg-[#00d494] text-black"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Generating Insights...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate AI Insights
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-[#00e4a0]" />
            AI Performance Insights
          </h2>
          <p className="text-gray-600">Powered by Llama 4 Scout</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {examAttemptId && (
            <Button 
              onClick={generateAnalytics} 
              disabled={generating}
              className="bg-[#00e4a0] hover:bg-[#00d494] text-black"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Regenerating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Regenerate Insights
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
          <TabsTrigger value="learning">Learning Path</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {performanceAnalytics && (
            <>
              {/* Overall Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Overall Performance Analysis
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      Confidence: {performanceAnalytics.confidence_score}%
                    </Badge>
                    <Badge variant="outline">
                      {performanceAnalytics.ai_model}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-900">
                        {performanceAnalytics.insights.accuracy_rate}%
                      </div>
                      <div className="text-sm text-blue-700">Accuracy Rate</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-900 capitalize">
                        {performanceAnalytics.insights.time_efficiency}
                      </div>
                      <div className="text-sm text-green-700">Time Efficiency</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-900 capitalize">
                        {performanceAnalytics.insights.overall_performance}
                      </div>
                      <div className="text-sm text-purple-700">Overall Rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      Strong Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {performanceAnalytics.insights.question_patterns?.strong_areas?.map((area: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-800 capitalize">{area.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                      <AlertCircle className="h-5 w-5" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {performanceAnalytics.insights.question_patterns?.weak_areas?.map((area: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <span className="text-orange-800 capitalize">{area.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          {learningPathAnalytics && (
            <>
              {/* Learning Path */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[#00e4a0]" />
                    Personalized Learning Path
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recommended Study Duration</h4>
                      <p className="text-gray-600">{learningPathAnalytics.insights.study_duration}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Practice Frequency</h4>
                      <p className="text-gray-600">{learningPathAnalytics.insights.practice_frequency}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Next Topics to Study</h4>
                      <div className="flex flex-wrap gap-2">
                        {learningPathAnalytics.insights.next_topics?.map((topic: string, index: number) => (
                          <Badge key={index} variant="outline">{topic}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Focus Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {learningPathAnalytics.insights.focus_areas?.map((area: string, index: number) => (
                          <Badge key={index} className="bg-[#00e4a0] text-black">{area}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Study Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    Recommended Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {learningPathAnalytics.insights.resources?.map((resource: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{resource.count}</div>
                          <div className="text-sm text-gray-600 capitalize">
                            {resource.type.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {learningPathAnalytics?.recommendations && (
            <>
              {/* Immediate Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-600" />
                    Immediate Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {learningPathAnalytics.recommendations.immediate_actions?.map((action: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-orange-600 text-sm font-medium">{index + 1}</span>
                        </div>
                        <p className="text-orange-800">{action}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Long-term Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Long-term Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {learningPathAnalytics.recommendations.long_term_goals?.map((goal: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <Target className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-blue-800">{goal}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Processing Info */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Analysis generated by {analytics[0]?.ai_model}</span>
            <span>Processing time: {analytics[0]?.processing_time_ms}ms</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}