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
      studentData,
      examHistory,
      studyPatterns,
      targetExam,
      timeframe
    } = await request.json()

    const predictiveAnalysisPrompt = `
You are an advanced AI educational data scientist specializing in predictive analytics for student performance.

STUDENT DATA:
${JSON.stringify(studentData, null, 2)}

EXAM HISTORY:
${examHistory?.map((exam: any) => `
- Date: ${exam.date}
- Subject: ${exam.subject}
- Score: ${exam.score}/${exam.totalMarks} (${exam.percentage}%)
- Time Taken: ${exam.timeTaken} minutes
- Difficulty: ${exam.difficulty}
- Topics Covered: ${exam.topics?.join(', ') || 'N/A'}
`).join('\n') || 'No exam history available'}

STUDY PATTERNS:
- Average Study Time: ${studyPatterns?.avgStudyTime || 'N/A'} hours/week
- Consistency Score: ${studyPatterns?.consistency || 'N/A'}%
- Preferred Study Times: ${studyPatterns?.preferredTimes?.join(', ') || 'N/A'}
- Break Patterns: ${studyPatterns?.breakPatterns || 'N/A'}

TARGET EXAM: ${targetExam || 'General Assessment'}
PREDICTION TIMEFRAME: ${timeframe || '1 month'}

Provide comprehensive predictive analytics in the following JSON format:
{
  "performancePrediction": {
    "predictedScore": number (0-100),
    "confidenceLevel": number (0-100),
    "scoreRange": {
      "minimum": number,
      "maximum": number,
      "mostLikely": number
    },
    "improvementPotential": number (0-100),
    "riskFactors": ["factor1", "factor2"],
    "successFactors": ["factor1", "factor2"]
  },
  "learningCurveAnalysis": {
    "currentTrend": "improving|declining|stable",
    "learningRate": number (concepts per week),
    "retentionRate": number (0-100),
    "plateauRisk": "high|medium|low",
    "breakthroughProbability": number (0-100),
    "optimalStudyDuration": "hours per day"
  },
  "subjectWisePredictions": [
    {
      "subject": "subject name",
      "currentLevel": "beginner|intermediate|advanced",
      "predictedImprovement": number (percentage points),
      "timeToMastery": "weeks/months",
      "difficultyAreas": ["area1", "area2"],
      "strengthAreas": ["area1", "area2"],
      "recommendedFocus": number (hours per week)
    }
  ],
  "timeBasedForecasts": {
    "oneWeek": {
      "expectedProgress": "percentage",
      "keyMilestones": ["milestone1", "milestone2"],
      "riskAreas": ["risk1", "risk2"]
    },
    "oneMonth": {
      "expectedScore": number,
      "skillDevelopment": ["skill1", "skill2"],
      "challengeAreas": ["challenge1", "challenge2"]
    },
    "threeMonths": {
      "masteryLevel": "beginner|intermediate|advanced",
      "readinessScore": number (0-100),
      "recommendedActions": ["action1", "action2"]
    }
  },
  "riskAssessment": {
    "burnoutRisk": "high|medium|low",
    "motivationTrend": "increasing|stable|decreasing",
    "consistencyRisk": "high|medium|low",
    "timeManagementRisk": "high|medium|low",
    "mitigationStrategies": ["strategy1", "strategy2"]
  },
  "optimizationRecommendations": {
    "studyScheduleAdjustments": ["adjustment1", "adjustment2"],
    "focusAreaPriorities": ["priority1", "priority2"],
    "learningMethodChanges": ["change1", "change2"],
    "resourceRecommendations": ["resource1", "resource2"],
    "practiceIntensity": "increase|maintain|decrease"
  },
  "comparativeAnalysis": {
    "peerComparison": {
      "percentile": number (0-100),
      "averageImprovement": number,
      "topPerformerGap": number
    },
    "historicalComparison": {
      "improvementRate": "faster|similar|slower than average",
      "consistencyRating": "high|medium|low",
      "effortEfficiency": number (0-100)
    }
  }
}

Base predictions on:
1. Learning curve patterns
2. Consistency in performance
3. Time investment vs results
4. Subject-specific trends
5. Bangladeshi education context
6. Seasonal factors (exam seasons, holidays)
7. Cognitive load and retention patterns
`

    const result = await generateText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      prompt: predictiveAnalysisPrompt,
      temperature: 0.3,
      maxTokens: 4000,
    })

    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response")
      }

      const predictions = JSON.parse(jsonMatch[0])
      
      // Store predictions in database for tracking accuracy
      const { error: saveError } = await supabase
        .from('performance_predictions')
        .insert({
          user_id: session.user.id,
          prediction_data: predictions,
          target_exam: targetExam,
          prediction_date: new Date().toISOString(),
          timeframe: timeframe
        })

      if (saveError) {
        console.error('Error saving predictions:', saveError)
      }

      return NextResponse.json(predictions)

    } catch (parseError) {
      console.error('Error parsing predictions:', parseError)
      
      // Fallback predictions based on simple heuristics
      const avgScore = examHistory?.reduce((sum: number, exam: any) => sum + exam.percentage, 0) / (examHistory?.length || 1) || 70
      const trend = examHistory?.length > 1 ? 
        (examHistory[examHistory.length - 1].percentage - examHistory[0].percentage) / examHistory.length : 0
      
      const fallbackPredictions = {
        performancePrediction: {
          predictedScore: Math.min(100, Math.max(0, avgScore + trend * 2)),
          confidenceLevel: 75,
          scoreRange: {
            minimum: Math.max(0, avgScore - 15),
            maximum: Math.min(100, avgScore + 15),
            mostLikely: avgScore
          },
          improvementPotential: Math.max(0, 100 - avgScore),
          riskFactors: ["Time management", "Consistency"],
          successFactors: ["Regular practice", "Focused study"]
        },
        learningCurveAnalysis: {
          currentTrend: trend > 0 ? "improving" : trend < 0 ? "declining" : "stable",
          learningRate: 3,
          retentionRate: 80,
          plateauRisk: "medium",
          breakthroughProbability: 70,
          optimalStudyDuration: "2-3 hours"
        },
        subjectWisePredictions: [],
        timeBasedForecasts: {
          oneWeek: {
            expectedProgress: "5-10%",
            keyMilestones: ["Complete current topics", "Practice tests"],
            riskAreas: ["Time management"]
          },
          oneMonth: {
            expectedScore: Math.min(100, avgScore + 10),
            skillDevelopment: ["Problem solving", "Speed"],
            challengeAreas: ["Complex topics"]
          },
          threeMonths: {
            masteryLevel: "intermediate",
            readinessScore: 80,
            recommendedActions: ["Intensive practice", "Mock exams"]
          }
        },
        riskAssessment: {
          burnoutRisk: "medium",
          motivationTrend: "stable",
          consistencyRisk: "medium",
          timeManagementRisk: "medium",
          mitigationStrategies: ["Regular breaks", "Varied study methods"]
        },
        optimizationRecommendations: {
          studyScheduleAdjustments: ["Consistent daily schedule", "Peak hour utilization"],
          focusAreaPriorities: ["Weak areas first", "Regular review"],
          learningMethodChanges: ["Active recall", "Practice tests"],
          resourceRecommendations: ["Quality materials", "Online resources"],
          practiceIntensity: "maintain"
        },
        comparativeAnalysis: {
          peerComparison: {
            percentile: Math.min(95, Math.max(5, avgScore)),
            averageImprovement: 15,
            topPerformerGap: Math.max(0, 95 - avgScore)
          },
          historicalComparison: {
            improvementRate: "similar",
            consistencyRating: "medium",
            effortEfficiency: 75
          }
        }
      }
      
      return NextResponse.json(fallbackPredictions)
    }

  } catch (error) {
    console.error('Error generating predictive analytics:', error)
    return NextResponse.json({ error: 'Failed to generate predictive analytics' }, { status: 500 })
  }
}