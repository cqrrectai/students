import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      console.log('Invalid UUID format for userId:', userId)
      return NextResponse.json({
        success: true,
        subscription: {
          id: 'free',
          user_id: userId,
          plan: 'free',
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          student_limit: 1000,
          exam_limit: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })
    }

    // Get user subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found, return default free plan
        return NextResponse.json({
          success: true,
          subscription: {
            id: 'free',
            user_id: userId,
            plan: 'free',
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            student_limit: 1000,
            exam_limit: 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        })
      }

      console.error('Error fetching subscription:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch subscription'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      subscription
    })

  } catch (error) {
    console.error('Subscription API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id,
      plan,
      status = 'active',
      student_limit,
      exam_limit
    } = body

    if (!user_id || !plan) {
      return NextResponse.json({
        success: false,
        error: 'User ID and plan are required'
      }, { status: 400 })
    }

    // Set plan limits
    let limits = { student_limit: 1000, exam_limit: 10 }
    if (plan === 'standard') {
      limits = { student_limit: 2000, exam_limit: 100 }
    } else if (plan === 'pro') {
      limits = { student_limit: 9999, exam_limit: 9999 }
    }

    // Create or update subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id,
        plan,
        status,
        ...limits,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating/updating subscription:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create/update subscription'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      subscription,
      message: 'Subscription updated successfully'
    })

  } catch (error) {
    console.error('Subscription creation API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, ...updates } = body

    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    // Update subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating subscription:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update subscription'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      subscription,
      message: 'Subscription updated successfully'
    })

  } catch (error) {
    console.error('Subscription update API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}