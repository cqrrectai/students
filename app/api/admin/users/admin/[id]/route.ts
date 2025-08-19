import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Admin user ID is required'
      }, { status: 400 })
    }

    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching admin user:', error)
      return NextResponse.json({
        success: false,
        error: 'Admin user not found',
        details: error.message
      }, { status: 404 })
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = adminUser

    return NextResponse.json({
      success: true,
      data: userWithoutPassword
    })

  } catch (error) {
    console.error('Get admin user error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Admin user ID is required'
      }, { status: 400 })
    }

    const { username, email, full_name, password, is_active } = body

    // Validate required fields
    if (!username) {
      return NextResponse.json({
        success: false,
        error: 'Username is required'
      }, { status: 400 })
    }

    // Check if username already exists (excluding current user)
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('username', username)
      .neq('id', id)
      .single()

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Username already exists'
      }, { status: 400 })
    }

    // Prepare update data
    const updateData: any = {
      username,
      email,
      full_name,
      is_active,
      updated_at: new Date().toISOString()
    }

    // Hash new password if provided
    if (password && password.trim() !== '') {
      const saltRounds = 12
      updateData.password_hash = await bcrypt.hash(password, saltRounds)
    }

    // Update admin user
    const { data: adminUser, error: updateError } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating admin user:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update admin user',
        details: updateError.message
      }, { status: 500 })
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = adminUser

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: 'Admin user updated successfully'
    })

  } catch (error) {
    console.error('Update admin user error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Admin user ID is required'
      }, { status: 400 })
    }

    console.log('Deleting admin user with ID:', id)

    // Delete admin user
    const { error: deleteError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting admin user:', deleteError)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete admin user',
        details: deleteError.message
      }, { status: 500 })
    }

    console.log('Admin user deleted successfully:', id)

    return NextResponse.json({
      success: true,
      message: 'Admin user deleted successfully'
    })

  } catch (error) {
    console.error('Delete admin user error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}