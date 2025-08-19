import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session && data.user) {
      // Check if this is a new user (created within the last minute)
      const userCreatedAt = new Date(data.user.created_at)
      const now = new Date()
      const timeDifference = now.getTime() - userCreatedAt.getTime()
      const isNewUser = timeDifference < 60000 // 1 minute

      if (isNewUser) {
        // Trigger welcome email for new users
        try {
          await fetch(`${requestUrl.origin}/api/auth/welcome`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || data.user.user_metadata?.full_name
            })
          })
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError)
          // Don't fail the auth flow if email fails
        }
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + '/dashboard')
} 