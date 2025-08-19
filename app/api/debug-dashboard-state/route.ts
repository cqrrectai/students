import { NextRequest, NextResponse } from 'next/server'

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
    
    console.log('Debug: Testing dashboard state with userId:', userId)
    
    // Test the exact same calls the dashboard makes
    const [dashboardResponse, studentExamsResponse] = await Promise.all([
      fetch(`${request.nextUrl.origin}/api/dashboard?userId=${userId}`),
      fetch(`${request.nextUrl.origin}/api/student-exams?userId=${userId}`)
    ])
    
    const [dashboardResult, studentExamsResult] = await Promise.all([
      dashboardResponse.json(),
      studentExamsResponse.json()
    ])
    
    return NextResponse.json({
      success: true,
      debug: {
        userId,
        dashboardAPI: {
          success: dashboardResult.success,
          error: dashboardResult.error,
          dataKeys: dashboardResult.data ? Object.keys(dashboardResult.data) : [],
          studentExamsFromDashboard: dashboardResult.data?.studentExams?.length || 0,
          userAttemptsFromDashboard: dashboardResult.data?.userAttempts?.length || 0
        },
        studentExamsAPI: {
          success: studentExamsResult.success,
          error: studentExamsResult.error,
          count: studentExamsResult.count || 0,
          examsLength: studentExamsResult.exams?.length || 0,
          sampleExam: studentExamsResult.exams?.[0] ? {
            id: studentExamsResult.exams[0].id,
            title: studentExamsResult.exams[0].title,
            status: studentExamsResult.exams[0].status,
            exam_type: studentExamsResult.exams[0].exam_type,
            created_by: studentExamsResult.exams[0].created_by
          } : null
        },
        comparison: {
          dashboardHasStudentExams: (dashboardResult.data?.studentExams?.length || 0) > 0,
          studentExamsAPIHasExams: (studentExamsResult.exams?.length || 0) > 0,
          bothAPIsWorking: dashboardResult.success && studentExamsResult.success,
          dataConsistency: (dashboardResult.data?.studentExams?.length || 0) === (studentExamsResult.exams?.length || 0)
        }
      }
    })

  } catch (error) {
    console.error('Debug dashboard state error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug API error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}