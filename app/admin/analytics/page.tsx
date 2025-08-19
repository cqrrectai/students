"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown,
  Clock,
  Target,
  RefreshCw,
  ArrowLeft,
  Download,
  DollarSign,
  UserPlus,
  Activity,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line
} from 'recharts'

interface StartupMetrics {
  acquisition: {
    newUserSignups: number
    dailySignups: Array<{ date: string; count: number }>
    acquisitionSources: Array<{ source: string; count: number; percentage: number }>
    growthRate: number
  }
  engagement: {
    dailyActiveUsers: number
    monthlyActiveUsers: number
    dauMauRatio: number
    examCompletionRate: number
    aiFeatureUsage: number
    averageSessionDuration: number
  }
  revenue: {
    monthlyRecurringRevenue: number
    conversionToPaidRate: number
    customerLifetimeValue: number
    paymentSuccessRate: number
    revenueGrowth: number
  }
  operational: {
    systemUptime: number
    averageResponseTime: number
    supportTickets: number
    activeIssues: number
  }
}

const COLORS = ['#00e4a0', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981']

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [selectedExamType, setSelectedExamType] = useState('all')
  const [startupMetrics, setStartupMetrics] = useState<StartupMetrics | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [selectedPeriod, selectedExamType])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedExamType !== 'all' && { exam_type: selectedExamType })
      })

      const response = await fetch(`/api/admin/analytics?${params}`)
      const result = await response.json()

      if (response.ok && result.success) {
        const { acquisition, engagement, revenue, operational } = result.data
        setStartupMetrics({ acquisition, engagement, revenue, operational })
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00e4a0]"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Startup Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive metrics for growth, engagement, and revenue</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Select value={selectedExamType} onValueChange={setSelectedExamType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Exam Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="HSC">HSC</SelectItem>
              <SelectItem value="SSC">SSC</SelectItem>
              <SelectItem value="University">University</SelectItem>
              <SelectItem value="Job Preparation">Job Preparation</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Startup Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-[#00e4a0]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Sign-Ups</CardTitle>
            <UserPlus className="h-4 w-4 text-[#00e4a0]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{startupMetrics?.acquisition.newUserSignups || 0}</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">{startupMetrics?.acquisition.growthRate || 0}% vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DAU/MAU Ratio</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{startupMetrics?.engagement.dauMauRatio || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {startupMetrics?.engagement.dailyActiveUsers || 0} daily / {startupMetrics?.engagement.monthlyActiveUsers || 0} monthly
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(startupMetrics?.revenue.monthlyRecurringRevenue || 0)}</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">{startupMetrics?.revenue.revenueGrowth || 0}% growth</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{startupMetrics?.operational.systemUptime || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Uptime • {startupMetrics?.operational.averageResponseTime || 0}ms avg
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="growth" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Trends</CardTitle>
              <CardDescription>Daily sign-ups and growth rate over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={startupMetrics?.acquisition.dailySignups || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#00e4a0" 
                      fill="#00e4a0" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Overview</CardTitle>
              <CardDescription>User activity and completion metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#00e4a0]">{startupMetrics?.engagement.dailyActiveUsers || 0}</p>
                  <p className="text-sm text-gray-600">Daily Active Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{startupMetrics?.engagement.monthlyActiveUsers || 0}</p>
                  <p className="text-sm text-gray-600">Monthly Active Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{startupMetrics?.engagement.dauMauRatio || 0}%</p>
                  <p className="text-sm text-gray-600">DAU/MAU Ratio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(startupMetrics?.revenue.monthlyRecurringRevenue || 0)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold">{startupMetrics?.revenue.conversionToPaidRate || 0}%</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Customer LTV</p>
                    <p className="text-2xl font-bold">{formatCurrency(startupMetrics?.revenue.customerLifetimeValue || 0)}</p>
                  </div>
                  <UserPlus className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payment Success</p>
                    <p className="text-2xl font-bold">{startupMetrics?.revenue.paymentSuccessRate || 0}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Uptime</p>
                    <p className="text-2xl font-bold text-green-600">{startupMetrics?.operational.systemUptime || 0}%</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Response Time</p>
                    <p className="text-2xl font-bold">{startupMetrics?.operational.averageResponseTime || 0}ms</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Support Tickets</p>
                    <p className="text-2xl font-bold">{startupMetrics?.operational.supportTickets || 0}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Issues</p>
                    <p className="text-2xl font-bold">{startupMetrics?.operational.activeIssues || 0}</p>
                  </div>
                  <Zap className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}