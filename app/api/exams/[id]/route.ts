import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = params.id
    console.log('Fetching exam:', examId)

    // Get exam details
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single()

    if (examError) {
      console.error('Error fetching exam:', examError)
      return NextResponse.json({
        success: false,
        error: 'Exam not found',
        details: examError.message
      }, { status: 404 })
    }

    // Get questions for this exam
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('exam_id', examId)
      .order('order_index', { ascending: true })

    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch questions',
        details: questionsError.message
      }, { status: 500 })
    }

    // Transform questions to match the expected format
    const questionsData = (questions || []).map(q => ({
      id: q.id,
      question: q.question,
      options: Array.isArray(q.options) ? q.options as string[] : [],
      correctAnswer: q.correct_answer,
      marks: q.marks || 1,
      difficulty: q.difficulty || 'medium',
      subject: exam.subject,
      explanation: q.explanation
    }))

    // Transform exam data to match expected format
    const examData = {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      type: exam.type,
      subject: exam.subject,
      duration: exam.duration,
      totalMarks: exam.total_marks,
      instructions: exam.instructions,
      questionsData,
      security: exam.security || {
        randomizeQuestions: false,
        randomizeOptions: false,
        preventCopyPaste: true,
        fullScreenMode: false,
        timeLimit: true,
        showResults: true,
        allowReview: true,
        maxAttempts: 3,
        passingScore: 60
      }
    }

    console.log(`Found exam "${exam.title}" with ${questionsData.length} questions`)

    return NextResponse.json({
      success: true,
      exam: examData
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}