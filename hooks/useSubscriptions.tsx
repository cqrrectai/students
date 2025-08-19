"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

interface Subscription {
  id: string
  user_id: string
  plan: 'free' | 'standard' | 'pro'
  status: 'active' | 'inactive' | 'cancelled' | 'expired'
  start_date: string
  end_date: string
  student_limit: number
  exam_limit: number
  created_at: string
  updated_at: string
}

export const useUserSubscription = () => {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscription(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // No subscription found, user is on free plan
            setSubscription({
              id: 'free',
              user_id: user.id,
              plan: 'free',
              status: 'active',
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
              student_limit: 1000,
              exam_limit: 10,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          } else {
            throw fetchError
          }
        } else {
          setSubscription(data)
        }
      } catch (err: any) {
        console.error('Error fetching subscription:', err)
        setError(err.message || 'Failed to fetch subscription')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [user])

  const updateSubscription = async (updates: Partial<Subscription>) => {
    if (!user || !subscription) return

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      setSubscription(data)
      return { success: true, data }
    } catch (err: any) {
      console.error('Error updating subscription:', err)
      return { success: false, error: err.message }
    }
  }

  const cancelSubscription = async () => {
    if (!user || !subscription) return

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setSubscription(data)
      return { success: true, data }
    } catch (err: any) {
      console.error('Error cancelling subscription:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    data: subscription,
    isLoading,
    error,
    updateSubscription,
    cancelSubscription,
    refetch: () => {
      if (user) {
        setIsLoading(true)
        // Re-trigger the effect
        setSubscription(null)
      }
    }
  }
}