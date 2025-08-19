"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

interface PaymentRequest {
  examId?: string
  subscriptionPlan?: 'standard' | 'pro'
  amount: number
  studentEmail: string
  studentName: string
}

interface PaymentResponse {
  success: boolean
  payment_url?: string
  transaction_id?: string
  invoice_id?: string
  error?: string
}

export const useUddoktapayPayment = () => {
  const { user } = useAuth()
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false)

  const createPayment = async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
    setIsCreatingPayment(true)
    
    try {
      console.log('Creating payment with data:', paymentData)
      
      // Set different return URL based on payment type
      let returnUrl: string
      if (paymentData.examId) {
        // For exam payments, redirect back to exam page
        returnUrl = `${window.location.origin}/exam/${paymentData.examId}?payment=success`
      } else {
        // For subscription payments, redirect to subscription page
        returnUrl = `${window.location.origin}/dashboard/subscription?payment=success`
      }

      const { data, error } = await supabase.functions.invoke('uddoktapay-payment', {
        body: {
          ...paymentData,
          returnUrl,
          userId: user?.id // Ensure user ID is passed
        }
      })

      if (error) {
        console.error('Payment creation error:', error)
        throw new Error(error.message || 'Failed to create payment session')
      }
      
      console.log('Payment creation response:', data)
      
      if (data.payment_url) {
        // Redirect to payment page in the same tab
        window.location.href = data.payment_url
        return {
          success: true,
          payment_url: data.payment_url,
          transaction_id: data.transaction_id,
          invoice_id: data.invoice_id
        }
      } else {
        throw new Error('Payment URL not received')
      }
    } catch (error: any) {
      console.error('Payment creation failed:', error)
      return {
        success: false,
        error: error.message || 'Failed to create payment session'
      }
    } finally {
      setIsCreatingPayment(false)
    }
  }

  const verifyPayment = async (invoiceId: string): Promise<PaymentResponse> => {
    setIsVerifyingPayment(true)
    
    try {
      console.log('Verifying payment for invoice:', invoiceId)
      
      const { data, error } = await supabase.functions.invoke('uddoktapay-payment', {
        body: { 
          method: 'GET',
          invoice_id: invoiceId 
        }
      })

      if (error) {
        console.error('Payment verification error:', error)
        throw new Error(error.message || 'Failed to verify payment')
      }
      
      console.log('Payment verification response:', data)
      return {
        success: true,
        ...data
      }
    } catch (error: any) {
      console.error('Payment verification failed:', error)
      return {
        success: false,
        error: error.message || 'Failed to verify payment'
      }
    } finally {
      setIsVerifyingPayment(false)
    }
  }

  return {
    createPayment,
    verifyPayment,
    isCreatingPayment,
    isVerifyingPayment
  }
}