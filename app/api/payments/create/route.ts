import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      examId,
      subscriptionPlan,
      amount,
      studentEmail,
      studentName,
      userId
    } = body

    if (!amount || !studentEmail || !studentName) {
      return NextResponse.json({
        success: false,
        error: 'Amount, student email, and student name are required'
      }, { status: 400 })
    }

    // Create payment transaction record
    const transactionData = {
      user_id: userId || null,
      exam_id: examId || null,
      amount: amount,
      status: 'pending',
      payment_method: 'uddoktapay',
      gateway_response: {
        student_email: studentEmail,
        student_name: studentName,
        subscription_plan: subscriptionPlan || null,
        is_student_session: !userId
      }
    }

    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert(transactionData)
      .select()
      .single()

    if (transactionError) {
      console.error('Transaction creation error:', transactionError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create transaction record'
      }, { status: 500 })
    }

    // For testing purposes, return a mock payment URL
    const mockPaymentUrl = `https://cqrrect.paymently.io/checkout/mock-${transaction.id}`

    return NextResponse.json({
      success: true,
      payment_url: mockPaymentUrl,
      transaction_id: transaction.id,
      invoice_id: `INV-${transaction.id}`,
      message: 'Payment session created successfully'
    })

  } catch (error) {
    console.error('Payment creation API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    let query = supabase
      .from('payment_transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: transactions, error } = await query.limit(50)

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch transactions'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      transactions: transactions || []
    })

  } catch (error) {
    console.error('Payment fetch API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}