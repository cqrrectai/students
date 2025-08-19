import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set in environment variables")
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      userId, 
      examHistory, 
      learningPreferences, 
      performanceData,
      targetSubjects,
      timeAvailable 
    } = await request.json()

    const adaptiveLearningPrompt = `
You are an advanced AI learning specialist creating personalized learning paths for Bangladeshi students.

STUDENT PROFILE:
- User ID: ${userId}
- Target Subjects: ${targetSubjects?.join(', ') || 'General'}
- Available Study Time: ${timeAvailable || 'Not specified'} hours per week

EXAM HISTORY:
${examHistory?.map((exam: any) => `
- Subject: ${exam.subject}
- Score: ${exam.score}/${exam.totalMarks} (${exam.percentage}%)
- Difficulty Areas: ${exam.weakAreas?.join(', ') || 'None identified'}
- Time Taken: ${exam.timeTaken} minutes
- Date: ${exam.date}
`).join('\n') || 'No exam history available'}

LEARNING PREFERENCES:
- Learning Style: ${learningPreferences?.style || 'Not specified'}
- Preferred Time: ${learningPreferences?.preferredTime || 'Not specified'}
- Difficulty Preference: ${learningPreferences?.difficulty || 'Medium'}

PERFORMANCE DATA:
${performanceData ? JSON.stringify(performanceData, null, 2) : 'No performance data available'}

Create a comprehensive adaptive learning plan in the following JSON format:
{
  "learningProfile": {
    "detectedLearningStyle": "visual|auditory|kinesthetic|mixed",
    "strengthAreas": ["area1", "area2"],
    "weaknessAreas": ["area1", "area2"],
    "learningPace": "fast|medium|slow",
    "retentionRate": number (0-100),
    "motivationLevel": "high|medium|low"
  },
  "adaptivePath": {
    "currentLevel": "beginner|intermediate|advanced",
    "recommendedDifficulty": "easy|medium|hard|adaptive",
    "focusAreas": [
      {
        "subject": "subject name",
        "priority": "high|medium|low",
        "estimatedTime": "hours needed",
        "concepts": ["concept1", "concept2"],
        "reasoning": "why this is important"
      }
    ]
  },
  "personalizedSchedule": {
    "weeklyPlan": [
      {
        "day": "Monday",
        "sessions": [
          {
            "time": "morning|afternoon|evening",
            "subject": "subject",
            "duration": "minutes",
            "type": "study|practice|review",
            "topics": ["topic1", "topic2"]
          }
        ]
      }
    ],
    "studyTechniques": ["technique1", "technique2"],
    "breakIntervals": "recommended break pattern"
  },
  "knowledgeGaps": [
    {
      "subject": "subject",
      "concept": "specific concept",
      "severity": "high|medium|low",
      "prerequisite": "what to learn first",
      "resources": ["resource1", "resource2"]
    }
  ],
  "recommendations": {
    "immediate": ["action1", "action2"],
    "shortTerm": ["goal1", "goal2"],
    "longTerm": ["objective1", "objective2"],
    "studyMethods": ["method1", "method2"],
    "practiceTypes": ["type1", "type2"]
  },
  "progressTracking": {
    "milestones": [
      {
        "goal": "specific goal",
        "timeframe": "weeks",
        "metrics": ["metric1", "metric2"]
      }
    ],
    "reviewSchedule": "spaced repetition pattern"
  }
}

Focus on:
1. Bangladeshi curriculum alignment
2. Cultural context and local examples
3. Practical study strategies
4. Realistic time management
5. Motivation and engagement techniques
`

    const result = await generateText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      prompt: adaptiveLearningPrompt,
      temperature: 0.4,
      maxTokens: 4000,
    })

    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response")
      }

      const adaptivePlan = JSON.parse(jsonMatch[0])
      
      // Store the learning plan in the database for future reference
      const { error: saveError } = await supabase
        .from('learning_plans')
        .upsert({
          user_id: userId,
          plan_data: adaptivePlan,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (saveError) {
        console.error('Error saving learning plan:', saveError)
      }

      return NextResponse.json(adaptivePlan)

    } catch (parseError) {
      console.error('Error parsing adaptive learning plan:', parseError)
      
      // Fallback adaptive plan
      const fallbackPlan = {
        learningProfile: {
          detectedLearningStyle: "mixed",
          strengthAreas: ["Basic concepts", "Problem solving"],
          weaknessAreas: ["Time management", "Complex topics"],
          learningPace: "medium",
          retentionRate: 75,
          motivationLevel: "medium"
        },
        adaptivePath: {
          currentLevel: "intermediate",
          recommendedDifficulty: "medium",
          focusAreas: [
            {
              subject: targetSubjects?.[0] || "Mathematics",
              priority: "high",
              estimatedTime: "5 hours/week",
              concepts: ["Fundamentals", "Practice problems"],
              reasoning: "Foundation building required"
            }
          ]
        },
        personalizedSchedule: {
          weeklyPlan: [
            {
              day: "Monday",
              sessions: [
                {
                  time: "evening",
                  subject: targetSubjects?.[0] || "Mathematics",
                  duration: "60 minutes",
                  type: "study",
                  topics: ["Review basics", "Practice problems"]
                }
              ]
            }
          ],
          studyTechniques: ["Active recall", "Spaced repetition"],
          breakIntervals: "25 minutes study, 5 minutes break"
        },
        knowledgeGaps: [],
        recommendations: {
          immediate: ["Start with fundamentals", "Create study schedule"],
          shortTerm: ["Complete practice tests", "Track progress"],
          longTerm: ["Master advanced concepts", "Achieve target scores"],
          studyMethods: ["Visual aids", "Practice tests"],
          practiceTypes: ["MCQ practice", "Timed tests"]
        },
        progressTracking: {
          milestones: [
            {
              goal: "Complete foundation topics",
              timeframe: "2 weeks",
              metrics: ["Completion rate", "Test scores"]
            }
          ],
          reviewSchedule: "Review after 1 day, 3 days, 1 week, 2 weeks"
        }
      }
      
      return NextResponse.json(fallbackPlan)
    }

  } catch (error) {
    console.error('Error creating adaptive learning plan:', error)
    return NextResponse.json({ error: 'Failed to create adaptive learning plan' }, { status: 500 })
  }
}