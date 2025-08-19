import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')
        const subject = searchParams.get('subject')
        const status = searchParams.get('status')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = (page - 1) * limit

        // Build base query
        let query = supabase
            .from('exams')
            .select('*')
            .order('created_at', { ascending: false })

        // Apply filters
        if (type && type !== 'all') {
            query = query.eq('type', type)
        }
        if (subject && subject !== 'all') {
            query = query.eq('subject', subject)
        }
        if (status && status !== 'all') {
            query = query.eq('status', status)
        }

        // Get paginated results
        const { data: exams, error, count } = await query
            .range(offset, offset + limit - 1)

        if (error) {
            console.error('Error fetching exams:', error)
            return NextResponse.json({ error: 'Failed to fetch exams', details: error.message }, { status: 500 })
        }

        // Get question counts for each exam
        const examIds = (exams || []).map(exam => exam.id)
        let questionCounts: Record<string, number> = {}
        let attemptCounts: Record<string, number> = {}

        if (examIds.length > 0) {
            // Get question counts
            const { data: questionData } = await supabase
                .from('questions')
                .select('exam_id')
                .in('exam_id', examIds)

            if (questionData) {
                questionCounts = questionData.reduce((acc, q) => {
                    if (q.exam_id) {
                        acc[q.exam_id] = (acc[q.exam_id] || 0) + 1
                    }
                    return acc
                }, {} as Record<string, number>)
            }

            // Get attempt counts
            const { data: attemptData } = await supabase
                .from('exam_attempts')
                .select('exam_id')
                .in('exam_id', examIds)

            if (attemptData) {
                attemptCounts = attemptData.reduce((acc, a) => {
                    if (a.exam_id) {
                        acc[a.exam_id] = (acc[a.exam_id] || 0) + 1
                    }
                    return acc
                }, {} as Record<string, number>)
            }
        }

        // Enrich exams with counts
        const enrichedExams = (exams || []).map(exam => ({
            ...exam,
            question_count: questionCounts[exam.id] || 0,
            attempt_count: attemptCounts[exam.id] || 0
        }))

        return NextResponse.json({
            success: true,
            data: enrichedExams,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        })
    } catch (error) {
        console.error('Admin exams API error:', error)
        return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            title,
            description,
            type,
            subject,
            duration,
            total_marks,
            instructions,
            status = 'draft',
            security,
            questions = []
        } = body

        // Validate required fields
        if (!title || !type || !subject || !duration || !total_marks) {
            return NextResponse.json({
                error: 'Missing required fields: title, type, subject, duration, total_marks'
            }, { status: 400 })
        }

        // Determine exam type based on context or default to admin
        const examType = body.exam_type || 'admin'

        // Create exam
        const { data: exam, error: examError } = await supabase
            .from('exams')
            .insert({
                title,
                description,
                type,
                subject,
                duration,
                total_marks,
                instructions,
                status,
                exam_type: examType,
                created_by: body.created_by || null, // Allow setting created_by for student exams
                security: security || {
                    timeLimit: true,
                    allowReview: true,
                    maxAttempts: 3,
                    showResults: true,
                    passingScore: 60,
                    fullScreenMode: false,
                    preventCopyPaste: true,
                    randomizeOptions: false,
                    randomizeQuestions: false
                }
            })
            .select()
            .single()

        if (examError) {
            console.error('Error creating exam:', examError)
            return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 })
        }

        // Create questions if provided
        let questionsCreated = 0
        if (questions.length > 0) {
            const questionsData = questions.map((q: any, index: number) => ({
                exam_id: exam.id,
                question: q.question,
                options: q.options,
                correct_answer: q.correctAnswer,
                marks: q.marks || 1,
                difficulty: q.difficulty || 'medium',
                explanation: q.explanation,
                tags: q.tags,
                order_index: index + 1
            }))

            const { data: createdQuestions, error: questionsError } = await supabase
                .from('questions')
                .insert(questionsData)
                .select()

            if (questionsError) {
                console.error('Error creating questions:', questionsError)
                // Don't fail the entire request, just log the error
            } else {
                questionsCreated = createdQuestions?.length || 0
            }
        }

        return NextResponse.json({
            success: true,
            exam,
            questionsCreated,
            message: `Exam "${title}" created successfully with ${questionsCreated} questions`
        })
    } catch (error) {
        console.error('Admin create exam API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}