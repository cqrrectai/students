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
      currentPerformance,
      answeredQuestions,
      targetDifficulty,
      subject,
      remainingTime,
      examType,
      adaptiveMode = 'difficulty' // 'difficulty', 'knowledge_gaps', 'time_optimization'
    } = await request.json()

    const adaptiveTestingPrompt = `
You are an advanced AI testing specialist creating adaptive question selection for personalized assessment.

STUDENT CONTEXT:
- User ID: ${userId}
- Subject: ${subject}
- Exam Type: ${examType}
- Remaining Time: ${remainingTime} minutes
- Adaptive Mode: ${adaptiveMode}

CURRENT PERFORMANCE:
${JSON.stringify(currentPerformance, null, 2)}

ANSWERED QUESTIONS:
${answeredQuestions?.map((q: any, index: number) => `
Question ${index + 1}:
- Difficulty: ${q.difficulty}
- Topic: ${q.topic}
- Correct: ${q.isCorrect}
- Time Taken: ${q.timeTaken} seconds
- Confidence: ${q.confidence || 'N/A'}
`).join('\n') || 'No questions answered yet'}

TARGET DIFFICULTY: ${targetDifficulty || 'Adaptive'}

Create an adaptive testing strategy in the following JSON format:
{
  "adaptiveStrategy": {
    "currentDifficultyLevel": "easy|medium|hard",
    "recommendedNextDifficulty": "easy|medium|hard",
    "confidenceLevel": number (0-100),
    "learningEstimate": number (0-100),
    "adaptationReason": "why this difficulty is recommended",
    "performanceTrend": "improving|stable|declining",
    "optimalQuestionCount": number
  },
  "questionSelection": {
    "priorityTopics": [
      {
        "topic": "topic name",
        "priority": "high|medium|low",
        "reasoning": "why this topic is prioritized",
        "difficulty": "easy|medium|hard",
        "estimatedTime": "seconds per question",
        "knowledgeGap": number (0-100)
      }
    ],
    "avoidTopics": [
      {
        "topic": "topic name",
        "reason": "why to avoid",
        "alternativeFocus": "what to focus on instead"
      }
    ],
    "questionTypes": [
      {
        "type": "MCQ|short_answer|essay|true_false",
        "preference": "high|medium|low",
        "reasoning": "why this type is preferred"
      }
    ]
  },
  "timeManagement": {
    "recommendedPacing": "seconds per question",
    "timeAllocation": [
      {
        "difficulty": "easy|medium|hard",
        "timePercentage": number,
        "questionCount": number
      }
    ],
    "urgencyLevel": "low|medium|high",
    "timeOptimizationTips": ["tip1", "tip2"]
  },
  "knowledgeAssessment": {
    "strongAreas": [
      {
        "topic": "topic name",
        "confidence": number (0-100),
        "evidence": "what shows strength in this area"
      }
    ],
    "weakAreas": [
      {
        "topic": "topic name",
        "severity": "high|medium|low",
        "evidence": "what shows weakness",
        "improvementPotential": number (0-100)
      }
    ],
    "unknownAreas": [
      {
        "topic": "topic name",
        "explorationPriority": "high|medium|low",
        "estimatedDifficulty": "easy|medium|hard"
      }
    ]
  },
  "nextQuestions": [
    {
      "questionId": "generated_id",
      "topic": "topic name",
      "difficulty": "easy|medium|hard",
      "type": "question type",
      "estimatedTime": "seconds",
      "learningObjective": "what this question tests",
      "adaptiveReason": "why this question is selected",
      "question": "actual question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "correct option",
      "explanation": "explanation of answer",
      "tags": ["tag1", "tag2"]
    }
  ],
  "feedbackStrategy": {
    "immediateResponse": "what to tell student after each answer",
    "encouragementLevel": "high|medium|low",
    "hintStrategy": "when and how to provide hints",
    "mistakeHandling": "how to address incorrect answers",
    "confidenceBuilding": ["technique1", "technique2"]
  },
  "adaptationRules": {
    "difficultyIncrease": {
      "condition": "when to increase difficulty",
      "increment": "how much to increase",
      "maxLevel": "maximum difficulty allowed"
    },
    "difficultyDecrease": {
      "condition": "when to decrease difficulty",
      "decrement": "how much to decrease",
      "minLevel": "minimum difficulty allowed"
    },
    "topicSwitching": {
      "condition": "when to switch topics",
      "strategy": "how to select new topic"
    }
  },
  "performancePrediction": {
    "expectedFinalScore": number (0-100),
    "confidenceInterval": "score range",
    "improvementAreas": ["area1", "area2"],
    "timeToCompletion": "estimated minutes remaining",
    "successProbability": number (0-100)
  }
}

Adaptation Guidelines:
1. Increase difficulty if student answers 2-3 consecutive questions correctly
2. Decrease difficulty if student struggles with 2-3 consecutive questions
3. Focus on knowledge gaps while building confidence
4. Optimize for both learning and assessment accuracy
5. Consider time constraints and pacing
6. Provide appropriate challenge without overwhelming
7. Build on strengths while addressing weaknesses
8. Maintain engagement and motivation
9. Adapt to Bangladeshi curriculum and exam patterns
10. Consider cultural context and learning preferences
`

    const result = await generateText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      prompt: adaptiveTestingPrompt,
      temperature: 0.5,
      maxTokens: 4000,
    })

    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response")
      }

      const adaptiveStrategy = JSON.parse(jsonMatch[0])
      
      // Store adaptive testing data for learning
      const { error: saveError } = await supabase
        .from('adaptive_testing_sessions')
        .insert({
          user_id: userId,
          session_data: adaptiveStrategy,
          performance_data: currentPerformance,
          created_at: new Date().toISOString()
        })

      if (saveError) {
        console.error('Error saving adaptive session:', saveError)
      }

      return NextResponse.json(adaptiveStrategy)

    } catch (parseError) {
      console.error('Error parsing adaptive strategy:', parseError)
      
      // Fallback adaptive strategy
      const currentScore = currentPerformance?.averageScore || 70
      const questionsAnswered = answeredQuestions?.length || 0
      
      const fallbackStrategy = {
        adaptiveStrategy: {
          currentDifficultyLevel: currentScore > 80 ? "hard" : currentScore > 60 ? "medium" : "easy",
          recommendedNextDifficulty: currentScore > 75 ? "hard" : currentScore > 50 ? "medium" : "easy",
          confidenceLevel: Math.min(95, Math.max(30, currentScore + 10)),
          learningEstimate: currentScore,
          adaptationReason: "Based on current performance level",
          performanceTrend: "stable",
          optimalQuestionCount: Math.max(5, 20 - questionsAnswered)
        },
        questionSelection: {
          priorityTopics: [
            {
              topic: subject || "General",
              priority: "high",
              reasoning: "Core subject focus",
              difficulty: currentScore > 70 ? "medium" : "easy",
              estimatedTime: "60 seconds",
              knowledgeGap: Math.max(0, 100 - currentScore)
            }
          ],
          avoidTopics: [],
          questionTypes: [
            {
              type: "MCQ",
              preference: "high",
              reasoning: "Efficient for adaptive testing"
            }
          ]
        },
        timeManagement: {
          recommendedPacing: "90 seconds per question",
          timeAllocation: [
            {
              difficulty: "easy",
              timePercentage: 30,
              questionCount: 3
            },
            {
              difficulty: "medium",
              timePercentage: 50,
              questionCount: 5
            },
            {
              difficulty: "hard",
              timePercentage: 20,
              questionCount: 2
            }
          ],
          urgencyLevel: remainingTime < 10 ? "high" : remainingTime < 30 ? "medium" : "low",
          timeOptimizationTips: ["Read questions carefully", "Eliminate wrong options first"]
        },
        knowledgeAssessment: {
          strongAreas: [],
          weakAreas: [],
          unknownAreas: []
        },
        nextQuestions: [],
        feedbackStrategy: {
          immediateResponse: "Good effort! Let's continue.",
          encouragementLevel: "medium",
          hintStrategy: "Provide hints after incorrect answers",
          mistakeHandling: "Explain correct answer and provide similar practice",
          confidenceBuilding: ["Positive reinforcement", "Progress tracking"]
        },
        adaptationRules: {
          difficultyIncrease: {
            condition: "3 consecutive correct answers",
            increment: "one level",
            maxLevel: "hard"
          },
          difficultyDecrease: {
            condition: "2 consecutive incorrect answers",
            decrement: "one level",
            minLevel: "easy"
          },
          topicSwitching: {
            condition: "After 3 questions in same topic",
            strategy: "Switch to identified weak area"
          }
        },
        performancePrediction: {
          expectedFinalScore: currentScore,
          confidenceInterval: `${currentScore - 10} - ${currentScore + 10}`,
          improvementAreas: ["Time management", "Concept clarity"],
          timeToCompletion: `${remainingTime || 30} minutes`,
          successProbability: Math.min(95, Math.max(20, currentScore))
        }
      }
      
      return NextResponse.json(fallbackStrategy)
    }

  } catch (error) {
    console.error('Error creating adaptive testing strategy:', error)
    return NextResponse.json({ error: 'Failed to create adaptive testing strategy' }, { status: 500 })
  }
}