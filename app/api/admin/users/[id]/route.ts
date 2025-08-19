import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    // Get user profile with related data
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select(`
        *,
        exam_attempts (
          id,
          exam_id,
          score,
          percentage,
          created_at,
          exams (
            title,
            subject
          )
        ),
        exams (
          id,
          title,
          status,
          created_at
        )
      `)
      .eq('id', id)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json({
        success: false,
        error: 'User not found',
        details: userError.message
      }, { status: 404 })
    }

    // Calculate user statistics
    const attempts = user.exam_attempts || []
    const createdExams = user.exams || []
    
    const stats = {
      totalAttempts: attempts.length,
      averageScore: attempts.length > 0 
        ? Math.round(attempts.reduce((sum: number, attempt: any) => sum + attempt.percentage, 0) / attempts.length)
        : 0,
      createdExams: createdExams.length,
      lastActivity: user.updated_at
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        stats
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    const { email, full_name, role } = body

    // Validate required fields
    if (!email || !full_name) {
      return NextResponse.json({
        success: false,
        error: 'Email and full name are required'
      }, { status: 400 })
    }

    // Update user profile
    const { data: user, error: updateError } = await supabase
      .from('profiles')
      .update({
        email,
        full_name,
        role: role || 'student',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update user',
        details: updateError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user,
      message: 'User updated successfully'
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    console.log('Deleting user with ID:', id)

    // Delete related data in correct order to avoid foreign key constraints

    // 1. Delete AI analytics
    const { error: aiAnalyticsError } = await supabase
      .from('ai_analytics')
      .delete()
      .eq('user_id', id)

    if (aiAnalyticsError) {
      console.error('Error deleting AI analytics:', aiAnalyticsError)
    }

    // 2. Delete notifications
    const { error: notificationsError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', id)

    if (notificationsError) {
      console.error('Error deleting notifications:', notificationsError)
    }

    // 3. Delete payment transactions
    const { error: paymentsError } = await supabase
      .from('payment_transactions')
      .delete()
      .eq('user_id', id)

    if (paymentsError) {
      console.error('Error deleting payments:', paymentsError)
    }

    // 4. Delete proctoring violations
    const { error: violationsError } = await supabase
      .from('proctoring_violations')
      .delete()
      .eq('user_id', id)

    if (violationsError) {
      console.error('Error deleting violations:', violationsError)
    }

    // 5. Delete proctoring sessions
    const { error: proctoringError } = await supabase
      .from('proctoring_sessions')
      .delete()
      .eq('user_id', id)

    if (proctoringError) {
      console.error('Error deleting proctoring sessions:', proctoringError)
    }

    // 6. Delete exam attempts
    const { error: attemptsError } = await supabase
      .from('exam_attempts')
      .delete()
      .eq('user_id', id)

    if (attemptsError) {
      console.error('Error deleting exam attempts:', attemptsError)
    }

    // 7. Delete user-created exams (and their questions)
    const { data: userExams } = await supabase
      .from('exams')
      .select('id')
      .eq('created_by', id)

    if (userExams && userExams.length > 0) {
      const examIds = userExams.map(exam => exam.id)
      
      // Delete questions for user exams
      const { error: questionsError } = await supabase
        .from('questions')
        .delete()
        .in('exam_id', examIds)

      if (questionsError) {
        console.error('Error deleting questions:', questionsError)
      }

      // Delete user exams
      const { error: examsError } = await supabase
        .from('exams')
        .delete()
        .eq('created_by', id)

      if (examsError) {
        console.error('Error deleting user exams:', examsError)
      }
    }

    // 8. Delete subscriptions
    const { error: subscriptionsError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', id)

    if (subscriptionsError) {
      console.error('Error deleting subscriptions:', subscriptionsError)
    }

    // 9. Finally, delete the user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete user',
        details: profileError.message
      }, { status: 500 })
    }

    // 10. Delete from auth.users (if possible)
    // Note: This might require admin privileges
    try {
      const { error: authError } = await supabase.auth.admin.deleteUser(id)
      if (authError) {
        console.warn('Could not delete auth user:', authError)
        // Don't fail the request as profile is already deleted
      }
    } catch (authDeleteError) {
      console.warn('Auth user deletion not available:', authDeleteError)
    }

    console.log('User deleted successfully:', id)

    return NextResponse.json({
      success: true,
      message: 'User and all related data deleted successfully'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}