import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })
    
    // Get the pathname
    const path = request.nextUrl.pathname

    // Skip middleware for static files and API routes
    if (
      path.startsWith('/_next') || 
      path.startsWith('/api') ||
      path.startsWith('/static') ||
      path === '/auth/callback'
    ) {
      return res
    }

    // Refresh session if exists
    const { data: { session } } = await supabase.auth.getSession()

    // Handle admin routes
    if (path.startsWith('/admin')) {
      // Always allow access to login page
      if (path === '/admin/login') {
        return res
      }

      // For all other admin routes, check auth state
      const adminUser = request.cookies.get('adminUser')?.value
      if (!adminUser) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
} 