"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Star, Crown, ArrowRight, Sparkles, Brain, BarChart3, Users, Shield, Infinity } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { PublicLayout } from '@/components/public-layout'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface Plan {
  id: 'free' | 'pro'
  name: string
  price: number
  period: string
  description: string
  features: string[]
  popular?: boolean
  icon: any
  color: string
  aiFeatures: {
    examGenerations: string
    analytics: string
    exams: string
  }
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'Forever',
    description: 'Perfect for students getting started with AI-powered exam practice. 3 AI credits renew every month!',
    features: [
      'Unlimited exam taking',
      '3 AI-generated exams (monthly)',
      '3 AI analytics reports (monthly)',
      'Basic proctoring features',
      'Community support',
      'Mobile app access'
    ],
    icon: Star,
    color: 'from-blue-500 to-purple-600',
    aiFeatures: {
      examGenerations: '3 AI Generations/month',
      analytics: '3 AI Analytics/month',
      exams: 'Unlimited Exams'
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 449,
    period: 'per month',
    description: 'Unlimited AI-powered learning for serious students and professionals',
    features: [
      'Everything in Free',
      'Unlimited AI exam generation',
      'Unlimited AI analytics',
      'Advanced proctoring',
      'Custom exam branding',
      'Priority support',
      'API access',
      'Detailed performance insights',
      'Export capabilities'
    ],
    popular: true,
    icon: Crown,
    color: 'from-[#00e4a0] to-emerald-600',
    aiFeatures: {
      examGenerations: 'Unlimited AI',
      analytics: 'Unlimited Analytics',
      exams: 'Unlimited Exams'
    }
  }
]

export default function PricingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('free')

  const handlePlanSelect = (planId: 'free' | 'pro') => {
    if (planId === 'free') {
      // Free plan - redirect to signup or dashboard
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/auth/sign-up')
      }
    } else {
      // Pro plan - redirect to payment
      if (user) {
        router.push(`/api/payment?plan=${planId}`)
      } else {
        router.push('/auth/sign-up')
      }
    }
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-[#00e4a0]/5">
        {/* Breadcrumb */}
        <div className="container mx-auto px-6 pt-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Pricing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header Section */}
        <div className="container mx-auto px-6 py-12 text-center">
          <Badge className="bg-[#00e4a0]/10 text-[#00e4a0] border-[#00e4a0]/20 px-4 py-2 text-sm font-medium mb-6">
            💎 Choose Your Plan
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent
            <span className="text-[#00e4a0] block">Pricing</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Start with our free plan and upgrade when you need more AI power. Perfect for students at every level.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {plans.map((plan) => {
                const Icon = plan.icon
                const isLoading = false // No loading state in this version
                
                return (
                  <Card 
                    key={plan.id} 
                    className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                      plan.popular 
                        ? 'ring-2 ring-[#00e4a0] shadow-xl scale-105' 
                        : 'hover:shadow-lg'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#00e4a0] to-emerald-500 text-white text-center py-2 font-semibold text-sm">
                        Most Popular
                      </div>
                    )}
                    
                    <CardHeader className={plan.popular ? 'pt-8' : ''}>
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${plan.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        {plan.popular && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {plan.name}
                      </CardTitle>
                      
                      <div className="flex items-baseline space-x-2">
                        <span className="text-4xl font-bold text-gray-900">
                          {plan.price === 0 ? 'Free' : `৳${plan.price}`}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-gray-600">/{plan.period}</span>
                        )}
                      </div>
                      
                      <CardDescription className="text-gray-600 mt-2">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* AI Features Highlight */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Sparkles className="h-4 w-4 mr-2 text-[#00e4a0]" />
                          AI Features
                        </h4>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">AI Exam Generation:</span>
                            <span className="font-medium text-gray-900">{plan.aiFeatures.examGenerations}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">AI Analytics:</span>
                            <span className="font-medium text-gray-900">{plan.aiFeatures.analytics}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Regular Exams:</span>
                            <span className="font-medium text-gray-900 flex items-center">
                              <Infinity className="h-4 w-4 mr-1 text-[#00e4a0]" />
                              {plan.aiFeatures.exams}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Everything included:</h4>
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <Check className="h-5 w-5 text-[#00e4a0] mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <Button
                        onClick={() => handlePlanSelect(plan.id)}
                        disabled={isLoading}
                        className={`w-full h-12 text-lg font-semibold transition-all duration-300 ${
                          plan.popular
                            ? 'bg-gradient-to-r from-[#00e4a0] to-emerald-500 hover:from-[#00d494] hover:to-emerald-600 text-black'
                            : 'bg-white border-2 border-gray-200 text-gray-900 hover:border-[#00e4a0] hover:text-[#00e4a0]'
                        }`}
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>
                              {plan.id === 'free' ? 'Get Started Free' : 'Upgrade to Pro'}
                            </span>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </Button>

                      {plan.id === 'pro' && (
                        <p className="text-center text-sm text-gray-500">
                          Cancel anytime • No setup fees
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about our AI-powered exam platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What's included in the Free plan?
                  </h3>
                  <p className="text-gray-600">
                    The Free plan includes unlimited exam taking, 3 AI-generated exams per month, 
                    3 AI analytics reports per month, and basic proctoring features. Your AI credits 
                    automatically renew every 30 days.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    How do AI exam generations work?
                  </h3>
                  <p className="text-gray-600">
                    Our AI analyzes your study materials and creates personalized exam 
                    questions tailored to your learning level and subject expertise.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Can I cancel my Pro subscription anytime?
                  </h3>
                  <p className="text-gray-600">
                    Yes, you can cancel your Pro subscription at any time. You'll continue 
                    to have access until the end of your billing period.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What are AI analytics?
                  </h3>
                  <p className="text-gray-600">
                    AI analytics provide detailed insights into your performance, 
                    learning patterns, strengths, weaknesses, and personalized study recommendations.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibent text-gray-900 mb-2">
                    Is there a student discount?
                  </h3>
                  <p className="text-gray-600">
                    Our pricing is already student-friendly at ৳449/month. 
                    Contact us for institutional pricing for schools and universities.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    How secure is the proctoring system?
                  </h3>
                  <p className="text-gray-600">
                    We use advanced AI-powered proctoring with multiple security layers 
                    including face detection, browser monitoring, and real-time analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
} 