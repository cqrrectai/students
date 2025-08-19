import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscriptionPlan, amount, studentEmail, studentName, returnUrl } = body

    // Validate required fields
    if (!subscriptionPlan || !amount || !studentEmail || !studentName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate plan
    if (!['pro'].includes(subscriptionPlan)) {
      return NextResponse.json(
        { error: 'Invalid subscription plan. Only Pro plan requires payment.' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Call the UddoktaPay Edge Function
    const { data, error } = await supabase.functions.invoke('uddoktapay-payment', {
      body: {
        subscriptionPlan,
        amount,
        studentEmail,
        studentName,
        returnUrl: returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=success`,
      },
    })

    if (error) {
      console.error('Edge function error:', error)
      return NextResponse.json(
        { error: 'Payment initialization failed', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Payment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 