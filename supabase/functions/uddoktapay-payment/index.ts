import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  examId?: string
  subscriptionPlan?: 'standard' | 'pro'
  amount: number
  studentEmail: string
  studentName: string
  returnUrl: string
  userId?: string
  method?: string
  invoice_id?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Get user from auth header (optional for student payments)
    const authHeader = req.headers.get('Authorization')
    let userId = null
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
      if (!authError && user) {
        userId = user.id
      }
    }

    if (req.method === 'POST') {
      const { examId, subscriptionPlan, amount, studentEmail, studentName, returnUrl, method, invoice_id, userId: providedUserId }: PaymentRequest = await req.json()
      
      // Use provided userId if available (for authenticated users)
      const finalUserId = userId || providedUserId
      
      // If this is a verification request
      if (method === 'GET' && invoice_id) {
        return await handlePaymentVerification(invoice_id, supabaseClient)
      }
      
      const uddoktapayApiKey = Deno.env.get('UDDOKTAPAY_API')
      if (!uddoktapayApiKey) {
        throw new Error('Uddoktapay API key not configured')
      }

      console.log('Creating payment - User ID:', finalUserId, 'Student:', studentName, studentEmail)

      // Create payment transaction record
      const transactionData = {
        user_id: finalUserId, // Can be null for student sessions
        exam_id: examId || null,
        amount: amount,
        status: 'pending',
        payment_method: 'uddoktapay',
        gateway_response: {
          student_email: studentEmail,
          student_name: studentName,
          subscription_plan: subscriptionPlan || null,
          is_student_session: !finalUserId // Flag to indicate this is a student session payment
        }
      }

      const { data: transaction, error: transactionError } = await supabaseClient
        .from('payment_transactions')
        .insert(transactionData)
        .select()
        .single()

      if (transactionError) {
        console.error('Transaction creation error:', transactionError)
        throw new Error('Failed to create transaction record')
      }

      console.log('Transaction created:', transaction.id)

      // Prepare Uddoktapay checkout request
      const checkoutData = {
        full_name: studentName,
        email: studentEmail,
        amount: amount,
        metadata: {
          transaction_id: transaction.id,
          exam_id: examId || null,
          subscription_plan: subscriptionPlan || null,
          user_id: finalUserId
        },
        redirect_url: returnUrl,
        return_type: 'GET',
        cancel_url: returnUrl,
        webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/uddoktapay-webhook`
      }

      console.log('Creating Uddoktapay checkout session:', checkoutData)

      // Create checkout session with Uddoktapay
      const response = await fetch('https://cqrrect.paymently.io/api/checkout-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'RT-UDDOKTAPAY-API-KEY': uddoktapayApiKey
        },
        body: JSON.stringify(checkoutData)
      })

      const result = await response.json()
      console.log('Uddoktapay response:', result)

      if (!response.ok) {
        throw new Error(result.message || 'Payment session creation failed')
      }

      // Update transaction with payment session info
      await supabaseClient
        .from('payment_transactions')
        .update({
          transaction_id: result.invoice_id,
          gateway_response: {
            ...transaction.gateway_response,
            checkout_url: result.payment_url,
            invoice_id: result.invoice_id
          }
        })
        .eq('id', transaction.id)

      return new Response(
        JSON.stringify({
          success: true,
          payment_url: result.payment_url,
          transaction_id: transaction.id,
          invoice_id: result.invoice_id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      },
    )

  } catch (error) {
    console.error('Payment processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

async function handlePaymentVerification(invoiceId: string, supabaseClient: any) {
  const uddoktapayApiKey = Deno.env.get('UDDOKTAPAY_API')
  if (!uddoktapayApiKey) {
    throw new Error('Uddoktapay API key not configured')
  }

  // Verify payment with Uddoktapay
  const verifyResponse = await fetch(`https://cqrrect.paymently.io/api/verify-payment/${invoiceId}`, {
    method: 'GET',
    headers: {
      'RT-UDDOKTAPAY-API-KEY': uddoktapayApiKey
    }
  })

  const verificationResult = await verifyResponse.json()
  console.log('Payment verification result:', verificationResult)

  // Update transaction status
  const { data: transaction } = await supabaseClient
    .from('payment_transactions')
    .select()
    .eq('transaction_id', invoiceId)
    .single()

  if (transaction) {
    const newStatus = verificationResult.status === 'COMPLETED' ? 'completed' : 'failed'
    
    await supabaseClient
      .from('payment_transactions')
      .update({
        status: newStatus,
        gateway_response: {
          ...transaction.gateway_response,
          verification_result: verificationResult
        }
      })
      .eq('id', transaction.id)

    // If payment is successful and it's for a subscription, update user subscription
    if (newStatus === 'completed' && transaction.gateway_response?.subscription_plan && transaction.user_id) {
      const plan = transaction.gateway_response.subscription_plan
      const limits = plan === 'standard' 
        ? { student_limit: 2000, exam_limit: 100 } 
        : { student_limit: 9999, exam_limit: 9999 }
      
      await supabaseClient
        .from('subscriptions')
        .upsert({
          user_id: transaction.user_id,
          plan: plan,
          ...limits,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })

      console.log(`Updated subscription for user ${transaction.user_id} to ${plan}`)
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      status: verificationResult.status,
      transaction_id: invoiceId
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    },
  )
}