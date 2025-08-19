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
      userProfile,
      studyProgress,
      upcomingExams,
      learningGoals,
      notificationType = 'all' // 'study_reminder', 'progress_update', 'motivation', 'exam_alert', 'all'
    } = await request.json()

    const smartNotificationPrompt = `
You are an AI learning companion that creates personalized, motivating, and timely notifications for Bangladeshi students.

USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

STUDY PROGRESS:
${JSON.stringify(studyProgress, null, 2)}

UPCOMING EXAMS:
${upcomingExams?.map((exam: any) => `
- Exam: ${exam.title}
- Subject: ${exam.subject}
- Date: ${exam.date}
- Preparation Status: ${exam.preparationStatus}%
`).join('\n') || 'No upcoming exams'}

LEARNING GOALS:
${learningGoals?.map((goal: any) => `
- Goal: ${goal.title}
- Target Date: ${goal.targetDate}
- Progress: ${goal.progress}%
- Priority: ${goal.priority}
`).join('\n') || 'No specific goals set'}

NOTIFICATION TYPE: ${notificationType}

Create personalized smart notifications in the following JSON format:
{
  "notifications": [
    {
      "id": "unique_id",
      "type": "study_reminder|progress_update|motivation|exam_alert|achievement|tip",
      "priority": "high|medium|low",
      "title": "notification title",
      "message": "detailed message",
      "actionText": "action button text",
      "actionUrl": "relevant url or action",
      "scheduledTime": "optimal time to send",
      "personalizedElements": ["element1", "element2"],
      "culturalContext": "bangladeshi context if applicable",
      "motivationalTone": "encouraging|urgent|celebratory|supportive"
    }
  ],
  "studyReminders": [
    {
      "subject": "subject name",
      "message": "personalized reminder",
      "optimalTime": "best time to study this subject",
      "duration": "recommended study duration",
      "technique": "suggested study method",
      "motivation": "encouraging message"
    }
  ],
  "progressUpdates": [
    {
      "achievement": "what was accomplished",
      "improvement": "areas of improvement",
      "nextSteps": "what to do next",
      "encouragement": "motivational message",
      "milestone": "upcoming milestone"
    }
  ],
  "examAlerts": [
    {
      "examName": "exam name",
      "daysRemaining": number,
      "preparationStatus": "behind|on_track|ahead",
      "urgentActions": ["action1", "action2"],
      "confidenceBooster": "encouraging message",
      "lastMinuteTips": ["tip1", "tip2"]
    }
  ],
  "motivationalMessages": [
    {
      "context": "when to show this message",
      "message": "inspiring message",
      "culturalReference": "bangladeshi context if applicable",
      "personalTouch": "personalized element",
      "actionInspired": "what action this should inspire"
    }
  ],
  "smartTips": [
    {
      "category": "study_technique|time_management|exam_strategy|health",
      "tip": "practical tip",
      "reasoning": "why this tip is relevant now",
      "implementation": "how to implement",
      "expectedBenefit": "what improvement to expect"
    }
  ]
}

Guidelines:
1. Use encouraging, supportive tone appropriate for Bangladeshi students
2. Include cultural references and local context when relevant
3. Personalize based on user's progress and preferences
4. Provide actionable advice and clear next steps
5. Balance motivation with practical guidance
6. Consider optimal timing for different types of notifications
7. Use Bengali phrases or references when culturally appropriate
8. Focus on building confidence and maintaining momentum
`

    const result = await generateText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      prompt: smartNotificationPrompt,
      temperature: 0.6,
      maxTokens: 3000,
    })

    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response")
      }

      const smartNotifications = JSON.parse(jsonMatch[0])
      
      // Store notifications for scheduling
      for (const notification of smartNotifications.notifications || []) {
        const { error: saveError } = await supabase
          .from('smart_notifications')
          .insert({
            user_id: userId,
            notification_type: notification.type,
            title: notification.title,
            message: notification.message,
            action_text: notification.actionText,
            action_url: notification.actionUrl,
            scheduled_time: notification.scheduledTime,
            priority: notification.priority,
            created_at: new Date().toISOString(),
            is_sent: false
          })

        if (saveError) {
          console.error('Error saving notification:', saveError)
        }
      }

      return NextResponse.json(smartNotifications)

    } catch (parseError) {
      console.error('Error parsing smart notifications:', parseError)
      
      // Fallback notifications
      const fallbackNotifications = {
        notifications: [
          {
            id: `notif_${Date.now()}`,
            type: "study_reminder",
            priority: "medium",
            title: "Time to Study! 📚",
            message: "Your consistent effort is paying off! Ready for today's study session?",
            actionText: "Start Studying",
            actionUrl: "/dashboard",
            scheduledTime: "evening",
            personalizedElements: ["Consistent effort recognition"],
            culturalContext: "Encouraging tone for Bangladeshi students",
            motivationalTone: "encouraging"
          }
        ],
        studyReminders: [
          {
            subject: userProfile?.favoriteSubject || "Mathematics",
            message: "Time to practice some problems and strengthen your foundation!",
            optimalTime: "evening",
            duration: "45 minutes",
            technique: "Practice problems with timer",
            motivation: "Every problem you solve makes you stronger! 💪"
          }
        ],
        progressUpdates: [
          {
            achievement: "Completed daily study goal",
            improvement: "Consistency in study schedule",
            nextSteps: "Focus on weak areas identified",
            encouragement: "You're making excellent progress! Keep it up!",
            milestone: "Weekly assessment coming up"
          }
        ],
        examAlerts: [],
        motivationalMessages: [
          {
            context: "Before study session",
            message: "Success is the sum of small efforts repeated day in and day out. You've got this!",
            culturalReference: "Like the determination of our Language Movement heroes",
            personalTouch: "Your dedication reminds us of great achievers",
            actionInspired: "Start today's study with confidence"
          }
        ],
        smartTips: [
          {
            category: "study_technique",
            tip: "Use the Pomodoro Technique: 25 minutes focused study, 5 minutes break",
            reasoning: "Helps maintain concentration and prevents burnout",
            implementation: "Set a timer and stick to the schedule",
            expectedBenefit: "Improved focus and retention"
          }
        ]
      }
      
      return NextResponse.json(fallbackNotifications)
    }

  } catch (error) {
    console.error('Error generating smart notifications:', error)
    return NextResponse.json({ error: 'Failed to generate smart notifications' }, { status: 500 })
  }
}