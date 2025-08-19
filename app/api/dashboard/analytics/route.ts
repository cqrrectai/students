import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const timeRange = searchParams.get('timeRange') || '30' // days

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      console.log('Invalid UUID format for userId:', userId)
      return NextResponse.json({
        success: true,
        data: {
          totalExamsTaken: 0,
          totalAttempts: 0,
          averageScore: 0,
          currentStreak: 0,
          recentAttempts: [],
          performanceTrend: [],
          subjectStats: []
        }
      })
    }

    console.log('Fetching analytics for user:', userId)

    // Get user's exam attempts
    const { data: userAttempts, error: attemptsError } = await supabase
      .from('exam_attempts')
      .select(`
        *,
        exam:exams(title, subject, type)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (attemptsError) {
      console.error('Error fetching user attempts:', attemptsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch user attempts',
        details: attemptsError.message
      }, { status: 500 })
    }

    const attempts = userAttempts || []

    // Calculate basic stats
    const totalAttempts = attempts.length
    const totalExamsTaken = new Set(attempts.map(a => a.exam_id)).size
    const averageScore = attempts.length > 0 
      ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
      : 0

    // Calculate current streak (simplified - consecutive days with attempts)
    const currentStreak = calculateStreak(attempts)

    // Get recent attempts (last 10)
    const recentAttempts = attempts.slice(0, 10)

    // Generate performance trend for the specified time range
    const performanceTrend = generatePerformanceTrend(attempts, parseInt(timeRange))

    // Calculate subject-wise statistics
    const subjectStats = calculateSubjectStats(attempts)

    return NextResponse.json({
      success: true,
      data: {
        totalExamsTaken,
        totalAttempts,
        averageScore,
        currentStreak,
        recentAttempts,
        performanceTrend,
        subjectStats
      }
    })

  } catch (error) {
    console.error('Dashboard analytics API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function calculateStreak(attempts: any[]): number {
  if (attempts.length === 0) return 0

  // Sort attempts by date
  const sortedAttempts = attempts.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (const attempt of sortedAttempts) {
    const attemptDate = new Date(attempt.created_at)
    attemptDate.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor((currentDate.getTime() - attemptDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === streak) {
      streak++
    } else if (daysDiff > streak) {
      break
    }
  }

  return streak
}

function generatePerformanceTrend(attempts: any[], days: number): any[] {
  const trend = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const dayAttempts = attempts.filter(a => 
      a.created_at && a.created_at.startsWith(dateStr)
    )

    const avgScore = dayAttempts.length > 0
      ? Math.round(dayAttempts.reduce((sum, a) => sum + a.percentage, 0) / dayAttempts.length)
      : 0

    trend.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: avgScore,
      attempts: dayAttempts.length
    })
  }

  return trend
}

function calculateSubjectStats(attempts: any[]): any[] {
  const subjectMap = new Map()

  attempts.forEach(attempt => {
    const subject = attempt.exam?.subject || 'Unknown'
    
    if (!subjectMap.has(subject)) {
      subjectMap.set(subject, {
        subject,
        attempts: 0,
        totalScore: 0,
        bestScore: 0,
        worstScore: 100
      })
    }

    const stats = subjectMap.get(subject)
    stats.attempts++
    stats.totalScore += attempt.percentage
    stats.bestScore = Math.max(stats.bestScore, attempt.percentage)
    stats.worstScore = Math.min(stats.worstScore, attempt.percentage)
  })

  return Array.from(subjectMap.values()).map(stats => ({
    ...stats,
    averageScore: Math.round(stats.totalScore / stats.attempts)
  }))
}