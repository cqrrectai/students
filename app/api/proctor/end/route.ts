import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { examId, sessionId, proctoringData } = await request.json()

    if (!examId || !sessionId || !proctoringData) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters'
      }, { status: 400 })
    }

    // Update proctoring session
    const { error: sessionError } = await supabase
      .from('proctoring_sessions')
      .update({
        ended_at: new Date().toISOString(),
        status: 'completed',
        final_data: proctoringData,
        violation_count: proctoringData.violations?.length || 0,
        keystrokes: proctoringData.keystrokes || 0,
        mouse_clicks: proctoringData.mouseClicks || 0,
        tab_switches: proctoringData.tabSwitches || 0
      })
      .eq('id', sessionId)

    if (sessionError) {
      console.error('Failed to update proctoring session:', sessionError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update proctoring session'
      }, { status: 500 })
    }

    // Get exam attempt to update proctoring data
    const { data: examAttempt, error: attemptError } = await supabase
      .from('exam_attempts')
      .select('id')
      .eq('exam_id', examId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!attemptError && examAttempt) {
      // Update exam attempt with proctoring data
      await supabase
        .from('exam_attempts')
        .update({
          proctoring_data: {
            sessionId,
            violations: proctoringData.violations?.length || 0,
            riskScore: calculateRiskScore(proctoringData.violations || []),
            summary: generateSummary(proctoringData.violations || [])
          }
        })
        .eq('id', examAttempt.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Proctoring session completed'
    })

  } catch (error) {
    console.error('Proctoring end error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to end proctoring session'
    }, { status: 500 })
  }
}

function calculateRiskScore(violations: any[]): number {
  let score = 0
  violations.forEach(violation => {
    switch (violation.severity) {
      case 'low': score += 1; break
      case 'medium': score += 3; break
      case 'high': score += 5; break
    }
  })
  return Math.min(score, 100)
}

function generateSummary(violations: any[]): string {
  if (violations.length === 0) {
    return 'No violations detected. Clean exam session.'
  }

  const violationTypes = violations.reduce((acc, v) => {
    acc[v.type] = (acc[v.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const summaryParts = Object.entries(violationTypes).map(([type, count]) => 
    `${count} ${type.replace('_', ' ')} violation${count > 1 ? 's' : ''}`
  )

  return `Detected: ${summaryParts.join(', ')}`
}