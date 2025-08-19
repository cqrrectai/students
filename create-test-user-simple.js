// Create a test user using Supabase directly
// Run this with: node create-test-user-simple.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cilkisybkfubsxwdzddi.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpbGtpc3lia2Z1YnN4d2R6ZGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTkxMzksImV4cCI6MjA2Nzc5NTEzOX0.XYc3oCt8InwM0TobV5DTUsOrQD0cDm6soNo2wWFMCXk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestUser() {
  console.log('🔧 Creating Test User')
  console.log('=' .repeat(30))
  
  const testEmail = 'test@example.com'
  const testPassword = 'testpassword123'
  
  console.log(`\nCreating user: ${testEmail}`)
  
  try {
    // Try to sign up the user
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    })
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ User already exists, trying to sign in...')
        
        // Try to sign in to verify credentials work
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        })
        
        if (signInError) {
          console.log('❌ Sign in failed:', signInError.message)
        } else {
          console.log('✅ Sign in successful!')
          console.log('User ID:', signInData.user?.id)
          console.log('Email:', signInData.user?.email)
          
          // Sign out
          await supabase.auth.signOut()
          console.log('✅ Signed out successfully')
        }
      } else {
        console.log('❌ Error creating user:', error.message)
      }
    } else {
      console.log('✅ User created successfully!')
      console.log('User ID:', data.user?.id)
      console.log('Email:', data.user?.email)
      console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No')
      
      if (data.session) {
        console.log('✅ Session created')
        // Sign out
        await supabase.auth.signOut()
        console.log('✅ Signed out successfully')
      }
    }
    
  } catch (error) {
    console.log('❌ Exception:', error.message)
  }
  
  console.log('\n' + '=' .repeat(30))
  console.log('📋 Test Credentials:')
  console.log(`Email: ${testEmail}`)
  console.log(`Password: ${testPassword}`)
  console.log('\n🧪 Next Steps:')
  console.log('1. Start the dev server: npm run dev')
  console.log('2. Visit: http://localhost:3000/auth/sign-in')
  console.log('3. Use the credentials above to test sign in')
}

createTestUser().catch(console.error)