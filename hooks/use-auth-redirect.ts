"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export function useAuthRedirect(requireAuth: 'user' | 'admin' | 'both' = 'user') {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Wait for auth to load

    if (requireAuth === 'user' && !user) {
      router.push('/auth/sign-in')
      return
    }

    if (requireAuth === 'admin' && !isAdmin) {
      router.push('/admin/login')
      return
    }

    if (requireAuth === 'both' && !user && !isAdmin) {
      router.push('/auth/sign-in')
      return
    }
  }, [user, isAdmin, loading, requireAuth, router])

  return { user, isAdmin, loading }
}