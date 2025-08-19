import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication via cookies (since admin uses separate auth system)
    const cookieStore = cookies();
    const adminUserCookie = cookieStore.get('adminUser');
    
    if (!adminUserCookie) {
      return NextResponse.json({
        success: false,
        error: 'Admin authentication required',
        details: 'Please log in as admin to create exams'
      }, { status: 401 });
    }

    let adminUser;
    try {
      adminUser = JSON.parse(adminUserCookie.value);
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: 'Invalid admin session',
        details: 'Please log in again'
      }, { status: 401 });
    }

    console.log('Admin user authenticated:', adminUser.username);

    // Create Supabase client for admin operations
    const supabase = createRouteHandlerClient({ cookies });

    const body = await request.json();
    
    // Validate required fields
    const { title, description, type, subject, duration, total_marks, instructions, status, security, questions } = body;
    
    if (!title || !type || !subject || !duration || total_marks === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        details: 'title, type, subject, duration, and total_marks are required'
      }, { status: 400 });
    }

    // Validate type constraint
    const validTypes = ['HSC', 'SSC', 'University', 'Job'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid exam type',
        details: `Type must be one of: ${validTypes.join(', ')}`
      }, { status: 400 });
    }

    console.log('Creating exam with data:', {
      title,
      type,
      subject,
      duration,
      total_marks,
      status
    });

    // Get admin profile from database to ensure proper user association
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    let createdBy = null;
    if (!adminError && adminProfile) {
      createdBy = adminProfile.id;
    } else {
      console.warn('Could not find admin profile, creating exam without user association');
    }

    // Create exam using proper admin user
    const { data: savedExam, error: examError } = await supabase
      .from('exams')
      .insert({
        title,
        description,
        type,
        subject,
        duration,
        total_marks,
        instructions,
        status: status || 'draft',
        security: security || {},
        created_by: createdBy,
        exam_type: 'admin'
      })
      .select()
      .single();

    if (examError) {
      console.error('Exam creation error:', examError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create exam',
        details: examError.message
      }, { status: 500 });
    }

    console.log('Exam created successfully:', savedExam.id);

    // Create questions if provided
    const questionResults = [];
    if (questions && Array.isArray(questions) && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        const { data: savedQuestion, error: questionError } = await supabase
          .from('questions')
          .insert({
            exam_id: savedExam.id,
            question: question.question,
            options: question.options,
            correct_answer: question.correctAnswer,
            marks: question.marks || 1,
            difficulty: question.difficulty || 'medium',
            explanation: question.explanation || null,
            tags: question.tags || null,
            order_index: i + 1
          })
          .select()
          .single();

        if (questionError) {
          console.error(`Question ${i + 1} creation error:`, questionError);
          questionResults.push({
            index: i + 1,
            success: false,
            error: questionError.message
          });
        } else {
          questionResults.push({
            index: i + 1,
            success: true,
            id: savedQuestion.id
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Exam created successfully',
      exam: {
        id: savedExam.id,
        title: savedExam.title,
        status: savedExam.status,
        created_at: savedExam.created_at
      },
      questions: questionResults,
      questionsCreated: questionResults.filter(q => q.success).length,
      questionsFailed: questionResults.filter(q => !q.success).length
    });

  } catch (error) {
    console.error('Admin create exam API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}