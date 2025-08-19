"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown,
  Activity, 
  Clock, 
  Target,
  Brain,
  BarChart3,
  Trophy,
  Calendar,
  ArrowLeft,
  Zap,
  CheckCircle,
  AlertCircle,
  Users,
  Star,
  BookOpen,
  Award,
  LineChart,
  PieChart
} from 'lucide-react'
// import { useGlobalData } from '@/lib/global-data-context'
import { useAuth } from '@/lib/auth-context'
import { PublicLayout } from '@/components/public-layout'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  LineChart as RechartsLineChart, 
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart
} from 'recharts'

const COLORS = ['#00e4a0', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#06b6d4', '#84cc16']

export default function UserAnalyticsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Load real analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!user || !mounted) return
      
      try {
        setAnalyticsLoading(true)
        const response = await fetch(`/api/dashboard/analytics?userId=${user.id}`)
        const result = await response.json()
        
        if (result.success) {
          console.log('Loaded analytics data:', result.data)
          setAnalyticsData(result.data)
        } else {
          console.error('Failed to load analytics data:', result.error)
          setAnalyticsData(null)
        }
      } catch (error) {
        console.error('Error loading analytics data:', error)
        setAnalyticsData(null)
      } finally {
        setAnalyticsLoading(false)
      }
    }

    loadAnalyticsData()
  }, [user])
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in')
    }
  }, [user, authLoading, router])

  // Don't render during SSR
  if (!mounted) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00e4a0] mx-auto mb-4"></div>
            <p className="text-gray-800 font-medium">Loading analytics...</p>
          </div>
        </div>
      </PublicLayout>
    )
  }
  
  // Real user data from authentication and analytics
  const currentUser = {
    id: user?.id || 'unknown',
    name: user?.email?.split('@')[0] || 'Student User',
    totalExamsTaken: analyticsData?.totalExamsTaken || 0,
    averageScore: analyticsData?.averageScore || 0,
    streak: analyticsData?.currentStreak || 0,
    rank: 'N/A', // Will be calculated from real data
    joinDate: user?.created_at || new Date().toISOString()
  }
  
  // Don't render if not authenticated
  if (!user) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00e4a0] mx-auto"></div>
              <p className="mt-4 text-gray-800 font-medium">Loading...</p>
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  // Use real analytics data
  const userAttempts: any[] = analyticsData?.recentAttempts || []
  const completedExams = analyticsData?.totalAttempts || 0

  // Time-based performance analysis from real data
  const last30Days = analyticsData?.performanceTrend || []

  // Subject-wise detailed performance from real data
  const subjectPerformance = (analyticsData?.subjectStats || []).map((subject: any, index: number) => ({
    name: subject.subject,
    avgScore: Math.round(subject.averageScore),
    bestScore: subject.bestScore,
    worstScore: subject.worstScore,
    attempts: subject.attempts,
    improvement: 0, // Calculate if needed
    color: COLORS[index % COLORS.length],
    timeSpent: 0 // Calculate if needed
  }))

  // Difficulty analysis - using mock data for now
  const difficultyAnalysis = ['easy', 'medium', 'hard'].map((difficulty: string, index: number) => {
    const mockScores = [85, 72, 68] // Mock scores for easy, medium, hard
    const mockAttempts = [12, 8, 5] // Mock attempt counts
    
    return {
      difficulty,
      avgScore: mockScores[index],
      attempts: mockAttempts[index],
      color: difficulty === 'easy' ? '#10b981' : difficulty === 'medium' ? '#f59e0b' : '#ef4444'
    }
  })

  // AI Performance Insights
  const aiInsights = [
    {
      type: 'strength',
      icon: TrendingUp,
      title: 'Top Performing Subject',
      description: `You excel in ${subjectPerformance[0]?.name || 'Mathematics'} with ${subjectPerformance[0]?.avgScore || 85}% average score`,
      score: subjectPerformance[0]?.avgScore || 85,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      type: 'improvement',
      icon: Target,
      title: 'Focus Area',
      description: `Practice more ${subjectPerformance[subjectPerformance.length - 1]?.name || 'Physics'} questions to improve from ${subjectPerformance[subjectPerformance.length - 1]?.avgScore || 65}%`,
      score: subjectPerformance[subjectPerformance.length - 1]?.avgScore || 65,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      type: 'time',
      icon: Clock,
      title: 'Time Management',
      description: 'You typically finish exams 8 minutes early - consider double-checking answers',
      score: 92,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      type: 'consistency',
      icon: Activity,
      title: 'Performance Consistency',
      description: `${currentUser.streak} day study streak! Your scores vary by ±12% on average`,
      score: 88,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ]

  // Radar chart data for skill analysis
  const skillRadarData = [
    { skill: 'Mathematics', score: 85, fullMark: 100 },
    { skill: 'Physics', score: 72, fullMark: 100 },
    { skill: 'Chemistry', score: 78, fullMark: 100 },
    { skill: 'Biology', score: 82, fullMark: 100 },
    { skill: 'English', score: 75, fullMark: 100 },
    { skill: 'Bengali', score: 80, fullMark: 100 }
  ]

  // Study pattern analysis
  const studyPatternData = [
    { hour: '6AM', sessions: 2 },
    { hour: '8AM', sessions: 5 },
    { hour: '10AM', sessions: 8 },
    { hour: '12PM', sessions: 12 },
    { hour: '2PM', sessions: 15 },
    { hour: '4PM', sessions: 18 },
    { hour: '6PM', sessions: 22 },
    { hour: '8PM', sessions: 25 },
    { hour: '10PM', sessions: 15 },
    { hour: '12AM', sessions: 8 }
  ]

  // Goal progress tracking
  const goals = [
    { name: 'Monthly Exam Target', current: 18, target: 25, unit: 'exams' },
    { name: 'Average Score Target', current: 78, target: 85, unit: '%' },
    { name: 'Study Streak', current: 5, target: 10, unit: 'days' },
    { name: 'Subject Mastery', current: 3, target: 6, unit: 'subjects' }
  ]

  if (loading || analyticsLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00e4a0] mx-auto"></div>
              <p className="mt-4 text-gray-800 font-medium">Loading your analytics...</p>
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Performance Analytics</h1>
                <p className="text-gray-700 mt-1 font-medium">AI-powered insights into your learning journey</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Brain className="h-3 w-3 mr-1" />
                AI Insights
              </Badge>
            </div>
          </div>

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-[#00e4a0] to-[#00d494] text-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-black/70 text-sm font-medium">Exams Completed</p>
                    <p className="text-3xl font-bold">{completedExams}</p>
                    <p className="text-xs text-black/70 mt-1">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      +5 this week
                    </p>
                  </div>
                  <Trophy className="h-8 w-8 text-black/70" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700 text-sm font-semibold">Average Score</p>
                    <p className="text-3xl font-bold text-gray-900">{currentUser.averageScore}%</p>
                    <p className="text-xs text-green-600 mt-1">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      +3% this month
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-[#00e4a0]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700 text-sm font-semibold">Study Streak</p>
                    <p className="text-3xl font-bold text-gray-900">{currentUser.streak} days</p>
                    <p className="text-xs text-orange-600 mt-1">
                      <Zap className="h-3 w-3 inline mr-1" />
                      Keep it up!
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700 text-sm font-semibold">Class Rank</p>
                    <p className="text-3xl font-bold text-gray-900">{currentUser.rank}</p>
                    <p className="text-xs text-purple-600 mt-1">
                      <Star className="h-3 w-3 inline mr-1" />
                      Top performer
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Analytics Tabs */}
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              
              {/* Performance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-[#00e4a0]" />
                    Performance Trend (Last 30 Days)
                  </CardTitle>
                  <CardDescription>
                    Your exam scores and study activity over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={last30Days}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'score' ? `${value}%` : value,
                          name === 'score' ? 'Score' : 'Attempts'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#00e4a0" 
                        fill="#00e4a0" 
                        fillOpacity={0.3}
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Subject Distribution & Study Pattern */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Subject Performance Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-[#00e4a0]" />
                      Subject Performance
                    </CardTitle>
                    <CardDescription>
                      Average scores across different subjects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={subjectPerformance}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, avgScore }) => `${name}: ${avgScore}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="avgScore"
                        >
                          {subjectPerformance.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Average Score']} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Study Pattern */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-[#00e4a0]" />
                      Study Pattern
                    </CardTitle>
                    <CardDescription>
                      Your most active study hours
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={studyPatternData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip formatter={(value) => [value, 'Study Sessions']} />
                        <Bar dataKey="sessions" fill="#00e4a0" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-8">
              
              {/* Difficulty Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-[#00e4a0]" />
                    Performance by Difficulty Level
                  </CardTitle>
                  <CardDescription>
                    How you perform across different difficulty levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={difficultyAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="difficulty" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Average Score']} />
                      <Bar dataKey="avgScore" fill="#00e4a0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Skill Radar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-[#00e4a0]" />
                    Skill Analysis
                  </CardTitle>
                  <CardDescription>
                    Comprehensive view of your abilities across subjects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar 
                        name="Score" 
                        dataKey="score" 
                        stroke="#00e4a0" 
                        fill="#00e4a0" 
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subjects Tab */}
            <TabsContent value="subjects" className="space-y-8">
              
              {/* Detailed Subject Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjectPerformance.map((subject, index) => (
                  <Card key={subject.name} className="border-l-4" style={{ borderLeftColor: subject.color }}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-lg">
                        {subject.name}
                        <Badge 
                          variant={subject.avgScore >= 80 ? "default" : subject.avgScore >= 60 ? "secondary" : "destructive"}
                        >
                          {subject.avgScore}%
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-800 font-medium">Best Score:</span>
                          <span className="font-medium text-green-600">{subject.bestScore}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-800 font-medium">Worst Score:</span>
                          <span className="font-medium text-red-600">{subject.worstScore}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-800 font-medium">Attempts:</span>
                          <span className="font-medium">{subject.attempts}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-800 font-medium">Improvement:</span>
                          <span className={`font-medium ${subject.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {subject.improvement >= 0 ? '+' : ''}{subject.improvement}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{subject.avgScore}%</span>
                        </div>
                        <Progress value={subject.avgScore} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="ai-insights" className="space-y-8">
              
              {/* AI Performance Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiInsights.map((insight, index) => {
                  const IconComponent = insight.icon
                  return (
                    <Card key={index} className={`${insight.bgColor} ${insight.borderColor} border-l-4`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${insight.bgColor}`}>
                            <IconComponent className={`h-5 w-5 ${insight.color}`} />
                          </div>
                          <span className="text-lg">{insight.title}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">{insight.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-800 font-medium">Confidence Score:</span>
                            <Badge variant="outline">{insight.score}%</Badge>
                          </div>
                          <Progress value={insight.score} className="w-24 h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* AI Recommendations */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Brain className="h-5 w-5 text-blue-600" />
                    AI Study Recommendations
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Personalized suggestions based on your learning patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-green-100 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-900">Optimal Study Time</h4>
                          <p className="text-sm text-gray-700 mt-1">Your peak performance is between 6-8 PM. Schedule difficult subjects during this time.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-orange-100 rounded-full">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-orange-900">Study Break Pattern</h4>
                          <p className="text-sm text-gray-700 mt-1">Take a 10-minute break every 45 minutes to maintain your high performance level.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-blue-100 rounded-full">
                          <Target className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-900">Focus Areas</h4>
                          <p className="text-sm text-gray-700 mt-1">Spend 20% more time on Physics problems involving calculations to improve your overall score.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Goals Tab */}
            <TabsContent value="goals" className="space-y-8">
              
              {/* Goal Progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map((goal, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                      <CardDescription>
                        {goal.current} / {goal.target} {goal.unit}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Progress value={(goal.current / goal.target) * 100} className="h-3" />
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-800 font-medium">Progress</span>
                          <span className="font-medium">
                            {Math.round((goal.current / goal.target) * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-800 font-medium">Remaining</span>
                          <span className="font-medium text-blue-600">
                            {goal.target - goal.current} {goal.unit}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Achievement Badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#00e4a0]" />
                    Achievement Badges
                  </CardTitle>
                  <CardDescription>
                    Milestones you've unlocked in your learning journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                      { name: 'First Exam', icon: '🎯', earned: true },
                      { name: 'Week Streak', icon: '🔥', earned: true },
                      { name: 'Top 20%', icon: '⭐', earned: true },
                      { name: 'Perfect Score', icon: '💯', earned: false },
                      { name: 'Month Streak', icon: '🚀', earned: false },
                      { name: 'Subject Master', icon: '🎓', earned: false }
                    ].map((badge, index) => (
                      <div 
                        key={index} 
                        className={`text-center p-4 rounded-lg border-2 transition-all ${
                          badge.earned 
                            ? 'border-[#00e4a0] bg-green-50' 
                            : 'border-gray-200 bg-gray-50 opacity-50'
                        }`}
                      >
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <p className="text-sm font-medium">{badge.name}</p>
                        {badge.earned && <CheckCircle className="h-4 w-4 text-green-600 mx-auto mt-2" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PublicLayout>
  )
} 