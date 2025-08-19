import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    services: {
      database: { status: 'unknown', details: '' },
      auth: { status: 'unknown', details: '' },
      exams: { status: 'unknown', details: '' },
      questions: { status: 'unknown', details: '' },
      attempts: { status: 'unknown', details: '' },
      admin: { status: 'unknown', details: '' }
    },
    summary: {
      totalIssues: 0,
      criticalIssues: 0,
      warnings: 0
    }
  }

  try {
    // Test database connection
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('id')
        .limit(1)
      
      if (error) {
        healthCheck.services.database.status = 'error'
        healthCheck.services.database.details = error.message
        healthCheck.summary.criticalIssues++
      } else {
        healthCheck.services.database.status = 'healthy'
        healthCheck.services.database.details = 'Connection successful'
      }
    } catch (error) {
      healthCheck.services.database.status = 'error'
      healthCheck.services.database.details = error instanceof Error ? error.message : 'Unknown error'
      healthCheck.summary.criticalIssues++
    }

    // Test exams table
    try {
      const { data: exams, error } = await supabase
        .from('exams')
        .select('id, title, status')
        .limit(5)
      
      if (error) {
        healthCheck.services.exams.status = 'error'
        healthCheck.services.exams.details = error.message
        healthCheck.summary.criticalIssues++
      } else {
        healthCheck.services.exams.status = 'healthy'
        healthCheck.services.exams.details = `Found ${exams?.length || 0} exams`
      }
    } catch (error) {
      healthCheck.services.exams.status = 'error'
      healthCheck.services.exams.details = error instanceof Error ? error.message : 'Unknown error'
      healthCheck.summary.criticalIssues++
    }

    // Test questions table
    try {
      const { data: questions, error } = await supabase
        .from('questions')
        .select('id, exam_id')
        .limit(5)
      
      if (error) {
        healthCheck.services.questions.status = 'error'
        healthCheck.services.questions.details = error.message
        healthCheck.summary.criticalIssues++
      } else {
        healthCheck.services.questions.status = 'healthy'
        healthCheck.services.questions.details = `Found ${questions?.length || 0} questions`
      }
    } catch (error) {
      healthCheck.services.questions.status = 'error'
      healthCheck.services.questions.details = error instanceof Error ? error.message : 'Unknown error'
      healthCheck.summary.criticalIssues++
    }

    // Test exam attempts table
    try {
      const { data: attempts, error } = await supabase
        .from('exam_attempts')
        .select('id, exam_id, score')
        .limit(5)
      
      if (error) {
        healthCheck.services.attempts.status = 'error'
        healthCheck.services.attempts.details = error.message
        healthCheck.summary.criticalIssues++
      } else {
        healthCheck.services.attempts.status = 'healthy'
        healthCheck.services.attempts.details = `Found ${attempts?.length || 0} attempts`
      }
    } catch (error) {
      healthCheck.services.attempts.status = 'error'
      healthCheck.services.attempts.details = error instanceof Error ? error.message : 'Unknown error'
      healthCheck.summary.criticalIssues++
    }

    // Test admin users table
    try {
      const { data: adminUsers, error } = await supabase
        .from('admin_users')
        .select('id, username')
        .limit(5)
      
      if (error) {
        healthCheck.services.admin.status = 'warning'
        healthCheck.services.admin.details = `Admin table error: ${error.message}`
        healthCheck.summary.warnings++
      } else {
        healthCheck.services.admin.status = 'healthy'
        healthCheck.services.admin.details = `Found ${adminUsers?.length || 0} admin users`
      }
    } catch (error) {
      healthCheck.services.admin.status = 'warning'
      healthCheck.services.admin.details = error instanceof Error ? error.message : 'Unknown error'
      healthCheck.summary.warnings++
    }

    // Test auth service
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        healthCheck.services.auth.status = 'warning'
        healthCheck.services.auth.details = `Auth error: ${error.message}`
        healthCheck.summary.warnings++
      } else {
        healthCheck.services.auth.status = 'healthy'
        healthCheck.services.auth.details = session ? 'Session active' : 'No active session'
      }
    } catch (error) {
      healthCheck.services.auth.status = 'warning'
      healthCheck.services.auth.details = error instanceof Error ? error.message : 'Unknown error'
      healthCheck.summary.warnings++
    }

    // Calculate total issues
    healthCheck.summary.totalIssues = healthCheck.summary.criticalIssues + healthCheck.summary.warnings

    // Set overall status
    if (healthCheck.summary.criticalIssues > 0) {
      healthCheck.status = 'critical'
    } else if (healthCheck.summary.warnings > 0) {
      healthCheck.status = 'warning'
    } else {
      healthCheck.status = 'healthy'
    }

    return NextResponse.json(healthCheck)

  } catch (error) {
    return NextResponse.json({
      ...healthCheck,
      status: 'critical',
      error: error instanceof Error ? error.message : 'Unknown system error',
      summary: {
        totalIssues: 1,
        criticalIssues: 1,
        warnings: 0
      }
    }, { status: 500 })
  }
}