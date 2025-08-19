import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameter - required for security
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required',
        details: 'userId parameter is missing'
      }, { status: 400 })
    }
    
    console.log('Fetching student exams for user:', userId)
    
    const { data: exams, error } = await supabase
      .from('exams')
      .select('*')
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

    console.log(`Found ${exams?.length || 0} student exams`)

    return NextResponse.json({
      success: true,
      count: exams?.length || 0,
      exams: exams || [],
      userId: userId
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