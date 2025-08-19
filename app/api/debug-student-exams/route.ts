import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    console.log('Debug: Testing student exams API with userId:', userId)
    
    // Test 1: Get all exams to see what exists
    const { data: allExams, error: allExamsError } = await supabase
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false })
    
    console.log('Debug: All exams count:', allExams?.length || 0)
    console.log('Debug: All exams error:', allExamsError)
    
    // Test 2: Get student exams specifically
    const { data: studentExams, error: studentExamsError } = await supabase
      .from('exams')
      .select('*')
      .eq('exam_type', 'student')
      .order('created_at', { ascending: false })
    
    console.log('Debug: Student exams count:', studentExams?.length || 0)
    console.log('Debug: Student exams error:', studentExamsError)
    
    // Test 3: Get exams by user if userId provided
    let userExams = null
    let userExamsError = null
    if (userId) {
      const result = await supabase
        .from('exams')
        .select('*')
        .eq('created_by', userId)
        .eq('exam_type', 'student')
        .order('created_at', { ascending: false })
      
      userExams = result.data
      userExamsError = result.error
      
      console.log('Debug: User exams count:', userExams?.length || 0)
      console.log('Debug: User exams error:', userExamsError)
    }
    
    // Test 4: Check if there are any exams with created_by field
    const { data: examsWithCreator, error: creatorError } = await supabase
      .from('exams')
      .select('id, title, created_by, exam_type')
      .not('created_by', 'is', null)
      .order('created_at', { ascending: false })
    
    console.log('Debug: Exams with creator count:', examsWithCreator?.length || 0)
    console.log('Debug: Exams with creator error:', creatorError)
    
    return NextResponse.json({
      success: true,
      debug: {
        userId,
        allExamsCount: allExams?.length || 0,
        studentExamsCount: studentExams?.length || 0,
        userExamsCount: userExams?.length || 0,
        examsWithCreatorCount: examsWithCreator?.length || 0,
        allExamsError,
        studentExamsError,
        userExamsError,
        creatorError,
        sampleAllExams: allExams?.slice(0, 3).map(e => ({
          id: e.id,
          title: e.title,
          exam_type: e.exam_type,
          created_by: e.created_by,
          status: e.status
        })) || [],
        sampleStudentExams: studentExams?.slice(0, 3).map(e => ({
          id: e.id,
          title: e.title,
          exam_type: e.exam_type,
          created_by: e.created_by,
          status: e.status
        })) || [],
        sampleUserExams: userExams?.slice(0, 3).map(e => ({
          id: e.id,
          title: e.title,
          exam_type: e.exam_type,
          created_by: e.created_by,
          status: e.status
        })) || [],
        sampleExamsWithCreator: examsWithCreator?.slice(0, 3) || []
      }
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug API error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}