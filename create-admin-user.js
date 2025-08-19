// Simple script to create an admin user
// Run with: node create-admin-user.js

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cilkisybkfubsxwdzddi.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpbGtpc3lia2Z1YnN4d2R6ZGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTkxMzksImV4cCI6MjA2Nzc5NTEzOX0.XYc3oCt8InwM0TobV5DTUsOrQD0cDm6soNo2wWFMCXk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdminUser() {
  try {
    console.log('Creating admin user...')
    
    const username = 'admin'
    const password = 'admin123'
    const email = 'admin@cqrrect.ai'
    const fullName = 'Admin User'
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10)
    
    // Insert admin user
    const { data, error } = await supabase
      .from('admin_users')
      .insert([
        {
          username,
          password_hash: passwordHash,
          email,
          full_name: fullName,
          is_active: true
        }
      ])
      .select()
    
    if (error) {
      console.error('Error creating admin user:', error)
      return
    }
    
    console.log('✅ Admin user created successfully!')
    console.log('Username:', username)
    console.log('Password:', password)
    console.log('Email:', email)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

createAdminUser()