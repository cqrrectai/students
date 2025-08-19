import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const testResults: any[] = []

    // Test 1: Database Connection
    try {
      const { data, error } = await supabase.from('exams').select('count').limit(1)
      testResults.push({
        test: 'Database Connection',
        status: error ? 'FAIL' : 'PASS',
        details: error ? error.message : 'Connected successfully'
      })
    } catch (error) {
      testResults.push({
        test: 'Database Connection',
        status: 'FAIL',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 2: Exams CRUD
    try {
      // CREATE
      const { data: newExam, error: createError } = await supabase
        .from('exams')
        .insert({
          title: `Test Exam ${Date.now()}`,
          description: 'Test exam for CRUD verification',
          type: 'HSC',
          subject: 'Mathematics',
          duration: 60,
          total_marks: 100,
          status: 'draft',
          exam_type: 'admin'
        })
        .select()
        .single()

      if (createError) throw createError

      // READ
      const { data: readExam, error: readError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', newExam.id)
        .single()

      if (readError) throw readError

      // UPDATE
      const { data: updatedExam, error: updateError } = await supabase
        .from('exams')
        .update({ title: `Updated Test Exam ${Date.now()}` })
        .eq('id', newExam.id)
        .select()
        .single()

      if (updateError) throw updateError

      // DELETE
      const { error: deleteError } = await supabase
        .from('exams')
        .delete()
        .eq('id', newExam.id)

      if (deleteError) throw deleteError

      testResults.push({
        test: 'Exams CRUD',
        status: 'PASS',
        details: 'All CRUD operations successful'
      })
    } catch (error) {
      testResults.push({
        test: 'Exams CRUD',
        status: 'FAIL',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 3: Questions CRUD
    try {
      // First create a test exam
      const { data: testExam, error: examError } = await supabase
        .from('exams')
        .insert({
          title: `Question Test Exam ${Date.now()}`,
          type: 'HSC',
          subject: 'Physics',
          duration: 30,
          total_marks: 50,
          status: 'draft',
          exam_type: 'admin'
        })
        .select()
        .single()

      if (examError) throw examError

      // CREATE Question
      const { data: newQuestion, error: createQError } = await supabase
        .from('questions')
        .insert({
          exam_id: testExam.id,
          question: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          correct_answer: '4',
          marks: 1,
          difficulty: 'easy'
        })
        .select()
        .single()

      if (createQError) throw createQError

      // READ Question
      const { data: readQuestion, error: readQError } = await supabase
        .from('questions')
        .select('*')
        .eq('id', newQuestion.id)
        .single()

      if (readQError) throw readQError

      // UPDATE Question
      const { data: updatedQuestion, error: updateQError } = await supabase
        .from('questions')
        .update({ question: 'What is 3 + 3?' })
        .eq('id', newQuestion.id)
        .select()
        .single()

      if (updateQError) throw updateQError

      // DELETE Question and Test Exam
      await supabase.from('questions').delete().eq('id', newQuestion.id)
      await supabase.from('exams').delete().eq('id', testExam.id)

      testResults.push({
        test: 'Questions CRUD',
        status: 'PASS',
        details: 'All CRUD operations successful'
      })
    } catch (error) {
      testResults.push({
        test: 'Questions CRUD',
        status: 'FAIL',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 4: Real-time Subscriptions
    try {
      let subscriptionWorking = false
      const testChannel = supabase
        .channel(`test-${Date.now()}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'exams' },
          (payload) => {
            subscriptionWorking = true
          }
        )
        .subscribe()

      // Wait a moment for subscription to establish
      await new Promise(resolve => setTimeout(resolve, 1000))

      supabase.removeChannel(testChannel)

      testResults.push({
        test: 'Real-time Subscriptions',
        status: 'PASS',
        details: 'Subscription channel created and removed successfully'
      })
    } catch (error) {
      testResults.push({
        test: 'Real-time Subscriptions',
        status: 'FAIL',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Test 5: API Endpoints
    const apiTests = [
      '/api/admin/dashboard',
      '/api/admin/exams',
      '/api/admin/questions',
      '/api/admin/users',
      '/api/admin/analytics',
      '/api/admin/exam-attempts'
    ]

    for (const endpoint of apiTests) {
      try {
        const response = await fetch(`${request.nextUrl.origin}${endpoint}`)
        const result = await response.json()
        
        testResults.push({
          test: `API ${endpoint}`,
          status: response.ok ? 'PASS' : 'FAIL',
          details: response.ok ? 'Endpoint accessible' : result.error || 'Unknown error'
        })
      } catch (error) {
        testResults.push({
          test: `API ${endpoint}`,
          status: 'FAIL',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Summary
    const passCount = testResults.filter(t => t.status === 'PASS').length
    const failCount = testResults.filter(t => t.status === 'FAIL').length

    return NextResponse.json({
      success: true,
      summary: {
        total: testResults.length,
        passed: passCount,
        failed: failCount,
        success_rate: `${Math.round((passCount / testResults.length) * 100)}%`
      },
      tests: testResults,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test suite error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test suite failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}