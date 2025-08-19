import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: question, error } = await supabase
      .from('questions')
      .select(`
        *,
        exam:exams(id, title, type, subject)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching question:', error)
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: question
    })
  } catch (error) {
    console.error('Admin question detail API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      question,
      options,
      correct_answer,
      marks,
      difficulty,
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
      .update({
        question,
        options,
        correct_answer,
        marks,
        difficulty,
        explanation,
        tags,
        order_index,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select(`
        *,
        exam:exams(id, title, type, subject)
      `)
      .single()

    if (error) {
      console.error('Error updating question:', error)
      return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: questionData,
      message: 'Question updated successfully'
    })
  } catch (error) {
    console.error('Admin update question API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting question:', error)
      return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully'
    })
  } catch (error) {
    console.error('Admin delete question API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}