import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching exams from database...')
    
    const { data: exams, error } = await supabase
      .from('exams')
      .select('*')
      .eq('status', 'active')
      .in('exam_type', ['admin', 'student']) // Show both admin and student exams for public
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching exams:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch exams',
        details: error.message
      }, { status: 500 })
    }

    console.log(`Found ${exams?.length || 0} active exams`)

    return NextResponse.json({
      success: true,
      count: exams?.length || 0,
      exams: exams || []
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