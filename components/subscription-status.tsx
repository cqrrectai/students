"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Crown, Star, Users, Zap, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { getUserSubscription, getSubscriptionStatus, getPlanLimits, getUpgradeRecommendations, type SubscriptionPlan } from '@/lib/subscription-utils'
import { useAuth } from '@/lib/simple-auth-context'

interface SubscriptionStatusProps {
  showUpgradeButton?: boolean
  compact?: boolean
}

export function SubscriptionStatus({ showUpgradeButton = true, compact = false }: SubscriptionStatusProps) {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSubscription = async () => {
      if (!user?.id) return
      
      try {
        const sub = await getUserSubscription(user.id)
        setSubscription(sub)
      } catch (error) {
        console.error('Error loading subscription:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubscription()
  }, [user?.id])

  if (loading) {
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardContent className={compact ? "p-0" : "p-6"}>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const status = getSubscriptionStatus(subscription)
  const limits = getPlanLimits(status.plan)
  
  // Mock usage data (in a real app, you'd fetch this from your analytics)
  const usage = {
    studentCount: Math.floor(Math.random() * limits.studentLimit),
    examCount: Math.floor(Math.random() * limits.examLimit),
    needsAdvancedFeatures: false
  }

  const recommendations = getUpgradeRecommendations(status.plan, usage)

  const getPlanIcon = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'free':
        return Users
      case 'standard':
        return Star
      case 'pro':
        return Crown
      default:
        return Users
    }
  }

  const getPlanColor = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'free':
        return 'bg-gray-500'
      case 'standard':
        return 'bg-blue-500'
      case 'pro':
        return 'bg-gradient-to-r from-purple-500 to-pink-500'
      default:
        return 'bg-gray-500'
    }
  }

  const Icon = getPlanIcon(status.plan)

  if (compact) {
    return (
      <Card className="border-l-4 border-l-[#00e4a0]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getPlanColor(status.plan)}`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold capitalize">{status.plan} Plan</p>
                <p className="text-sm text-gray-600">{status.message}</p>
              </div>
            </div>
            {showUpgradeButton && recommendations.shouldUpgrade && (
              <Button asChild size="sm" className="bg-[#00e4a0] hover:bg-[#00d494]">
                <Link href="/pricing">Upgrade</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${getPlanColor(status.plan)}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="capitalize">{status.plan} Plan</CardTitle>
              <CardDescription>{status.message}</CardDescription>
            </div>
          </div>
          <Badge variant={status.isActive ? "default" : "destructive"}>
            {status.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Plan Features */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Students</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{usage.studentCount}</span>
                <span>{limits.studentLimit === -1 ? '∞' : limits.studentLimit}</span>
              </div>
              <Progress 
                value={limits.studentLimit === -1 ? 0 : (usage.studentCount / limits.studentLimit) * 100} 
                className="h-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Exams</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{usage.examCount}</span>
                <span>{limits.examLimit === -1 ? '∞' : limits.examLimit}</span>
              </div>
              <Progress 
                value={limits.examLimit === -1 ? 0 : (usage.examCount / limits.examLimit) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </div>

        {/* Expiration Warning */}
        {status.daysRemaining !== null && status.daysRemaining <= 7 && status.daysRemaining > 0 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Calendar className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Your subscription expires in {status.daysRemaining} days
            </p>
          </div>
        )}

        {/* Upgrade Recommendations */}
        {recommendations.shouldUpgrade && (
          <div className="p-4 bg-gradient-to-r from-[#00e4a0]/10 to-blue-500/10 border border-[#00e4a0]/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-[#00e4a0] mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Upgrade Recommended</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {recommendations.reasons.map((reason, index) => (
                    <li key={index}>• {reason}</li>
                  ))}
                </ul>
                {showUpgradeButton && (
                  <Button asChild size="sm" className="mt-3 bg-[#00e4a0] hover:bg-[#00d494]">
                    <Link href="/pricing">
                      Upgrade to {recommendations.recommendedPlan}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {showUpgradeButton && (
            <Button asChild variant="outline" className="flex-1">
              <Link href="/pricing">View Plans</Link>
            </Button>
          )}
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard/billing">Billing History</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 