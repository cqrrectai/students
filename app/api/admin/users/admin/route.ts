import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`)
    }

    const { data: adminUsers, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching admin users:', error)
      return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 })
    }

    // Remove password hashes from response
    const sanitizedUsers = adminUsers?.map(user => {
      const { password_hash, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    return NextResponse.json({
      success: true,
      data: sanitizedUsers || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, full_name, password, is_active = true } = body

    if (!username || !password) {
      return NextResponse.json({
        error: 'Missing required fields: username, password'
      }, { status: 400 })
    }

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return NextResponse.json({
        error: 'Username already exists'
      }, { status: 400 })
    }

    // Hash password
    const saltRounds = 12
    const password_hash = await bcrypt.hash(password, saltRounds)

    // Create admin user
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .insert({
        username,
        email,
        full_name,
        password_hash,
        is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating admin user:', error)
      return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 })
    }

    // Remove password hash from response
    const { password_hash: _, ...userWithoutPassword } = adminUser

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: 'Admin user created successfully'
    })
  } catch (error) {
    console.error('Admin create user API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}