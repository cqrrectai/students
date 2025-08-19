import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      examId,
      userId,
      score,
      totalMarks,
      percentage,
      timeTaken,
      answers,
      proctoringData
    } = body

    // Validate required fields
    if (!examId || score === undefined || totalMarks === undefined || percentage === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: examId, score, totalMarks, percentage'
      }, { status: 400 })
    }

    // Validate data types and ranges
    if (typeof score !== 'number' || typeof totalMarks !== 'number' || typeof percentage !== 'number') {
      return NextResponse.json({
        success: false,
        error: 'Invalid data types for score, totalMarks, or percentage'
      }, { status: 400 })
    }

    if (percentage < 0 || percentage > 100) {
      return NextResponse.json({
        success: false,
        error: 'Percentage must be between 0 and 100'
      }, { status: 400 })
    }

    // Create exam attempt record with better error handling
    // For anonymous users, set user_id to null to avoid foreign key constraint issues
    const { data: attempt, error } = await supabase
      .from('exam_attempts')
      .insert({
        exam_id: examId,
        user_id: userId, // Keep as null for anonymous users
        score: Math.round(score * 100) / 100, // Round to 2 decimal places
        total_marks: totalMarks,
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
        time_taken: timeTaken || null,
        answers: answers || {},
        proctoring_data: proctoringData || null,
        started_at: new Date(Date.now() - (timeTaken || 0)).toISOString(),
        completed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating exam attempt:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save exam attempt'
      if (error.code === '23503') {
        errorMessage = 'Invalid exam ID provided'
      } else if (error.code === '23505') {
        errorMessage = 'Duplicate exam attempt detected'
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: error.message
      }, { status: 500 })
    }

    console.log('Exam attempt saved successfully:', attempt.id)

    return NextResponse.json({
      success: true,
      attempt,
      message: 'Exam attempt saved successfully'
    })

  } catch (error) {
    console.error('Exam attempts API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const examId = searchParams.get('examId')
    const userId = searchParams.get('userId')

    let query = supabase
      .from('exam_attempts')
      .select(`
        *,
        exam:exams(title, type, subject),
        user:profiles(full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (examId) {
      query = query.eq('exam_id', examId)
    }
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: attempts, error } = await query

    if (error) {
      console.error('Error fetching exam attempts:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch exam attempts',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      attempts: attempts || [],
      count: attempts?.length || 0
    })

  } catch (error) {
    console.error('Exam attempts API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}