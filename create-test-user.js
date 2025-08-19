// Create a test user in Supabase
// Run this with: node create-test-user.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cilkisybkfubsxwdzddi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpbGtpc3lia2Z1YnN4d2R6ZGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTkxMzksImV4cCI6MjA2Nzc5NTEzOX0.XYc3oCt8InwM0TobV5DTUsOrQD0cDm6soNo2wWFMCXk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestUser() {
  console.log('Creating test user...')
  
  const { data, error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'testpassword123',
    options: {
      data: {
        full_name: 'Test User',
        role: 'student'
      }
    }
  })
  
  if (error) {
    console.error('Error creating test user:', error)
  } else {
    console.log('Test user created successfully:', data)
  }
}

createTestUser()