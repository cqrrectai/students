import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const examType = searchParams.get('exam_type')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - parseInt(period))

    // 1. ACQUISITION & GROWTH METRICS
    const acquisitionMetrics = await getAcquisitionMetrics(startDate, endDate)
    
    // 2. ENGAGEMENT & USAGE METRICS
    const engagementMetrics = await getEngagementMetrics(startDate, endDate)
    
    // 3. RETENTION & CHURN METRICS
    const retentionMetrics = await getRetentionMetrics(startDate, endDate)
    
    // 4. REVENUE & MONETIZATION METRICS
    const revenueMetrics = await getRevenueMetrics(startDate, endDate)
    
    // 5. PRODUCT HEALTH METRICS
    const productHealthMetrics = await getProductHealthMetrics(startDate, endDate)
    
    // 6. OPERATIONAL EFFICIENCY METRICS
    const operationalMetrics = await getOperationalMetrics(startDate, endDate)

    // Get overall statistics
    const [examsResult, attemptsResult, usersResult] = await Promise.all([
      supabase.from('exams').select('*', { count: 'exact' }),
      supabase.from('exam_attempts').select('*', { count: 'exact' }),
      supabase.from('profiles').select('*', { count: 'exact' })
    ])

    const totalExams = examsResult.count || 0
    const totalAttempts = attemptsResult.count || 0
    const totalUsers = usersResult.count || 0

    // Get detailed exam statistics
    let examQuery = supabase
      .from('exams')
      .select(`
        id,
        title,
        type,
        subject,
        created_at,
        exam_attempts(
          id,
          score,
          percentage,
          time_taken,
          created_at,
          user_id
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (examType && examType !== 'all') {
      examQuery = examQuery.eq('type', examType)
    }

    const { data: exams } = await examQuery

    // Process exam statistics
    const examStats = (exams || []).map(exam => {
      const attempts = exam.exam_attempts || []
      const totalAttempts = attempts.length
      const averageScore = totalAttempts > 0 
        ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts)
        : 0
      const passRate = totalAttempts > 0
        ? Math.round((attempts.filter(attempt => attempt.percentage >= 60).length / totalAttempts) * 100)
        : 0
      const averageTime = totalAttempts > 0
        ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.time_taken || 0), 0) / totalAttempts)
        : 0

      return {
        id: exam.id,
        title: exam.title,
        type: exam.type,
        totalAttempts,
        averageScore,
        passRate,
        averageTime,
        createdAt: exam.created_at
      }
    })

    // Calculate overall metrics
    const allAttempts = exams?.flatMap(exam => exam.exam_attempts || []) || []
    const averageScore = allAttempts.length > 0
      ? Math.round(allAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / allAttempts.length)
      : 0
    const passRate = allAttempts.length > 0
      ? Math.round((allAttempts.filter(attempt => attempt.percentage >= 60).length / allAttempts.length) * 100)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        // Enhanced metrics for startup dashboard
        acquisition: acquisitionMetrics,
        engagement: engagementMetrics,
        retention: retentionMetrics,
        revenue: revenueMetrics,
        productHealth: productHealthMetrics,
        operational: operationalMetrics,
        
        // Original overview data
        overview: {
          totalExams,
          totalAttempts,
          totalUsers,
          averageScore,
          passRate
        },
        examStats,
        
        // Time series data for charts
        timeSeries: await getTimeSeriesData(startDate, endDate),
        
        // Growth trends
        growthTrends: await getGrowthTrends(startDate, endDate)
      }
    })

  } catch (error) {
    console.error('Admin analytics API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ACQUISITION & GROWTH METRICS
async function getAcquisitionMetrics(startDate: Date, endDate: Date) {
  try {
    // New user sign-ups
    const { data: newUsers, count: newUsersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Daily sign-ups for growth chart
    const dailySignups = await getDailySignups(startDate, endDate)
    
    // User acquisition sources
    const { data: acquisitionSources } = await supabase
      .from('profiles')
      .select('signup_source')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    const sourceBreakdown = acquisitionSources?.reduce((acc, user) => {
      const source = user.signup_source || 'organic'
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Sign-up conversion rate (if we track sessions)
    const signupConversionRate = 85 // Placeholder - would need session tracking

    return {
      newUserSignups: newUsersCount || 0,
      dailySignups,
      acquisitionSources: Object.entries(sourceBreakdown).map(([source, count]) => ({
        source,
        count,
        percentage: Math.round((count / (newUsersCount || 1)) * 100)
      })),
      growthRate: await calculateGrowthRate(startDate, endDate),
      signupConversionRate
    }
  } catch (error) {
    console.error('Error fetching acquisition metrics:', error)
    return {
      newUserSignups: 0,
      dailySignups: [],
      acquisitionSources: [],
      growthRate: 0,
      signupConversionRate: 0
    }
  }
}

// ENGAGEMENT & USAGE METRICS
async function getEngagementMetrics(startDate: Date, endDate: Date) {
  try {
    // Daily Active Users (users who took exams or logged in)
    const { data: activeUsers } = await supabase
      .from('exam_attempts')
      .select('user_id, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    const uniqueActiveUsers = new Set(activeUsers?.map(attempt => attempt.user_id)).size

    // Monthly Active Users
    const monthStart = new Date()
    monthStart.setMonth(monthStart.getMonth() - 1)
    const { data: monthlyActiveUsers } = await supabase
      .from('exam_attempts')
      .select('user_id')
      .gte('created_at', monthStart.toISOString())

    const uniqueMonthlyUsers = new Set(monthlyActiveUsers?.map(attempt => attempt.user_id)).size
    const dauMauRatio = uniqueMonthlyUsers > 0 ? Math.round((uniqueActiveUsers / uniqueMonthlyUsers) * 100) : 0

    // Exam completion rate
    const { data: allAttempts } = await supabase
      .from('exam_attempts')
      .select('completed_at, created_at, started_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    const completedAttempts = allAttempts?.filter(attempt => attempt.completed_at).length || 0
    const totalAttempts = allAttempts?.length || 0
    const completionRate = totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0

    // AI feature usage from multiple sources
    const [aiAnalytics, aiSubscriptions] = await Promise.all([
      supabase
        .from('ai_analytics')
        .select('*', { count: 'exact' })
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),
      supabase
        .from('subscriptions')
        .select('ai_exam_generations_used, ai_analytics_used')
        .gte('updated_at', startDate.toISOString())
    ])

    const totalAiGenerations = (aiAnalytics.count || 0) + 
      (aiSubscriptions.data?.reduce((sum, sub) => sum + (sub.ai_exam_generations_used || 0), 0) || 0)

    // Average session duration from exam attempts
    const sessionDuration = await calculateAverageSessionDuration(startDate, endDate)

    return {
      dailyActiveUsers: uniqueActiveUsers,
      monthlyActiveUsers: uniqueMonthlyUsers,
      dauMauRatio,
      examCompletionRate: completionRate,
      aiFeatureUsage: totalAiGenerations,
      averageSessionDuration: sessionDuration,
      totalExamAttempts: totalAttempts,
      completedExams: completedAttempts
    }
  } catch (error) {
    console.error('Error fetching engagement metrics:', error)
    return {
      dailyActiveUsers: 0,
      monthlyActiveUsers: 0,
      dauMauRatio: 0,
      examCompletionRate: 0,
      aiFeatureUsage: 0,
      averageSessionDuration: 0,
      totalExamAttempts: 0,
      completedExams: 0
    }
  }
}

// RETENTION & CHURN METRICS
async function getRetentionMetrics(startDate: Date, endDate: Date) {
  try {
    // Calculate retention rates (7, 30, 90 days)
    const retentionRates = await calculateRetentionRates(startDate, endDate)
    
    // Churn rate (users with no activity in 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // Get users with recent activity
    const { data: recentActivity } = await supabase
      .from('profiles')
      .select('id')
      .gte('last_activity', thirtyDaysAgo.toISOString())

    const activeUserIds = new Set(recentActivity?.map(user => user.id))
    
    // Get total users created before 30 days ago (to calculate meaningful churn)
    const { count: totalEligibleUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .lte('created_at', thirtyDaysAgo.toISOString())

    const churnRate = totalEligibleUsers ? 
      Math.round(((totalEligibleUsers - activeUserIds.size) / totalEligibleUsers) * 100) : 0

    // User lifecycle analysis
    const lifecycleAnalysis = await getUserLifecycleAnalysis(startDate, endDate)

    return {
      retention7Day: retentionRates.day7,
      retention30Day: retentionRates.day30,
      retention90Day: retentionRates.day90,
      churnRate,
      cohortAnalysis: await getCohortAnalysis(startDate, endDate),
      lifecycleAnalysis,
      activeUsers: activeUserIds.size,
      eligibleUsers: totalEligibleUsers || 0
    }
  } catch (error) {
    console.error('Error fetching retention metrics:', error)
    return {
      retention7Day: 0,
      retention30Day: 0,
      retention90Day: 0,
      churnRate: 0,
      cohortAnalysis: [],
      lifecycleAnalysis: {},
      activeUsers: 0,
      eligibleUsers: 0
    }
  }
}

// REVENUE & MONETIZATION METRICS
async function getRevenueMetrics(startDate: Date, endDate: Date) {
  try {
    // Monthly Recurring Revenue from active subscriptions
    const { data: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('plan, amount, status, created_at')
      .eq('status', 'active')

    const mrr = activeSubscriptions?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0

    // Conversion rate to paid (users with paid subscriptions vs total users)
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })

    const paidUsers = activeSubscriptions?.filter(sub => sub.plan !== 'free').length || 0
    const conversionRate = totalUsers ? Math.round((paidUsers / totalUsers) * 100) : 0

    // Payment success rate
    const { data: payments } = await supabase
      .from('payment_transactions')
      .select('status, amount, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    const successfulPayments = payments?.filter(p => p.status === 'completed').length || 0
    const totalPayments = payments?.length || 0
    const paymentSuccessRate = totalPayments > 0 ? Math.round((successfulPayments / totalPayments) * 100) : 100

    // Revenue from payments in period
    const periodRevenue = payments?.filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    // Average Revenue Per User (ARPU)
    const arpu = totalUsers ? Math.round(mrr / totalUsers) : 0

    return {
      monthlyRecurringRevenue: mrr,
      conversionToPaidRate: conversionRate,
      customerLifetimeValue: await calculateLTV(),
      paymentSuccessRate,
      revenueGrowth: await calculateRevenueGrowth(startDate, endDate),
      periodRevenue,
      averageRevenuePerUser: arpu,
      totalPaidUsers: paidUsers,
      totalPayments,
      successfulPayments
    }
  } catch (error) {
    console.error('Error fetching revenue metrics:', error)
    return {
      monthlyRecurringRevenue: 0,
      conversionToPaidRate: 0,
      customerLifetimeValue: 0,
      paymentSuccessRate: 100,
      revenueGrowth: 0,
      periodRevenue: 0,
      averageRevenuePerUser: 0,
      totalPaidUsers: 0,
      totalPayments: 0,
      successfulPayments: 0
    }
  }
}

// PRODUCT HEALTH METRICS
async function getProductHealthMetrics(startDate: Date, endDate: Date) {
  try {
    // Proctoring violation rate
    const [violationsResult, attemptsResult] = await Promise.all([
      supabase
        .from('proctoring_violations')
        .select('exam_attempt_id, severity')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),
      supabase
        .from('exam_attempts')
        .select('id, percentage, completed_at, time_taken')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
    ])

    const violations = violationsResult.data || []
    const attempts = attemptsResult.data || []
    
    const violationRate = attempts.length ? 
      Math.round((violations.length / attempts.length) * 100) : 0

    // Critical violations rate
    const criticalViolations = violations.filter(v => v.severity === 'critical' || v.severity === 'high')
    const criticalViolationRate = attempts.length ? 
      Math.round((criticalViolations.length / attempts.length) * 100) : 0

    // User satisfaction (inferred from completion rates and scores)
    const completedExams = attempts.filter(exam => exam.completed_at)
    const averageScore = completedExams.length ? 
      Math.round(completedExams.reduce((sum, exam) => sum + exam.percentage, 0) / completedExams.length) : 0

    // Exam quality metrics
    const passRate = completedExams.length ? 
      Math.round((completedExams.filter(exam => exam.percentage >= 60).length / completedExams.length) * 100) : 0

    // Average exam duration
    const avgExamDuration = completedExams.length ? 
      Math.round(completedExams.reduce((sum, exam) => sum + (exam.time_taken || 0), 0) / completedExams.length) : 0

    return {
      proctoringViolationRate: violationRate,
      criticalViolationRate,
      userSatisfactionScore: averageScore,
      systemErrorRate: await calculateSystemErrorRate(startDate, endDate),
      averageLoadTime: await calculateAverageLoadTime(),
      examPassRate: passRate,
      averageExamDuration: avgExamDuration,
      totalViolations: violations.length,
      completionRate: attempts.length ? Math.round((completedExams.length / attempts.length) * 100) : 0
    }
  } catch (error) {
    console.error('Error fetching product health metrics:', error)
    return {
      proctoringViolationRate: 0,
      criticalViolationRate: 0,
      userSatisfactionScore: 0,
      systemErrorRate: 0,
      averageLoadTime: 0,
      examPassRate: 0,
      averageExamDuration: 0,
      totalViolations: 0,
      completionRate: 0
    }
  }
}

// OPERATIONAL EFFICIENCY METRICS
async function getOperationalMetrics(startDate: Date, endDate: Date) {
  try {
    // System performance metrics (would come from monitoring in production)
    const systemUptime = 99.8 // Placeholder - integrate with monitoring service
    const averageResponseTime = 145 // milliseconds
    
    // Database performance
    const { data: dbPerformance } = await supabase
      .from('exam_attempts')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .limit(1000)

    // Support tickets (using notifications as proxy)
    const { count: supportTickets } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('type', 'error')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Active issues (critical violations or system errors)
    const { count: activeIssues } = await supabase
      .from('proctoring_violations')
      .select('*', { count: 'exact' })
      .eq('severity', 'critical')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // API performance metrics
    const apiCallsCount = dbPerformance?.length || 0
    const avgApiResponseTime = averageResponseTime

    return {
      systemUptime,
      averageResponseTime: avgApiResponseTime,
      supportTickets: supportTickets || 0,
      activeIssues: activeIssues || 0,
      apiCallsCount,
      databaseConnections: 95, // Placeholder
      serverLoad: 23, // Placeholder percentage
      errorRate: 0.2 // Placeholder percentage
    }
  } catch (error) {
    console.error('Error fetching operational metrics:', error)
    return {
      systemUptime: 99.0,
      averageResponseTime: 200,
      supportTickets: 0,
      activeIssues: 0,
      apiCallsCount: 0,
      databaseConnections: 0,
      serverLoad: 0,
      errorRate: 0
    }
  }
}

// Helper functions
async function getDailySignups(startDate: Date, endDate: Date) {
  const { data } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at')

  const dailyData: Record<string, number> = {}
  data?.forEach(user => {
    const date = new Date(user.created_at).toISOString().split('T')[0]
    dailyData[date] = (dailyData[date] || 0) + 1
  })

  return Object.entries(dailyData).map(([date, count]) => ({ date, count }))
}

async function calculateGrowthRate(startDate: Date, endDate: Date) {
  const previousPeriodStart = new Date(startDate)
  previousPeriodStart.setDate(previousPeriodStart.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  const [currentPeriod, previousPeriod] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact' }).gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString()),
    supabase.from('profiles').select('*', { count: 'exact' }).gte('created_at', previousPeriodStart.toISOString()).lte('created_at', startDate.toISOString())
  ])

  const currentCount = currentPeriod.count || 0
  const previousCount = previousPeriod.count || 0

  return previousCount > 0 ? Math.round(((currentCount - previousCount) / previousCount) * 100) : 0
}

async function calculateAverageSessionDuration(startDate: Date, endDate: Date) {
  const { data } = await supabase
    .from('exam_attempts')
    .select('time_taken')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .not('time_taken', 'is', null)

  return data?.length ? Math.round(data.reduce((sum, attempt) => sum + attempt.time_taken, 0) / data.length) : 0
}

async function calculateRetentionRates(startDate: Date, endDate: Date) {
  try {
    // Calculate 7-day retention
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: usersSevenDaysAgo } = await supabase
      .from('profiles')
      .select('id')
      .lte('created_at', sevenDaysAgo.toISOString())
    
    const { data: activeInLast7Days } = await supabase
      .from('profiles')
      .select('id')
      .gte('last_activity', sevenDaysAgo.toISOString())
      .lte('created_at', sevenDaysAgo.toISOString())
    
    const retention7Day = usersSevenDaysAgo?.length ? 
      Math.round((activeInLast7Days?.length || 0) / usersSevenDaysAgo.length * 100) : 0

    // Calculate 30-day retention
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: usersThirtyDaysAgo } = await supabase
      .from('profiles')
      .select('id')
      .lte('created_at', thirtyDaysAgo.toISOString())
    
    const { data: activeInLast30Days } = await supabase
      .from('profiles')
      .select('id')
      .gte('last_activity', thirtyDaysAgo.toISOString())
      .lte('created_at', thirtyDaysAgo.toISOString())
    
    const retention30Day = usersThirtyDaysAgo?.length ? 
      Math.round((activeInLast30Days?.length || 0) / usersThirtyDaysAgo.length * 100) : 0

    // Calculate 90-day retention
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    
    const { data: usersNinetyDaysAgo } = await supabase
      .from('profiles')
      .select('id')
      .lte('created_at', ninetyDaysAgo.toISOString())
    
    const { data: activeInLast90Days } = await supabase
      .from('profiles')
      .select('id')
      .gte('last_activity', ninetyDaysAgo.toISOString())
      .lte('created_at', ninetyDaysAgo.toISOString())
    
    const retention90Day = usersNinetyDaysAgo?.length ? 
      Math.round((activeInLast90Days?.length || 0) / usersNinetyDaysAgo.length * 100) : 0

    return { day7: retention7Day, day30: retention30Day, day90: retention90Day }
  } catch (error) {
    console.error('Error calculating retention rates:', error)
    return { day7: 0, day30: 0, day90: 0 }
  }
}

async function getCohortAnalysis(startDate: Date, endDate: Date) {
  try {
    // Get users by signup month and their activity
    const { data: users } = await supabase
      .from('profiles')
      .select('id, created_at, last_activity')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at')

    const cohorts: Record<string, any> = {}
    
    users?.forEach(user => {
      const cohortMonth = new Date(user.created_at).toISOString().substring(0, 7) // YYYY-MM
      if (!cohorts[cohortMonth]) {
        cohorts[cohortMonth] = {
          month: cohortMonth,
          totalUsers: 0,
          activeUsers: 0,
          retentionRate: 0
        }
      }
      cohorts[cohortMonth].totalUsers++
      
      // Check if user was active in the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      if (user.last_activity && new Date(user.last_activity) >= thirtyDaysAgo) {
        cohorts[cohortMonth].activeUsers++
      }
    })

    // Calculate retention rates
    Object.values(cohorts).forEach((cohort: any) => {
      cohort.retentionRate = cohort.totalUsers > 0 ? 
        Math.round((cohort.activeUsers / cohort.totalUsers) * 100) : 0
    })

    return Object.values(cohorts)
  } catch (error) {
    console.error('Error calculating cohort analysis:', error)
    return []
  }
}

async function getUserLifecycleAnalysis(startDate: Date, endDate: Date) {
  try {
    const { data: users } = await supabase
      .from('profiles')
      .select('id, created_at, last_activity')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    const now = new Date()
    const lifecycle = {
      new: 0,        // Created in last 7 days
      active: 0,     // Active in last 7 days
      dormant: 0,    // No activity in 7-30 days
      churned: 0     // No activity in 30+ days
    }

    users?.forEach(user => {
      const createdAt = new Date(user.created_at)
      const lastActivity = user.last_activity ? new Date(user.last_activity) : createdAt
      const daysSinceCreated = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
      const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceCreated <= 7) {
        lifecycle.new++
      } else if (daysSinceActivity <= 7) {
        lifecycle.active++
      } else if (daysSinceActivity <= 30) {
        lifecycle.dormant++
      } else {
        lifecycle.churned++
      }
    })

    return lifecycle
  } catch (error) {
    console.error('Error calculating user lifecycle:', error)
    return { new: 0, active: 0, dormant: 0, churned: 0 }
  }
}

async function calculateLTV() {
  try {
    // Calculate Customer Lifetime Value
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('amount, created_at, end_date, status')
      .eq('status', 'active')

    if (!subscriptions?.length) return 0

    // Average monthly revenue per user
    const avgMonthlyRevenue = subscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0) / subscriptions.length

    // Average subscription duration (assume 12 months for active subscriptions)
    const avgDurationMonths = 12

    // Simple LTV calculation: ARPU * Average Duration
    return Math.round(avgMonthlyRevenue * avgDurationMonths)
  } catch (error) {
    console.error('Error calculating LTV:', error)
    return 0
  }
}

async function calculateRevenueGrowth(startDate: Date, endDate: Date) {
  try {
    const periodDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Previous period
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - periodDays)
    
    // Current period revenue
    const { data: currentPayments } = await supabase
      .from('payment_transactions')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Previous period revenue
    const { data: previousPayments } = await supabase
      .from('payment_transactions')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', previousStartDate.toISOString())
      .lte('created_at', startDate.toISOString())

    const currentRevenue = currentPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    const previousRevenue = previousPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    if (previousRevenue === 0) return currentRevenue > 0 ? 100 : 0

    return Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
  } catch (error) {
    console.error('Error calculating revenue growth:', error)
    return 0
  }
}

async function calculateSystemErrorRate(startDate: Date, endDate: Date) {
  // This would come from error logging system
  return 0.5 // 0.5% error rate
}

async function calculateAverageLoadTime() {
  // This would come from performance monitoring
  return 1.2 // 1.2 seconds average load time
}

async function getTimeSeriesData(startDate: Date, endDate: Date) {
  const { data } = await supabase
    .from('exam_attempts')
    .select('created_at, percentage')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at')

  const dailyData: Record<string, { attempts: number, totalScore: number }> = {}
  
  data?.forEach(attempt => {
    const date = new Date(attempt.created_at).toISOString().split('T')[0]
    if (!dailyData[date]) {
      dailyData[date] = { attempts: 0, totalScore: 0 }
    }
    dailyData[date].attempts++
    dailyData[date].totalScore += attempt.percentage
  })

  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    attempts: data.attempts,
    averageScore: data.attempts > 0 ? Math.round(data.totalScore / data.attempts) : 0
  }))
}

async function getGrowthTrends(startDate: Date, endDate: Date) {
  const dailySignups = await getDailySignups(startDate, endDate)
  return dailySignups.map((day, index) => ({
    ...day,
    growth: index > 0 ? Math.round(((day.count - dailySignups[index - 1].count) / (dailySignups[index - 1].count || 1)) * 100) : 0
  }))
}