import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Exam ID is required'
      }, { status: 400 })
    }

    // Get exam with questions
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select(`
        *,
        questions (*)
      `)
      .eq('id', id)
      .single()

    if (examError) {
      console.error('Error fetching exam:', examError)
      return NextResponse.json({
        success: false,
        error: 'Exam not found',
        details: examError.message
      }, { status: 404 })
    }

    // Get exam statistics
    const { data: attempts, error: attemptsError } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('exam_id', id)

    if (attemptsError) {
      console.error('Error fetching attempts:', attemptsError)
    }

    const stats = {
      totalAttempts: attempts?.length || 0,
      averageScore: attempts && attempts.length > 0
        ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / attempts.length)
        : 0,
      completionRate: attempts && attempts.length > 0
        ? Math.round((attempts.filter(a => a.completed_at).length / attempts.length) * 100)
        : 0
    }

    return NextResponse.json({
      success: true,
      exam: {
        ...exam,
        stats
      }
    })

  } catch (error) {
    console.error('Get exam error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Exam ID is required'
      }, { status: 400 })
    }

    const {
      title,
      description,
      type,
      subject,
      duration,
      total_marks,
      instructions,
      status,
      security,
      questions
    } = body

    // Update exam
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .update({
        title,
        description,
        type,
        subject,
        duration,
        total_marks,
        instructions,
        status,
        security,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (examError) {
      console.error('Error updating exam:', examError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update exam',
        details: examError.message
      }, { status: 500 })
    }

    // Update questions if provided
    if (questions && Array.isArray(questions)) {
      // Delete existing questions
      await supabase
        .from('questions')
        .delete()
        .eq('exam_id', id)

      // Insert new questions
      if (questions.length > 0) {
        const questionsData = questions.map((q: any, index: number) => ({
          exam_id: id,
          question: q.question,
          options: q.options,
          correct_answer: q.correctAnswer || q.correct_answer,
          marks: q.marks || 1,
          difficulty: q.difficulty || 'medium',
          explanation: q.explanation,
          tags: q.tags,
          order_index: index + 1
        }))

        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questionsData)

        if (questionsError) {
          console.error('Error updating questions:', questionsError)
          // Don't fail the entire request, just log the error
        }
      }
    }

    return NextResponse.json({
      success: true,
      exam,
      message: 'Exam updated successfully'
    })

  } catch (error) {
    console.error('Update exam error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Exam ID is required'
      }, { status: 400 })
    }

    console.log('Deleting exam with ID:', id)

    // Start a transaction-like operation
    // First, delete related data in the correct order to avoid foreign key constraints

    // 1. Delete AI analytics
    const { error: aiAnalyticsError } = await supabase
      .from('ai_analytics')
      .delete()
      .eq('exam_id', id)

    if (aiAnalyticsError) {
      console.error('Error deleting AI analytics:', aiAnalyticsError)
    }

    // 2. Delete exam analytics
    const { error: examAnalyticsError } = await supabase
      .from('exam_analytics')
      .delete()
      .eq('exam_id', id)

    if (examAnalyticsError) {
      console.error('Error deleting exam analytics:', examAnalyticsError)
    }

    // 3. Delete proctoring violations (through exam attempts)
    const { data: examAttempts } = await supabase
      .from('exam_attempts')
      .select('id')
      .eq('exam_id', id)

    if (examAttempts && examAttempts.length > 0) {
      const attemptIds = examAttempts.map(attempt => attempt.id)

      const { error: violationsError } = await supabase
        .from('proctoring_violations')
        .delete()
        .in('exam_attempt_id', attemptIds)

      if (violationsError) {
        console.error('Error deleting proctoring violations:', violationsError)
      }
    }

    // 4. Delete proctoring sessions
    const { error: proctoringSessionsError } = await supabase
      .from('proctoring_sessions')
      .delete()
      .eq('exam_id', id)

    if (proctoringSessionsError) {
      console.error('Error deleting proctoring sessions:', proctoringSessionsError)
    }

    // 5. Delete exam attempts
    const { error: attemptsError } = await supabase
      .from('exam_attempts')
      .delete()
      .eq('exam_id', id)

    if (attemptsError) {
      console.error('Error deleting exam attempts:', attemptsError)
    }

    // 6. Delete questions
    const { error: questionsError } = await supabase
      .from('questions')
      .delete()
      .eq('exam_id', id)

    if (questionsError) {
      console.error('Error deleting questions:', questionsError)
    }

    // 7. Finally, delete the exam itself
    const { error: examError } = await supabase
      .from('exams')
      .delete()
      .eq('id', id)

    if (examError) {
      console.error('Error deleting exam:', examError)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete exam',
        details: examError.message
      }, { status: 500 })
    }

    console.log('Exam deleted successfully:', id)

    return NextResponse.json({
      success: true,
      message: 'Exam and all related data deleted successfully'
    })

  } catch (error) {
    console.error('Delete exam error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}