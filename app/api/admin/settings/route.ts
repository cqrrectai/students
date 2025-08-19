import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from('admin_settings')
      .select('*')
      .order('key', { ascending: true })

    if (error) {
      console.error('Error fetching admin settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // Convert to key-value object
    const settingsObject: Record<string, any> = {}
    settings?.forEach(setting => {
      settingsObject[setting.key] = {
        value: setting.value,
        description: setting.description,
        updated_at: setting.updated_at,
        updated_by: setting.updated_by
      }
    })

    return NextResponse.json({
      success: true,
      data: settingsObject
    })
  } catch (error) {
    console.error('Admin settings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value, description, updated_by } = body

    if (!key || value === undefined) {
      return NextResponse.json({
        error: 'Missing required fields: key, value'
      }, { status: 400 })
    }

    const { data: setting, error } = await supabase
      .from('admin_settings')
      .upsert({
        key,
        value,
        description,
        updated_by,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating admin setting:', error)
      return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: setting,
      message: `Setting "${key}" updated successfully`
    })
  } catch (error) {
    console.error('Admin update setting API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings, updated_by } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({
        error: 'Settings must be an object'
      }, { status: 400 })
    }

    const updates = Object.entries(settings).map(([key, config]: [string, any]) => ({
      key,
      value: config.value,
      description: config.description,
      updated_by,
      updated_at: new Date().toISOString()
    }))

    const { data: updatedSettings, error } = await supabase
      .from('admin_settings')
      .upsert(updates)
      .select()

    if (error) {
      console.error('Error bulk updating admin settings:', error)
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: `${updates.length} settings updated successfully`
    })
  } catch (error) {
    console.error('Admin bulk update settings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}