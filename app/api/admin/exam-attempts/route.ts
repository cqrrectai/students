import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const examId = searchParams.get('exam_id')
    const userId = searchParams.get('user_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    let query = supabase
      .from('exam_attempts')
      .select(`
        *,
        exam:exams(id, title, type, subject),
        user:profiles(id, full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (examId && examId !== 'all') {
      query = query.eq('exam_id', examId)
    }
    if (userId && userId !== 'all') {
      query = query.eq('user_id', userId)
    }

    const { data: attempts, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching exam attempts:', error)
      return NextResponse.json({ error: 'Failed to fetch exam attempts' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: attempts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Admin exam attempts API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      exam_id,
      user_id,
      score,
      total_marks,
      percentage,
      time_taken,
      answers,
      proctoring_data,
      started_at,
      completed_at
    } = body

    // Validate required fields
    if (!exam_id || !user_id || score === undefined || !total_marks || percentage === undefined) {
      return NextResponse.json({
        error: 'Missing required fields: exam_id, user_id, score, total_marks, percentage'
      }, { status: 400 })
    }

    const { data: attempt, error } = await supabase
      .from('exam_attempts')
      .insert({
        exam_id,
        user_id,
        score,
        total_marks,
        percentage,
        time_taken,
        answers,
        proctoring_data,
        started_at,
        completed_at
      })
      .select(`
        *,
        exam:exams(id, title, type, subject),
        user:profiles(id, full_name, email)
      `)
      .single()

    if (error) {
      console.error('Error creating exam attempt:', error)
      return NextResponse.json({ error: 'Failed to create exam attempt' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: attempt,
      message: 'Exam attempt recorded successfully'
    })
  } catch (error) {
    console.error('Admin create exam attempt API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}