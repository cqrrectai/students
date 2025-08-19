import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Get all exams
    const { data: exams, error: examsError } = await supabase
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false })

    if (examsError) {
      console.error('Error fetching exams:', examsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch exams',
        details: examsError.message
      }, { status: 500 })
    }

    // Get all exam attempts
    const { data: examAttempts, error: attemptsError } = await supabase
      .from('exam_attempts')
      .select('*')
      .order('created_at', { ascending: false })

    if (attemptsError) {
      console.error('Error fetching exam attempts:', attemptsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch exam attempts',
        details: attemptsError.message
      }, { status: 500 })
    }

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch profiles',
        details: profilesError.message
      }, { status: 500 })
    }

    // Calculate statistics
    const stats = {
      totalExams: exams?.length || 0,
      totalAttempts: examAttempts?.length || 0,
      totalUsers: profiles?.length || 0,
      averageScore: examAttempts && examAttempts.length > 0 
        ? Math.round((examAttempts.reduce((sum, a) => sum + a.percentage, 0) / examAttempts.length) * 100) / 100
        : 0,
      examsBySubject: Object.entries(
        (exams || []).reduce((acc, exam) => {
          acc[exam.subject] = (acc[exam.subject] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).map(([subject, count]) => ({ subject, count })),
      examsByType: Object.entries(
        (exams || []).reduce((acc, exam) => {
          acc[exam.type] = (acc[exam.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).map(([type, count]) => ({ type, count }))
    }

    // Filter user-specific data if userId is provided
    let userAttempts = examAttempts || []
    let studentExams: any[] = []

    if (userId) {
      userAttempts = (examAttempts || []).filter(attempt => attempt.user_id === userId)
      
      // Get student-created exams separately
      const { data: studentExamsData, error: studentExamsError } = await supabase
        .from('exams')
        .select('*')
        .eq('created_by', userId)
        .eq('exam_type', 'student')
        .order('created_at', { ascending: false })
      
      if (studentExamsError) {
        console.error('Error loading student exams:', studentExamsError)
        studentExams = []
      } else {
        studentExams = studentExamsData || []
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        exams: exams || [],
        examAttempts: examAttempts || [],
        profiles: profiles || [],
        stats,
        userAttempts,
        studentExams
      }
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}