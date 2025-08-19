import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { examId, sessionId, violation } = await request.json()

    if (!examId || !sessionId || !violation) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters'
      }, { status: 400 })
    }

    // Get exam attempt ID
    const { data: examAttempt, error: attemptError } = await supabase
      .from('exam_attempts')
      .select('id, user_id')
      .eq('exam_id', examId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (attemptError || !examAttempt) {
      console.error('Failed to find exam attempt:', attemptError)
      return NextResponse.json({
        success: false,
        error: 'Exam attempt not found'
      }, { status: 404 })
    }

    // Record violation
    const { data, error } = await supabase
      .from('proctoring_violations')
      .insert({
        exam_attempt_id: examAttempt.id,
        user_id: examAttempt.user_id,
        violation_type: violation.type,
        severity: violation.severity,
        description: `${violation.type} violation detected`,
        metadata: {
          sessionId,
          violationId: violation.id,
          details: violation.details,
          timestamp: violation.timestamp
        }
      })

    if (error) {
      console.error('Failed to record violation:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to record violation'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Violation recorded'
    })

  } catch (error) {
    console.error('Violation recording error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to record violation'
    }, { status: 500 })
  }
}