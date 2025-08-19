import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const unreadOnly = searchParams.get('unread_only') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data: notifications, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch notifications'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: notifications || [],
      pagination: {
        limit,
        offset,
        total: count || 0
      }
    })
  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id,
      title,
      message,
      type = 'info',
      action_url,
      metadata = {}
    } = body

    if (!user_id || !title || !message) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: user_id, title, message'
      }, { status: 400 })
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        title,
        message,
        type,
        action_url,
        metadata
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create notification'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    })
  } catch (error) {
    console.error('Create notification API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { notification_ids, read = true } = body

    if (!notification_ids || !Array.isArray(notification_ids)) {
      return NextResponse.json({
        success: false,
        error: 'notification_ids array is required'
      }, { status: 400 })
    }

    const { data: updatedNotifications, error } = await supabase
      .from('notifications')
      .update({ 
        read,
        updated_at: new Date().toISOString()
      })
      .in('id', notification_ids)
      .select()

    if (error) {
      console.error('Error updating notifications:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update notifications'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedNotifications,
      message: `${updatedNotifications?.length || 0} notifications updated`
    })
  } catch (error) {
    console.error('Update notifications API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}