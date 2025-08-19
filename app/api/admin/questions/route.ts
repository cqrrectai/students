import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const examId = searchParams.get('exam_id')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase
      .from('questions')
      .select(`
        *,
        exam:exams(id, title, type, subject)
      `)
      .order('created_at', { ascending: false })

    if (examId && examId !== 'all') {
      query = query.eq('exam_id', examId)
    }
    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty)
    }
    if (search) {
      query = query.ilike('question', `%${search}%`)
    }

    const { data: questions, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: questions || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Admin questions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      exam_id,
      question,
      options,
      correct_answer,
      marks = 1,
      difficulty = 'medium',
      explanation,
      tags,
      order_index
    } = body

    // Validate required fields
    if (!question || !options || !correct_answer) {
      return NextResponse.json({
        error: 'Missing required fields: question, options, correct_answer'
      }, { status: 400 })
    }

    // Validate options array
    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json({
        error: 'Options must be an array with at least 2 items'
      }, { status: 400 })
    }

    // Validate correct answer is in options
    if (!options.includes(correct_answer)) {
      return NextResponse.json({
        error: 'Correct answer must be one of the provided options'
      }, { status: 400 })
    }

    const { data: questionData, error } = await supabase
      .from('questions')
      .insert({
        exam_id,
        question,
        options,
        correct_answer,
        marks,
        difficulty,
        explanation,
        tags,
        order_index
      })
      .select(`
        *,
        exam:exams(id, title, type, subject)
      `)
      .single()

    if (error) {
      console.error('Error creating question:', error)
      return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: questionData,
      message: 'Question created successfully'
    })
  } catch (error) {
    console.error('Admin create question API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}