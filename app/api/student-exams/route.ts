import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
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
        count: 0,
        exams: []
      })
    }
    
    console.log('Fetching student exams for user:', userId)
    
    // Get student-created exams with question counts
    const { data: exams, error } = await supabase
      .from('exams')
      .select(`
        *,
        questions(count)
      `)
      .eq('created_by', userId)
      .eq('exam_type', 'student')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching student exams:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch exams',
        details: error.message
      }, { status: 500 })
    }

    // Transform data to include question count
    const transformedExams = (exams || []).map(exam => ({
      ...exam,
      question_count: exam.questions?.[0]?.count || 0
    }))

    console.log(`Found ${transformedExams.length} student exams`)

    return NextResponse.json({
      success: true,
      count: transformedExams.length,
      exams: transformedExams
    })

  } catch (error) {
    console.error('Student exams API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      type,
      subject,
      duration,
      total_marks,
      instructions,
      status = 'draft',
      security,
      created_by,
      questions = []
    } = body

    // Validate required fields
    if (!title || !type || !subject || !duration || !total_marks || !created_by) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, type, subject, duration, total_marks, created_by'
      }, { status: 400 })
    }

    // Create exam
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .insert({
        title,
        description,
        type,
        subject,
        duration,
        total_marks,
        instructions,
        status,
        exam_type: 'student',
        created_by,
        security: security || {
          timeLimit: true,
          allowReview: true,
          maxAttempts: 3,
          showResults: true,
          passingScore: 60,
          fullScreenMode: false,
          preventCopyPaste: true,
          randomizeOptions: false,
          randomizeQuestions: false
        }
      })
      .select()
      .single()

    if (examError) {
      console.error('Error creating student exam:', examError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create exam',
        details: examError.message
      }, { status: 500 })
    }

    // Create questions if provided
    let questionsCreated = 0
    if (questions.length > 0) {
      const questionsData = questions.map((q: any, index: number) => ({
        exam_id: exam.id,
        question: q.question,
        options: q.options,
        correct_answer: q.correctAnswer,
        marks: q.marks || 1,
        difficulty: q.difficulty || 'medium',
        explanation: q.explanation,
        tags: q.tags,
        order_index: index + 1
      }))

      const { data: createdQuestions, error: questionsError } = await supabase
        .from('questions')
        .insert(questionsData)
        .select()

      if (questionsError) {
        console.error('Error creating questions:', questionsError)
        // Don't fail the entire request, just log the error
      } else {
        questionsCreated = createdQuestions?.length || 0
      }
    }

    return NextResponse.json({
      success: true,
      exam,
      questionsCreated,
      message: `Student exam "${title}" created successfully with ${questionsCreated} questions`
    })

  } catch (error) {
    console.error('Student exam creation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Exam ID is required'
      }, { status: 400 })
    }

    const { data: exam, error } = await supabase
      .from('exams')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('exam_type', 'student') // Only allow updating student exams
      .select()
      .single()

    if (error) {
      console.error('Error updating student exam:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update exam',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      exam,
      message: 'Exam updated successfully'
    })

  } catch (error) {
    console.error('Student exam update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!id || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Exam ID and User ID are required'
      }, { status: 400 })
    }

    // Delete questions first (cascade should handle this, but being explicit)
    await supabase
      .from('questions')
      .delete()
      .eq('exam_id', id)

    // Delete exam (only if created by the user)
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id)
      .eq('created_by', userId)
      .eq('exam_type', 'student')

    if (error) {
      console.error('Error deleting student exam:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete exam',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Exam deleted successfully'
    })

  } catch (error) {
    console.error('Student exam deletion error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}