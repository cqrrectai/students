import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { examId, userId, sessionId, config, deviceInfo } = await request.json()

    if (!examId || !userId || !sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters'
      }, { status: 400 })
    }

    // Create proctoring session record
    const { data, error } = await supabase
      .from('proctoring_sessions')
      .insert({
        id: sessionId,
        exam_id: examId,
        user_id: userId,
        config: config,
        device_info: deviceInfo,
        started_at: new Date().toISOString(),
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create proctoring session:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to initialize proctoring session'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      message: 'Proctoring session initialized'
    })

  } catch (error) {
    console.error('Proctoring start error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to start proctoring'
    }, { status: 500 })
  }
}