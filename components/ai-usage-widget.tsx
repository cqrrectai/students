"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Brain, Zap, TrendingUp } from 'lucide-react'

interface AIUsageWidgetProps {
  compact?: boolean
}

export function AIUsageWidget({ compact = false }: AIUsageWidgetProps) {
  const [usage, setUsage] = useState({
    examGenerations: { used: 2, limit: 3 },
    analytics: { used: 1, limit: 3 },
    chatSessions: { used: 5, limit: 10 }
  })

  const examGenPercentage = (usage.examGenerations.used / usage.examGenerations.limit) * 100
  const analyticsPercentage = (usage.analytics.used / usage.analytics.limit) * 100
  const chatPercentage = (usage.chatSessions.used / usage.chatSessions.limit) * 100

  if (compact) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-[#00e4a0]" />
            AI Usage This Month
          </CardTitle>
          <CardDescription>
            Track your AI-powered features usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Exam Generation</span>
                <Badge variant="outline">{usage.examGenerations.used}/{usage.examGenerations.limit}</Badge>
              </div>
              <Progress value={examGenPercentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Analytics</span>
                <Badge variant="outline">{usage.analytics.used}/{usage.analytics.limit}</Badge>
              </div>
              <Progress value={analyticsPercentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Chat Sessions</span>
                <Badge variant="outline">{usage.chatSessions.used}/{usage.chatSessions.limit}</Badge>
              </div>
              <Progress value={chatPercentage} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-[#00e4a0]" />
          AI Usage Dashboard
        </CardTitle>
        <CardDescription>
          Monitor your AI-powered features usage and limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Exam Generation</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Used this month</span>
                <Badge variant="outline">{usage.examGenerations.used}/{usage.examGenerations.limit}</Badge>
              </div>
              <Progress value={examGenPercentage} className="h-3" />
              <p className="text-xs text-gray-500">
                {usage.examGenerations.limit - usage.examGenerations.used} generations remaining
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="font-medium">AI Analytics</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Used this month</span>
                <Badge variant="outline">{usage.analytics.used}/{usage.analytics.limit}</Badge>
              </div>
              <Progress value={analyticsPercentage} className="h-3" />
              <p className="text-xs text-gray-500">
                {usage.analytics.limit - usage.analytics.used} analyses remaining
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-green-600" />
              <span className="font-medium">Chat Sessions</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Used this month</span>
                <Badge variant="outline">{usage.chatSessions.used}/{usage.chatSessions.limit}</Badge>
              </div>
              <Progress value={chatPercentage} className="h-3" />
              <p className="text-xs text-gray-500">
                {usage.chatSessions.limit - usage.chatSessions.used} sessions remaining
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}