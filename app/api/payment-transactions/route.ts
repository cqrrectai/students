import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const status = searchParams.get('status')
    const paymentMethod = searchParams.get('payment_method')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('payment_transactions')
      .select(`
        *,
        user:profiles(full_name, email),
        subscription:subscriptions(plan, status)
      `)
      .order('created_at', { ascending: false })

    if (userId) query = query.eq('user_id', userId)
    if (status) query = query.eq('status', status)
    if (paymentMethod) query = query.eq('payment_method', paymentMethod)

    const { data: transactions, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching payment transactions:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch payment transactions'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: transactions || [],
      pagination: {
        limit,
        offset,
        total: count || 0
      }
    })
  } catch (error) {
    console.error('Payment transactions API error:', error)
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
      subscription_id,
      transaction_id,
      payment_method,
      amount,
      currency = 'BDT',
      payment_intent_id,
      metadata = {}
    } = body

    if (!user_id || !transaction_id || !payment_method || !amount) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: user_id, transaction_id, payment_method, amount'
      }, { status: 400 })
    }

    // Check if transaction already exists
    const { data: existingTransaction } = await supabase
      .from('payment_transactions')
      .select('id')
      .eq('transaction_id', transaction_id)
      .single()

    if (existingTransaction) {
      return NextResponse.json({
        success: false,
        error: 'Transaction already exists'
      }, { status: 409 })
    }

    const { data: transaction, error } = await supabase
      .from('payment_transactions')
      .insert({
        user_id,
        subscription_id,
        transaction_id,
        payment_method,
        amount,
        currency,
        status: 'pending',
        payment_intent_id,
        metadata
      })
      .select(`
        *,
        user:profiles(full_name, email),
        subscription:subscriptions(plan, status)
      `)
      .single()

    if (error) {
      console.error('Error creating payment transaction:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create payment transaction'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: transaction,
      message: 'Payment transaction created successfully'
    })
  } catch (error) {
    console.error('Create payment transaction API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { transaction_id, status, metadata = {} } = body

    if (!transaction_id || !status) {
      return NextResponse.json({
        success: false,
        error: 'transaction_id and status are required'
      }, { status: 400 })
    }

    const updateData: any = {
      status,
      metadata,
      updated_at: new Date().toISOString()
    }

    if (status === 'completed') {
      updateData.processed_at = new Date().toISOString()
    }

    const { data: transaction, error } = await supabase
      .from('payment_transactions')
      .update(updateData)
      .eq('transaction_id', transaction_id)
      .select(`
        *,
        user:profiles(full_name, email),
        subscription:subscriptions(plan, status)
      `)
      .single()

    if (error) {
      console.error('Error updating payment transaction:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update payment transaction'
      }, { status: 500 })
    }

    // If payment completed, update subscription status
    if (status === 'completed' && transaction.subscription_id) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.subscription_id)
    }

    return NextResponse.json({
      success: true,
      data: transaction,
      message: 'Payment transaction updated successfully'
    })
  } catch (error) {
    console.error('Update payment transaction API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}