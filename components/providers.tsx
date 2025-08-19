"use client"

import React from 'react'
import { AuthProvider, AuthErrorBoundary } from '@/lib/auth-context'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

// Error boundary for the entire app
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="max-w-md p-6 text-center">
            <div className="text-red-500 text-xl mb-4">⚠️ Application Error</div>
            <p className="text-gray-600 mb-4">
              Something went wrong. Please refresh the page to continue.
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

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by only rendering providers on client
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <AuthErrorBoundary>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </AuthErrorBoundary>
      </ThemeProvider>
    </AppErrorBoundary>
  )
}