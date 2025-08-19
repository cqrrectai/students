"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import {
  Brain,
  TrendingUp,
  Clock,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Download,
  Share,
  Lightbulb,
  BookOpen,
  Users,
  Zap,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AnalyticsData {
  overallPerformance: {
    score: number
    percentage: number
    grade: string
    timeEfficiency: number
    accuracyRate: number
    consistencyScore: number
  }
  subjectAnalysis: {
    subject: string
    score: number
    totalQuestions: number
    accuracy: number
    avgTimePerQuestion: number
    difficulty: string
    strengths: string[]
    weaknesses: string[]
  }[]
  timeAnalysis: {
    totalTime: number
    avgTimePerQuestion: number
    fastestQuestion: { id: string; time: number; question: string }
    slowestQuestion: { id: string; time: number; question: string }
    timeDistribution: { questionNumber: number; time: number; correct: boolean }[]
  }
  difficultyAnalysis: {
    easy: { correct: number; total: number; avgTime: number }
    medium: { correct: number; total: number; avgTime: number }
    hard: { correct: number; total: number; avgTime: number }
  }
  aiInsights: {
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    studyPlan: string[]
    nextSteps: string[]
    motivationalMessage: string
  }
  comparativeAnalysis: {
    percentile: number
    averageScore: number
    topPerformers: number
    improvementAreas: string[]
  }
}

export default function ExamAnalyticsPage() {
  const router = useRouter()
  const params = useParams()
  const examId = params.id as string

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [examData, setExamData] = useState<any>(null)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // Get exam results from localStorage
        const examResults = JSON.parse(localStorage.getItem(`exam_results_${examId}`) || "null")
        const examInfo = JSON.parse(localStorage.getItem("exams") || "[]").find((e: any) => e.id === examId)

        if (!examResults || !examInfo) {
          setError("Exam results not found")
          return
        }

        setExamData({ results: examResults, info: examInfo })

        // Generate AI analytics
        const response = await fetch("/api/exam-analytics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            examId,
            examInfo,
            examResults,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to generate analytics")
        }

        const analytics = await response.json()
        setAnalyticsData(analytics)
      } catch (error) {
        console.error("Error loading analytics:", error)
        setError("Failed to load analytics")
      } finally {
        setIsLoading(false)
      }
    }

    if (examId) {
      loadAnalytics()
    }
  }, [examId])

  const COLORS = ["#00e4a0", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6"]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00e4a0] mx-auto mb-4"></div>
          <p className="text-gray-600">Generating AI Analytics...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      </div>
    )
  }

  if (error || !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Not Available</h2>
            <p className="text-gray-600 mb-4">{error || "Unable to generate analytics for this exam."}</p>
            <Button onClick={() => router.push("/exams")} className="bg-gray-900 hover:bg-gray-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exams
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Brain className="h-6 w-6 text-[#00e4a0]" />
                  AI Performance Analytics
                </h1>
                <p className="text-gray-600">{examData?.info?.title}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-[#00e4a0] to-[#00d494] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Overall Score</p>
                  <p className="text-3xl font-bold">{analyticsData.overallPerformance.percentage}%</p>
                  <p className="text-white/80 text-sm">Grade: {analyticsData.overallPerformance.grade}</p>
                </div>
                <Award className="h-8 w-8 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Time Efficiency</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.overallPerformance.timeEfficiency}%</p>
                  <p className="text-gray-500 text-sm">Optimal timing</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Accuracy Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.overallPerformance.accuracyRate}%</p>
                  <p className="text-gray-500 text-sm">Correct answers</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Percentile</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.comparativeAnalysis.percentile}th</p>
                  <p className="text-gray-500 text-sm">Among all students</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Alert */}
        <Alert className="mb-8 border-[#00e4a0] bg-[#00e4a0]/5">
          <Brain className="h-4 w-4 text-[#00e4a0]" />
          <AlertDescription className="text-gray-700">
            <strong>AI Insight:</strong> {analyticsData.aiInsights.motivationalMessage}
          </AlertDescription>
        </Alert>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="time-analysis">Time Analysis</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="recommendations">Study Plan</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subject Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.subjectAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="accuracy" fill="#00e4a0" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Difficulty Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Difficulty</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Easy",
                            value: analyticsData.difficultyAnalysis.easy.correct,
                            total: analyticsData.difficultyAnalysis.easy.total,
                          },
                          {
                            name: "Medium",
                            value: analyticsData.difficultyAnalysis.medium.correct,
                            total: analyticsData.difficultyAnalysis.medium.total,
                          },
                          {
                            name: "Hard",
                            value: analyticsData.difficultyAnalysis.hard.correct,
                            total: analyticsData.difficultyAnalysis.hard.total,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, total }) => `${name}: ${value}/${total}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[0, 1, 2].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart
                    data={[
                      {
                        subject: "Accuracy",
                        score: analyticsData.overallPerformance.accuracyRate,
                        fullMark: 100,
                      },
                      {
                        subject: "Speed",
                        score: analyticsData.overallPerformance.timeEfficiency,
                        fullMark: 100,
                      },
                      {
                        subject: "Consistency",
                        score: analyticsData.overallPerformance.consistencyScore,
                        fullMark: 100,
                      },
                      {
                        subject: "Easy Questions",
                        score:
                          (analyticsData.difficultyAnalysis.easy.correct /
                            analyticsData.difficultyAnalysis.easy.total) *
                          100,
                        fullMark: 100,
                      },
                      {
                        subject: "Medium Questions",
                        score:
                          (analyticsData.difficultyAnalysis.medium.correct /
                            analyticsData.difficultyAnalysis.medium.total) *
                          100,
                        fullMark: 100,
                      },
                      {
                        subject: "Hard Questions",
                        score:
                          (analyticsData.difficultyAnalysis.hard.correct /
                            analyticsData.difficultyAnalysis.hard.total) *
                          100,
                        fullMark: 100,
                      },
                    ]}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="score" stroke="#00e4a0" fill="#00e4a0" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths and Weaknesses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.aiInsights.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <p className="text-green-800 text-sm">{strength}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.aiInsights.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                        <p className="text-orange-800 text-sm">{weakness}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subject-wise Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Subject-wise Detailed Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.subjectAnalysis.map((subject, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{subject.subject}</h3>
                        <Badge
                          variant={
                            subject.accuracy >= 80 ? "default" : subject.accuracy >= 60 ? "secondary" : "destructive"
                          }
                        >
                          {subject.accuracy}% Accuracy
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">Score</p>
                          <p className="font-semibold">
                            {subject.score}/{subject.totalQuestions}
                          </p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">Avg Time</p>
                          <p className="font-semibold">{Math.round(subject.avgTimePerQuestion)}s</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">Difficulty</p>
                          <p className="font-semibold capitalize">{subject.difficulty}</p>
                        </div>
                      </div>
                      <Progress value={subject.accuracy} className="mb-3" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-green-700 mb-2">Strengths:</p>
                          <ul className="text-xs text-green-600 space-y-1">
                            {subject.strengths.map((strength, i) => (
                              <li key={i}>• {strength}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-orange-700 mb-2">Focus Areas:</p>
                          <ul className="text-xs text-orange-600 space-y-1">
                            {subject.weaknesses.map((weakness, i) => (
                              <li key={i}>• {weakness}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time Analysis Tab */}
          <TabsContent value="time-analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Time Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.timeAnalysis.timeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="questionNumber" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="time"
                        stroke="#00e4a0"
                        strokeWidth={2}
                        dot={{ fill: "#00e4a0", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Time Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm text-blue-600">Total Time</p>
                      <p className="font-semibold text-blue-900">
                        {Math.round(analyticsData.timeAnalysis.totalTime / 60)}m
                      </p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-green-600">Avg per Question</p>
                      <p className="font-semibold text-green-900">
                        {Math.round(analyticsData.timeAnalysis.avgTimePerQuestion)}s
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 border border-green-200 rounded-lg bg-green-50">
                      <p className="text-sm font-medium text-green-800 mb-1">Fastest Question:</p>
                      <p className="text-xs text-green-700">{analyticsData.timeAnalysis.fastestQuestion.question}</p>
                      <p className="text-xs text-green-600 mt-1">
                        Time: {analyticsData.timeAnalysis.fastestQuestion.time}s
                      </p>
                    </div>
                    <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                      <p className="text-sm font-medium text-orange-800 mb-1">Slowest Question:</p>
                      <p className="text-xs text-orange-700">{analyticsData.timeAnalysis.slowestQuestion.question}</p>
                      <p className="text-xs text-orange-600 mt-1">
                        Time: {analyticsData.timeAnalysis.slowestQuestion.time}s
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-[#00e4a0]" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        Key Recommendations
                      </h3>
                      <div className="space-y-2">
                        {analyticsData.aiInsights.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-blue-800 text-sm">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-purple-500" />
                        Next Steps
                      </h3>
                      <div className="space-y-2">
                        {analyticsData.aiInsights.nextSteps.map((step, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <p className="text-purple-800 text-sm">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparative Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>How You Compare</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-r from-[#00e4a0] to-[#00d494] text-white rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{analyticsData.comparativeAnalysis.percentile}th</p>
                    <p className="text-sm opacity-90">Percentile</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-900">
                      {analyticsData.comparativeAnalysis.averageScore}%
                    </p>
                    <p className="text-sm text-blue-600">Class Average</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-900">
                      {analyticsData.comparativeAnalysis.topPerformers}%
                    </p>
                    <p className="text-sm text-yellow-600">Top Performers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Study Plan Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#00e4a0]" />
                  Personalized Study Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.aiInsights.studyPlan.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-[#00e4a0] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Immediate Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.comparativeAnalysis.improvementAreas.slice(0, 3).map((area, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <p className="text-red-800 text-sm">{area}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Long-term Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.aiInsights.nextSteps.slice(0, 3).map((goal, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <Target className="h-4 w-4 text-green-500" />
                        <p className="text-green-800 text-sm">{goal}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8">
          <Button onClick={() => router.push("/exams")} variant="outline" className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exams
          </Button>
          <Button onClick={() => router.push(`/exam/${examId}`)} className="flex-1 bg-[#00e4a0] hover:bg-[#00d494]">
            Retake Exam
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>
    </div>
  )
}
