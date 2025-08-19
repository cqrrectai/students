import { supabase } from './supabase'

// Define subscription types directly since they may not be in the generated types yet
interface Subscription {
  id: string
  user_id: string
  plan: 'free' | 'pro'
  status: string
  start_date: string | null
  end_date: string | null
  student_limit: number
  exam_limit: number
  ai_exam_generations_used: number
  ai_exam_generations_limit: number
  ai_analytics_used: number
  ai_analytics_limit: number
  ai_credits_renewal_date: string | null // Date when AI credits were last renewed
  created_at: string | null
}

export type SubscriptionPlan = 'free' | 'pro'

export interface SubscriptionLimits {
  studentLimit: number
  examLimit: number
  hasAdvancedProctoring: boolean
  hasCustomBranding: boolean
  hasApiAccess: boolean
  hasPrioritySupport: boolean
}

export const PLAN_LIMITS: Record<SubscriptionPlan, SubscriptionLimits> = {
  free: {
    studentLimit: 10,
    examLimit: 999999, // Unlimited exams for free plan
    hasAdvancedProctoring: false,
    hasCustomBranding: false,
    hasApiAccess: false,
    hasPrioritySupport: false,
  },
  pro: {
    studentLimit: 999999, // Unlimited students for pro plan
    examLimit: 999999, // Unlimited exams for pro plan
    hasAdvancedProctoring: true,
    hasCustomBranding: true,
    hasApiAccess: true,
    hasPrioritySupport: true,
  },
}

export function getPlanLimits(plan: SubscriptionPlan): SubscriptionLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free
}

export function canCreateExam(subscription: Subscription | null, currentExamCount: number): boolean {
  if (!subscription) return currentExamCount < PLAN_LIMITS.free.examLimit
  
  const limits = getPlanLimits(subscription.plan)
  return currentExamCount < limits.examLimit
}

export function canAddStudent(subscription: Subscription | null, currentStudentCount: number): boolean {
  if (!subscription) return currentStudentCount < PLAN_LIMITS.free.studentLimit
  
  const limits = getPlanLimits(subscription.plan)
  return currentStudentCount < limits.studentLimit
}

export function hasFeatureAccess(subscription: Subscription | null, feature: keyof SubscriptionLimits): boolean {
  if (!subscription) return PLAN_LIMITS.free[feature] as boolean
  
  const limits = getPlanLimits(subscription.plan)
  return limits[feature] as boolean
}

export function isSubscriptionActive(subscription: Subscription | null): boolean {
  if (!subscription) return false
  
  if (subscription.status !== 'active') return false
  
  if (subscription.end_date) {
    const endDate = new Date(subscription.end_date)
    const now = new Date()
    return endDate > now
  }
  
  return true
}

export function getSubscriptionStatus(subscription: Subscription | null): {
  isActive: boolean
  plan: SubscriptionPlan
  daysRemaining: number | null
  message: string
} {
  if (!subscription) {
    return {
      isActive: false,
      plan: 'free',
      daysRemaining: null,
      message: 'No active subscription'
    }
  }

  const isActive = isSubscriptionActive(subscription)
  let daysRemaining: number | null = null
  let message = ''

  if (subscription.end_date) {
    const endDate = new Date(subscription.end_date)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (daysRemaining <= 0) {
      message = 'Subscription expired'
    } else if (daysRemaining <= 7) {
      message = `Subscription expires in ${daysRemaining} days`
    } else {
      message = 'Subscription active'
    }
  } else {
    message = 'Subscription active'
  }

  return {
    isActive,
    plan: subscription.plan,
    daysRemaining,
    message
  }
}

// Hook for getting user subscription
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // If user doesn't have a subscription, create a default free one
      if (error.code === 'PGRST116') { // No rows returned
        await initializeUserSubscription(userId)
        // Try again after initialization
        const { data: newData, error: newError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        return newError ? null : newData
      }
      console.error('Error fetching subscription:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getUserSubscription:', error)
    return null
  }
}

// Subscription upgrade recommendations
export function getUpgradeRecommendations(
  currentPlan: SubscriptionPlan,
  usage: {
    studentCount: number
    examCount: number
    needsAdvancedFeatures: boolean
  }
): {
  shouldUpgrade: boolean
  recommendedPlan: SubscriptionPlan | null
  reasons: string[]
} {
  const currentLimits = getPlanLimits(currentPlan)
  const reasons: string[] = []
  let recommendedPlan: SubscriptionPlan | null = null
  let shouldUpgrade = false

  // Check student limit
  if (usage.studentCount >= currentLimits.studentLimit * 0.8) {
    reasons.push(`Approaching student limit (${usage.studentCount}/${currentLimits.studentLimit})`)
    shouldUpgrade = true
  }

  // Check exam limit
  if (usage.examCount >= currentLimits.examLimit * 0.8) {
    reasons.push(`Approaching exam limit (${usage.examCount}/${currentLimits.examLimit})`)
    shouldUpgrade = true
  }

  // Check advanced features
  if (usage.needsAdvancedFeatures && !currentLimits.hasAdvancedProctoring) {
    reasons.push('Advanced proctoring features needed')
    shouldUpgrade = true
  }

  // Recommend plan
  if (shouldUpgrade) {
    if (currentPlan === 'free') {
      recommendedPlan = 'pro'
    }
  }

  return {
    shouldUpgrade,
    recommendedPlan,
    reasons
  }
}

/**
 * Check if user can use AI exam generation
 */
export async function canUseAIExamGeneration(userId: string): Promise<{ allowed: boolean; remaining: number; limit: number; daysUntilRenewal?: number }> {
  // Check and renew credits if needed
  await checkAndRenewCredits(userId)
  
  const subscription = await getUserSubscription(userId)
  
  if (!subscription) {
    return { allowed: true, remaining: 3, limit: 3 } // Default free limits for new users
  }

  const remaining = Math.max(0, subscription.ai_exam_generations_limit - subscription.ai_exam_generations_used)
  const result: any = {
    allowed: remaining > 0 || subscription.plan === 'pro',
    remaining: subscription.plan === 'pro' ? 999999 : remaining,
    limit: subscription.ai_exam_generations_limit
  }

  // Add renewal info for free plan users
  if (subscription.plan === 'free') {
    result.daysUntilRenewal = await getDaysUntilRenewal(userId)
  }

  return result
}

/**
 * Check if user can use AI analytics
 */
export async function canUseAIAnalytics(userId: string): Promise<{ allowed: boolean; remaining: number; limit: number; daysUntilRenewal?: number }> {
  // Check and renew credits if needed
  await checkAndRenewCredits(userId)
  
  const subscription = await getUserSubscription(userId)
  
  if (!subscription) {
    return { allowed: true, remaining: 3, limit: 3 } // Default free limits for new users
  }

  const remaining = Math.max(0, subscription.ai_analytics_limit - subscription.ai_analytics_used)
  const result: any = {
    allowed: remaining > 0 || subscription.plan === 'pro',
    remaining: subscription.plan === 'pro' ? 999999 : remaining,
    limit: subscription.ai_analytics_limit
  }

  // Add renewal info for free plan users
  if (subscription.plan === 'free') {
    result.daysUntilRenewal = await getDaysUntilRenewal(userId)
  }

  return result
}

/**
 * Increment AI exam generation usage
 */
export async function incrementAIExamGeneration(userId: string): Promise<void> {
  
  try {
    const { error } = await supabase.rpc('increment_ai_exam_usage', { user_id: userId })
    if (error) {
      console.error('Error incrementing AI exam usage:', error)
      // Don't throw error to avoid blocking user workflow
    }
  } catch (error) {
    console.error('Exception incrementing AI exam usage:', error)
    // Don't throw error to avoid blocking user workflow
  }
}

/**
 * Increment AI analytics usage
 */
export async function incrementAIAnalytics(userId: string): Promise<void> {
  
  try {
    const { error } = await supabase.rpc('increment_ai_analytics_usage', { user_id: userId })
    if (error) {
      console.error('Error incrementing AI analytics usage:', error)
      // Don't throw error to avoid blocking user workflow
    }
  } catch (error) {
    console.error('Exception incrementing AI analytics usage:', error)
    // Don't throw error to avoid blocking user workflow
  }
}

/**
 * Check if user's AI credits need monthly renewal
 */
export async function checkAndRenewCredits(userId: string): Promise<void> {
  
  const subscription = await getUserSubscription(userId)
  
  // Only free plan users need monthly renewal
  if (!subscription || subscription.plan !== 'free') {
    return
  }

  const now = new Date()
  const renewalDate = subscription.ai_credits_renewal_date ? new Date(subscription.ai_credits_renewal_date) : null

  // Check if it's been a month since last renewal or if no renewal date is set
  const needsRenewal = !renewalDate || 
    (now.getTime() - renewalDate.getTime()) >= (30 * 24 * 60 * 60 * 1000) // 30 days

  if (needsRenewal) {
    // Reset AI credits for free plan
    await supabase
      .from('subscriptions')
      .update({
        ai_exam_generations_used: 0,
        ai_analytics_used: 0,
        ai_credits_renewal_date: now.toISOString()
      })
      .eq('user_id', userId)
  }
}

/**
 * Get days until next credit renewal for free plan users
 */
export async function getDaysUntilRenewal(userId: string): Promise<number | null> {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription || subscription.plan !== 'free') {
    return null
  }

  const renewalDate = subscription.ai_credits_renewal_date ? new Date(subscription.ai_credits_renewal_date) : null
  
  if (!renewalDate) {
    return 0 // Credits can be renewed immediately
  }

  const now = new Date()
  const nextRenewal = new Date(renewalDate.getTime() + (30 * 24 * 60 * 60 * 1000)) // 30 days from last renewal
  const daysRemaining = Math.ceil((nextRenewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  return Math.max(0, daysRemaining)
}

/**
 * Initialize subscription for new user (sets up initial free plan with first renewal date)
 */
export async function initializeUserSubscription(userId: string): Promise<void> {
  
  const now = new Date()
  
  // Check if subscription already exists
  const existing = await getUserSubscription(userId)
  if (existing) {
    return
  }

  // Create free plan subscription
  await supabase
    .from('subscriptions')
    .insert([{
      user_id: userId,
      plan: 'free',
      status: 'active',
      start_date: now.toISOString(),
      end_date: null,
      student_limit: 10,
      exam_limit: 999999, // Unlimited exams for free plan
      ai_exam_generations_used: 0,
      ai_exam_generations_limit: 3,
      ai_analytics_used: 0,
      ai_analytics_limit: 3,
      ai_credits_renewal_date: now.toISOString()
    }])
} 