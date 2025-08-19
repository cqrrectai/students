import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { emailService } from '@/lib/email-service'
import { initializeUserSubscription } from '@/lib/subscription-utils'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, email, name } = body

    if (!user_id || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if user exists in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile lookup error:', profileError)
      return NextResponse.json(
        { error: 'Failed to lookup user profile' },
        { status: 500 }
      )
    }

    // If profile doesn't exist, create it
    if (!profile) {
      const { error: createError } = await supabase
        .from('profiles')
        .insert([{
          id: user_id,
          email: email,
          username: name || email.split('@')[0],
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (createError) {
        console.error('Profile creation error:', createError)
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        )
      }
    }

    // Initialize user subscription (free plan with AI credits)
    try {
      await initializeUserSubscription(user_id)
    } catch (subscriptionError) {
      console.error('Failed to initialize subscription:', subscriptionError)
      // Don't fail the request if subscription init fails
    }

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail({
        name: name || email.split('@')[0],
        email: email
      })
    } catch (emailError) {
      console.error('Welcome email failed:', emailError)
      // Don't fail the request if email fails, just log it
    }

    // Queue admin notification for new user registration
    try {
      await emailService.queueNewUserNotification({
        name: name || email.split('@')[0],
        email: email,
        type: 'Student'
      })
    } catch (queueError) {
      console.error('Failed to queue admin notification:', queueError)
    }

    return NextResponse.json({
      success: true,
      message: 'Welcome process completed'
    })

  } catch (error: any) {
    console.error('Welcome API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
} 