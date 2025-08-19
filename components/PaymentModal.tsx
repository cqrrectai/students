"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useUddoktapayPayment } from '@/hooks/useUddoktapayPayment'
import { Check, CreditCard, Shield, X, CheckCircle } from 'lucide-react'

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'exam' | 'subscription'
  examId?: string
  examPrice?: number
  subscriptionPlan?: 'standard' | 'pro'
}

const PaymentModal = ({ open, onOpenChange, type, examId, examPrice, subscriptionPlan }: PaymentModalProps) => {
  const [studentName, setStudentName] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [error, setError] = useState('')
  const { createPayment, isCreatingPayment } = useUddoktapayPayment()

  const subscriptionPlans: {
    [key: string]: {
      name: string
      price: number
      currency: string
      period: string
      features: string[]
      highlight?: string
    }
  } = {
    standard: {
      name: 'Standard',
      price: 299,
      currency: '৳',
      period: 'month',
      features: [
        'Up to 2,000 students',
        '100 exams per month',
        'Unlimited AI generations',
        'Advanced analytics',
        'Priority support',
        'Custom branding'
      ]
    },
    pro: {
      name: 'Pro',
      price: 999,
      currency: '৳',
      period: 'month',
      features: [
        'Unlimited students',
        'Unlimited exams',
        'Unlimited AI generations',
        'AI-powered analytics',
        'AI grading assistance',
        'Custom domain',
        '24/7 phone support',
        'No commission on sales'
      ],
      highlight: 'Commission Free!'
    }
  }

  const handlePayment = async () => {
    if (!studentName.trim() || !studentEmail.trim()) {
      setError('Please fill in all fields')
      return
    }

    setError('')

    let amount: number
    let paymentData: any = {
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim()
    }

    if (type === 'exam') {
      amount = examPrice || 0
      paymentData.examId = examId
    } else {
      const plan = subscriptionPlans[subscriptionPlan!]
      amount = plan.price
      paymentData.subscriptionPlan = subscriptionPlan
    }

    paymentData.amount = amount

    try {
      console.log('Initiating payment:', paymentData)
      const result = await createPayment(paymentData)
      
      if (!result.success) {
        setError(result.error || 'Payment failed')
      }
      // If successful, the user will be redirected to payment page
    } catch (error: any) {
      console.error('Payment failed:', error)
      setError(error.message || 'Payment failed')
    }
  }

  const currentPlan = subscriptionPlan ? subscriptionPlans[subscriptionPlan] : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
            {type === 'exam' ? 'Exam Payment' : 'Upgrade Subscription'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {type === 'exam' 
              ? 'Complete payment to access this exam'
              : 'Choose your subscription plan and complete payment'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {/* Payment Details */}
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">
                    {type === 'exam' ? 'Exam Access' : `${currentPlan?.name} Plan`}
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    ৳{type === 'exam' ? examPrice : currentPlan?.price}
                  </span>
                </div>
                {type === 'subscription' && currentPlan && (
                  <div className="text-xs text-gray-500">
                    <p>Features included:</p>
                    <ul className="mt-1 space-y-1">
                      {currentPlan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                      {currentPlan.features.length > 3 && (
                        <li className="text-gray-400">+ {currentPlan.features.length - 3} more features</li>
                      )}
                    </ul>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium text-sm sm:text-base">Total</span>
                  <span className="font-bold text-base sm:text-lg">
                    ৳{type === 'exam' ? examPrice : currentPlan?.price}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Information */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="studentName" className="text-xs sm:text-sm">Full Name</Label>
            <Input
              id="studentName"
              type="text"
              placeholder="Enter your full name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="text-sm"
              required
            />
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="studentEmail" className="text-xs sm:text-sm">Email Address</Label>
            <Input
              id="studentEmail"
              type="email"
              placeholder="Enter your email address"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className="text-sm"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Payment Features */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-3 sm:pt-4">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm font-medium">Secure Payment</span>
              </div>
              <ul className="text-xs text-green-600 space-y-1">
                <li className="flex items-center gap-1">
                  <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  SSL encrypted payment processing
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  Multiple payment methods supported
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  Instant access after payment
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 text-xs sm:text-sm"
              disabled={isCreatingPayment}
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1 text-xs sm:text-sm bg-[#00e4a0] hover:bg-[#00d494] text-black"
              disabled={!studentName.trim() || !studentEmail.trim() || isCreatingPayment}
            >
              {isCreatingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-black mr-1 sm:mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Pay ৳{type === 'exam' ? examPrice : currentPlan?.price}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentModal