import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/simple-auth-context'

export function useAuthRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      console.log('User authenticated, redirecting to dashboard')
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  return { user, loading }
} 