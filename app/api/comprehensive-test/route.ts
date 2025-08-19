import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const results = {
    steps: [],
    errors: [],
    success: true
  };

  try {
    // Step 1: Check environment variables
    console.log('Step 1: Checking environment variables...');
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      results.errors.push('NEXT_PUBLIC_SUPABASE_URL is missing');
      results.success = false;
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      results.errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
      results.success = false;
    }
    results.steps.push('✅ Environment variables checked');

    // Step 2: Test database connection
    console.log('Step 2: Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('exams')
      .select('count(*)')
      .limit(1);

    if (connectionError) {
      results.errors.push(`Database connection failed: ${connectionError.message}`);
      results.success = false;
    } else {
      results.steps.push('✅ Database connection successful');
    }

    // Step 3: Test exam creation
    console.log('Step 3: Testing exam creation...');
    const testExamData = {
      title: 'Comprehensive Test Exam - ' + new Date().toISOString().slice(0, 19),
      description: 'Testing exam creation in comprehensive test',
      type: 'HSC',
      subject: 'Physics',
      duration: 60,
      total_marks: 10,
      instructions: 'Test instructions',
      status: 'active',
      security: {
        timeLimit: true,
        allowReview: true
      },
      created_by: 'b1c2ef6a-975f-49e5-a5d0-f42b0ecdee46'
    };

    const { data: savedExam, error: examError } = await supabase
      .from('exams')
      .insert(testExamData)
      .select()
      .single();

    if (examError) {
      results.errors.push(`Exam creation failed: ${examError.message}`);
      results.success = false;
    } else {
      results.steps.push(`✅ Exam created successfully: ${savedExam.id}`);

      // Step 4: Test question creation
      console.log('Step 4: Testing question creation...');
      const testQuestionData = {
        exam_id: savedExam.id,
        question: 'What is the unit of force?',
        options: ['Newton', 'Joule', 'Watt', 'Pascal'],
        correct_answer: 'Newton',
        marks: 2,
        difficulty: 'easy',
        explanation: 'The SI unit of force is Newton (N).',
        tags: ['physics', 'units'],
        order_index: 1
      };

      const { data: savedQuestion, error: questionError } = await supabase
        .from('questions')
        .insert(testQuestionData)
        .select()
        .single();

      if (questionError) {
        results.errors.push(`Question creation failed: ${questionError.message}`);
        results.success = false;
      } else {
        results.steps.push(`✅ Question created successfully: ${savedQuestion.id}`);
      }
    }

    // Step 5: Test admin API payload
    console.log('Step 5: Testing admin API payload format...');
    const adminPayload = {
      title: 'Test Admin Payload',
      description: 'Testing admin API payload format',
      type: 'HSC',
      subject: 'Physics',
      duration: 60,
      total_marks: 10,
      instructions: 'Test instructions',
      status: 'active',
      security: {
        timeLimit: true,
        allowReview: true
      },
      questions: [
        {
          question: 'What is the unit of force?',
          options: ['Newton', 'Joule', 'Watt', 'Pascal'],
          correctAnswer: 'Newton',
          marks: 2,
          difficulty: 'easy',
          explanation: 'The SI unit of force is Newton (N).',
          tags: ['physics', 'units']
        }
      ]
    };

    // Validate payload structure
    const requiredFields = ['title', 'type', 'subject', 'duration', 'total_marks'];
    const missingFields = requiredFields.filter(field => !adminPayload[field]);
    
    if (missingFields.length > 0) {
      results.errors.push(`Missing required fields: ${missingFields.join(', ')}`);
      results.success = false;
    } else {
      results.steps.push('✅ Admin API payload format is valid');
    }

    return NextResponse.json({
      success: results.success,
      message: results.success ? 'All tests passed!' : 'Some tests failed',
      steps: results.steps,
      errors: results.errors,
      testPayload: adminPayload
    });

  } catch (error) {
    console.error('Comprehensive test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Comprehensive test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      steps: results.steps,
      errors: [...results.errors, error instanceof Error ? error.message : 'Unknown error']
    }, { status: 500 });
  }
}