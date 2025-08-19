import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Real Supabase configuration for Cqrrect Student project
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cilkisybkfubsxwdzddi.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpbGtpc3lia2Z1YnN4d2R6ZGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTkxMzksImV4cCI6MjA2Nzc5NTEzOX0.XYc3oCt8InwM0TobV5DTUsOrQD0cDm6soNo2wWFMCXk'

// For client components - create a stable client with proper auth config
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // Enable session persistence for proper auth
    autoRefreshToken: true, // Enable auto refresh for proper auth
    detectSessionInUrl: true, // Enable URL session detection
    flowType: 'pkce', // Use PKCE flow for better security
  },
  global: {
    headers: {
      'x-client-info': 'cqrrect-ai@1.0.0',
    },
  },
})

// For server components and edge functions
export const createServerClient = () => {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // Server doesn't need session persistence
      autoRefreshToken: false, // Server doesn't need auto refresh
    },
  })
} 