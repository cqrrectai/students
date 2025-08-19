import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await import('@/lib/supabase')
    
    // Get basic counts
    const [examsResult, attemptsResult, usersResult] = await Promise.all([
      supabase.from('exams').select('*', { count: 'exact' }),
      supabase.from('exam_attempts').select('*', { count: 'exact' }),
      supabase.from('profiles').select('*', { count: 'exact' })
    ])

    const totalExams = examsResult.count || 0
    const totalAttempts = attemptsResult.count || 0
    const totalUsers = usersResult.count || 0

    // Get active exams count
    const { count: activeExamsCount } = await supabase
      .from('exams')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get recent exams
    const { data: recentExams } = await supabase
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    // Get average score from attempts
    const { data: attemptScores } = await supabase
      .from('exam_attempts')
      .select('percentage')

    const averageScore = attemptScores && attemptScores.length > 0
      ? Math.round(attemptScores.reduce((sum, attempt) => sum + attempt.percentage, 0) / attemptScores.length)
      : 0

    // Get top performers (if there are attempts)
    let topPerformers: Array<{ name: string; score: number; exam: string }> = []
    if (totalAttempts > 0) {
      const { data: topPerformersData } = await supabase
        .from('exam_attempts')
        .select(`
          percentage,
          profiles!inner(full_name),
          exams!inner(title)
        `)
        .order('percentage', { ascending: false })
        .limit(5)

      topPerformers = topPerformersData?.map(attempt => ({
        name: (attempt.profiles as any)?.full_name || 'Unknown',
        score: attempt.percentage,
        exam: (attempt.exams as any)?.title || 'Unknown'
      })) || []
    }

    // Get attempts by date (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: recentAttempts } = await supabase
      .from('exam_attempts')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString())

    const attemptsByDate = (recentAttempts || []).reduce((acc: any[], attempt) => {
      const date = attempt.created_at ? new Date(attempt.created_at).toISOString().split('T')[0] : 'unknown'
      const existing = acc.find(item => item.date === date)
      if (existing) {
        existing.attempts++
      } else {
        acc.push({ date, attempts: 1 })
      }
      return acc
    }, [])

    // Get exams by subject
    const { data: allExams } = await supabase
      .from('exams')
      .select('subject')

    const examsBySubject = (allExams || []).reduce((acc: any[], exam) => {
      const existing = acc.find(item => item.subject === exam.subject)
      if (existing) {
        existing.count++
      } else {
        acc.push({ subject: exam.subject, count: 1 })
      }
      return acc
    }, [])

    const dashboardStats = {
      totalExams,
      totalAttempts,
      totalUsers,
      activeExams: activeExamsCount || 0,
      averageScore,
      recentExams: recentExams || [],
      topPerformers,
      attemptsByDate,
      examsBySubject
    }

    return NextResponse.json({
      success: true,
      data: dashboardStats
    })
  } catch (error) {
    console.error('Admin dashboard API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}