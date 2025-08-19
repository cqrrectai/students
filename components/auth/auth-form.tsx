"use client"

import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { usePathname } from 'next/navigation'
import { useAuthRedirect } from '@/hooks/use-simple-auth-redirect'

export function AuthForm() {
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  const { user, loading } = useAuthRedirect()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00e4a0]"></div>
      </div>
    )
  }

  // If user is authenticated, the redirect hook will handle the redirect
  if (user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00e4a0] mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{
        theme: ThemeSupa,
        variables: {
          default: {
            colors: {
              brand: '#00e4a0',
              brandAccent: '#00d494',
            },
          },
        },
      }}
      theme="default"
      providers={['google', 'facebook']}
      redirectTo={`${window.location.origin}/auth/callback`}
      socialLayout="horizontal"
      onlyThirdPartyProviders={false}
      view={pathname === '/auth/sign-up' ? 'sign_up' : 'sign_in'}
    />
  )
} 