import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabaseAuth = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabaseAuth.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    console.log('Fetching student exams for user:', session.user.id)
    
    const { data: exams, error } = await supabase
      .from('exams')
      .select('*')
      .eq('created_by', session.user.id)
      .eq('exam_type', 'student') // Only student-created exams
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