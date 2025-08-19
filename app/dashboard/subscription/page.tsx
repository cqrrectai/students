"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth-context'
import { useUserSubscription } from '@/hooks/useSubscriptions'
import { Check, Crown, Zap, Star, CreditCard, Users, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import PaymentModal from '@/components/PaymentModal'
import { PublicLayout } from '@/components/public-layout'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'

const plans = [
  {
    id: 'free' as const,
    name: 'Free',
    price: 0,
    currency: '৳',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Up to 1,000 students',
      'Up to 10 exams per month',
      '3 AI exam generations',
      '10 Bulk import/export',
      'AI analytics',
      'Email results',
      'Basic analytics',
      'Email support',
    ],
    limits: {
      students: 1000,
      exams: 10,
    },
    popular: false,
    note: '5% commission on exam sales',
  },
  {
    id: 'standard' as const,
    name: 'Standard',
    price: 299,
    currency: '৳',
    period: 'month',
    description: 'Great for growing educators',
    features: [
      'Up to 2,000 students',
      '100 exams per month',
      'Unlimited AI generations',
      'Unlimited Bulk import/export',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
    ],
    limits: {
      students: 2000,
      exams: 100,
    },
    popular: true,
    note: '5% commission on exam sales',
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 999,
    currency: '৳',
    period: 'month',
    description: 'For professional educators',
    features: [
      'Unlimited students',
      'Unlimited exams',
      'Unlimited AI generations',
      'Unlimited Bulk import/export',
      'AI-powered analytics',
      'AI grading assistance',
      'Custom domain',
      '24/7 phone support',
      'No commission on sales',
    ],
    limits: {
      students: -1, // unlimited
      exams: -1, // unlimited
    },
    popular: false,
    highlight: 'Commission Free!',
  },
]

export default function SubscriptionPage() {
  const { user } = useAuth()
  const { data: subscription, isLoading: subscriptionLoading } = useUserSubscription()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'pro'>('standard')
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for payment success
  useEffect(() => {
    const paymentStatus = searchParams.get('payment')
    if (paymentStatus === 'success') {
      setPaymentSuccess(true)
      // Clear the URL parameter
      router.replace('/dashboard/subscription')
    }
  }, [searchParams, router])

  // Get current plan
  const currentPlan = subscription?.plan || 'free'
  const current = plans.find(plan => plan.id === currentPlan)

  // Mock usage data - replace with actual data from dashboard stats
  const currentStudents = 0 // This should come from actual stats
  const currentExams = 0 // This should come from actual stats

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // unlimited
    return Math.min((used / limit) * 100, 100)
  }

  const handleUpgrade = (planId: 'standard' | 'pro') => {
    if (planId === currentPlan) return
    
    setSelectedPlan(planId)
    setShowPaymentModal(true)
  }

  const isNearLimit = (used: number, limit: number) => {
    if (limit === -1) return false
    return (used / limit) >= 0.8 // 80% or more
  }

  if (!user) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
                <p className="text-sm text-gray-800 mb-4 font-medium">
                  Please sign in to view your subscription details.
                </p>
                <Button onClick={() => router.push('/auth/sign-in')}>
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    )
  }

  if (subscriptionLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-8 h-8 bg-[#00e4a0] rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <p className="text-gray-800 font-medium">Loading subscription...</p>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Subscription & Billing</h1>
              <p className="text-gray-700 font-medium">Manage your subscription and view usage statistics</p>
            </div>

            {/* Payment Success Alert */}
            {paymentSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Payment successful! Your subscription has been updated.
                </AlertDescription>
              </Alert>
            )}

            {/* Current Plan Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Current Plan: {current?.name}
                      {current?.popular && <Badge className="bg-green-600">Popular</Badge>}
                      {subscription?.status !== 'active' && subscription?.status && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          {subscription.status}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {current?.description}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {current?.currency}{current?.price}
                      <span className="text-sm font-normal text-gray-500">/{current?.period}</span>
                    </p>
                    {subscription?.end_date && (
                      <p className="text-sm text-gray-500">
                        {subscription.status === 'active' ? 'Renews' : 'Expires'} on{' '}
                        {new Date(subscription.end_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Students Usage */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Students</span>
                        {isNearLimit(currentStudents, current?.limits.students || 10) && (
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                      <span className="text-sm text-gray-800 font-medium">
                        {currentStudents} / {current?.limits.students === -1 ? '∞' : current?.limits.students}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(currentStudents, current?.limits.students || 10)} 
                      className="h-2"
                    />
                  </div>

                  {/* Exams Usage */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Exams</span>
                        {isNearLimit(currentExams, current?.limits.exams || 5) && (
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                      <span className="text-sm text-gray-800 font-medium">
                        {currentExams} / {current?.limits.exams === -1 ? '∞' : current?.limits.exams}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(currentExams, current?.limits.exams || 5)} 
                      className="h-2"
                    />
                  </div>
                </div>

                {currentPlan === 'free' && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Ready to grow?</strong> Upgrade to unlock unlimited exams and advanced features.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Plans */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card key={plan.id} className={`relative ${plan.popular ? 'border-green-500 shadow-lg' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-green-600">Most Popular</Badge>
                      </div>
                    )}
                    
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {plan.name}
                          {plan.id === 'pro' && <Crown className="w-5 h-5 text-yellow-500" />}
                          {plan.id === 'standard' && <Zap className="w-5 h-5 text-blue-500" />}
                        </CardTitle>
                        {plan.id === currentPlan && (
                          <Badge variant="outline">Current</Badge>
                        )}
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                      
                      <div className="mt-4">
                        <span className="text-3xl font-bold text-gray-900">
                          {plan.currency}{plan.price}
                        </span>
                        <span className="text-gray-500">/{plan.period}</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-800 font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className={`w-full ${
                          plan.id === currentPlan 
                            ? 'bg-gray-600 hover:bg-gray-700' 
                            : plan.popular 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-[#00e4a0] hover:bg-[#00d494] text-black'
                        }`}
                        disabled={plan.id === currentPlan}
                        onClick={() => plan.price > 0 && handleUpgrade(plan.id as 'standard' | 'pro')}
                      >
                        {plan.id === currentPlan ? (
                          'Current Plan'
                        ) : plan.price === 0 ? (
                          'Free Plan'
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Upgrade to {plan.name}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Billing History */}
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>Your payment history and invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No billing history</h3>
                  <p className="text-gray-700 font-medium">
                    Your payment history will appear here once you upgrade to a paid plan.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Modal */}
            <PaymentModal
              open={showPaymentModal}
              onOpenChange={setShowPaymentModal}
              type="subscription"
              subscriptionPlan={selectedPlan}
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}