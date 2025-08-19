"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

// Types
interface AdminUser {
  id: string
  username: string
  email?: string
  full_name?: string
  role?: string
}

interface AuthState {
  // User authentication
  user: User | null
  session: Session | null
  userLoading: boolean
  
  // Admin authentication
  isAdmin: boolean
  adminUser: AdminUser | null
  adminLoading: boolean
  
  // General loading state
  loading: boolean
  initialized: boolean
}

interface AuthActions {
  // User auth actions
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, fullName?: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  
  // Admin auth actions
  signInAdmin: (username: string, password: string) => Promise<AuthResult>
  signOutAdmin: () => void
  
  // Utility actions
  refreshAuth: () => Promise<void>
}

interface AuthResult {
  success: boolean
  error?: string
  data?: any
}

type AuthContextType = AuthState & AuthActions

// Initial state
const initialState: AuthState = {
  user: null,
  session: null,
  userLoading: true,
  isAdmin: false,
  adminUser: null,
  adminLoading: true,
  loading: true,
  initialized: false,
}

// Create context with error boundary protection
// Create a default context value to avoid null errors
const defaultContext: AuthContextType = {
  // User authentication
  user: null,
  session: null,
  userLoading: false,
  
  // Admin authentication
  isAdmin: false,
  adminUser: null,
  adminLoading: false,
  
  // General loading state
  loading: false,
  initialized: false,

  // Auth functions (these will be properly implemented in the provider)
  signIn: async () => ({ success: false, error: 'Auth not initialized' }),
  signUp: async () => ({ success: false, error: 'Auth not initialized' }),
  signOut: async () => {},
  signInAdmin: async () => ({ success: false, error: 'Auth not initialized' }),
  signOutAdmin: () => {},
  refreshAuth: async () => {}
};

const AuthContext = createContext<AuthContextType>(defaultContext);

// Safe hook with error boundary
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  return context;
}

// Safe hook that doesn't throw (for optional usage)
export function useAuthSafe(): AuthContextType {
  return useContext(AuthContext)
}

// Cookie utilities
const setCookie = (name: string, value: string, days: number = 1) => {
  if (typeof window === 'undefined') return
  
  const expires = new Date()
  expires.setDate(expires.getDate() + days)
  
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

const removeCookie = (name: string) => {
  if (typeof window === 'undefined') return
  
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

const getStoredAdminUser = (): AdminUser | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem('adminUser')
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.warn('Error parsing stored admin user:', error)
    localStorage.removeItem('adminUser')
    return null
  }
}

const storeAdminUser = (adminUser: AdminUser) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('adminUser', JSON.stringify(adminUser))
    setCookie('adminUser', JSON.stringify(adminUser))
  } catch (error) {
    console.error('Error storing admin user:', error)
  }
}

const clearAdminUser = () => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem('adminUser')
    removeCookie('adminUser')
  } catch (error) {
    console.error('Error clearing admin user:', error)
  }
}

// Error boundary component
export class AuthErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      return (
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="max-w-md p-6 text-center">
            <div className="text-red-500 text-xl mb-4">⚠️ Authentication Error</div>
            <p className="text-gray-600 mb-4">
              There was an error with the authentication system. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#00e4a0] text-white rounded hover:bg-[#00d494]"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Main Auth Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState)

  // Initialize authentication
  useEffect(() => {
    let isMounted = true
    
    const initializeAuth = async () => {
      try {
        // Only proceed if we're on the client
        if (typeof window === 'undefined') return
        
        console.log('🔐 Initializing authentication...')
        
        // Initialize user auth
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('Supabase session error:', error)
        }
        
        // Check for stored admin user
        const storedAdmin = getStoredAdminUser()
        
        if (isMounted) {
          setState(prev => ({
            ...prev,
            user: session?.user || null,
            session: session || null,
            userLoading: false,
            isAdmin: !!storedAdmin,
            adminUser: storedAdmin,
            adminLoading: false,
            loading: false,
            initialized: true,
          }))
          
          console.log('✅ Authentication initialized', {
            hasUser: !!session?.user,
            hasAdmin: !!storedAdmin
          })
        }
        
      } catch (error) {
        console.error('Auth initialization error:', error)
        
        if (isMounted) {
          setState(prev => ({
            ...prev,
            userLoading: false,
            adminLoading: false,
            loading: false,
            initialized: true,
          }))
        }
      }
    }

    // Set up Supabase auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        console.log('🔄 Auth state changed:', event)
        
        setState(prev => ({
          ...prev,
          user: session?.user || null,
          session: session || null,
          userLoading: false,
        }))
      }
    })

    initializeAuth()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Auth actions
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      setState(prev => ({ ...prev, userLoading: true }))
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        return { success: true, data: data.user }
      }

      return { success: false, error: 'No user data returned' }
      
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: 'Sign in failed' }
    } finally {
      setState(prev => ({ ...prev, userLoading: false }))
    }
  }

  const signUp = async (email: string, password: string, fullName?: string): Promise<AuthResult> => {
    try {
      setState(prev => ({ ...prev, userLoading: true }))
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data.user }
      
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: 'Sign up failed' }
    } finally {
      setState(prev => ({ ...prev, userLoading: false }))
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const signInAdmin = async (username: string, password: string): Promise<AuthResult> => {
    try {
      setState(prev => ({ ...prev, adminLoading: true }))
      
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username.trim(), 
          password 
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        return { 
          success: false, 
          error: result.error || `Authentication failed (${response.status})` 
        }
      }

      const adminData: AdminUser = {
        id: result.admin.id,
        username: result.admin.username,
        email: result.admin.email,
        full_name: result.admin.full_name,
        role: result.admin.role || 'admin',
      }

      // Store admin data
      storeAdminUser(adminData)

      setState(prev => ({
        ...prev,
        isAdmin: true,
        adminUser: adminData,
        adminLoading: false,
      }))

      return { success: true, data: adminData }
      
    } catch (error) {
      console.error('Admin sign in error:', error)
      return { success: false, error: 'Admin authentication failed' }
    } finally {
      setState(prev => ({ ...prev, adminLoading: false }))
    }
  }

  const signOutAdmin = (): void => {
    clearAdminUser()
    
    setState(prev => ({
      ...prev,
      isAdmin: false,
      adminUser: null,
    }))
  }

  const refreshAuth = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      // Refresh user session
      const { data: { session } } = await supabase.auth.getSession()
      
      // Check admin session
      const storedAdmin = getStoredAdminUser()
      
      setState(prev => ({
        ...prev,
        user: session?.user || null,
        session: session || null,
        isAdmin: !!storedAdmin,
        adminUser: storedAdmin,
        loading: false,
      }))
      
    } catch (error) {
      console.error('Auth refresh error:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  // Create context value
  const contextValue: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    signInAdmin,
    signOutAdmin,
    refreshAuth,
  }

  return (
    <AuthErrorBoundary>
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    </AuthErrorBoundary>
  )
}

// Loading component
export function AuthLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00e4a0] mx-auto mb-4"></div>
        <p className="text-gray-600">Initializing authentication...</p>
      </div>
    </div>
  )
}

// Auth guard component
export function AuthGuard({ 
  children, 
  requireAuth = false, 
  requireAdmin = false,
  fallback
}: { 
  children: ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  fallback?: ReactNode
}) {
  const { user, isAdmin, loading, initialized } = useAuth()

  if (!initialized || loading) {
    return fallback || <AuthLoading />
  }

  if (requireAuth && !user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to continue</p>
          <a 
            href="/auth/sign-in"
            className="px-4 py-2 bg-[#00e4a0] text-white rounded hover:bg-[#00d494]"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  if (requireAdmin && !isAdmin) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Admin access required</p>
          <a 
            href="/admin/login"
            className="px-4 py-2 bg-[#00e4a0] text-white rounded hover:bg-[#00d494]"
          >
            Admin Login
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Export the context for advanced usage
export { AuthContext }