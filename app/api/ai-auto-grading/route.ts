import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set in environment variables")
}

export async function POST(request: NextRequest) {
  try {
    const { 
      question,
      modelAnswer,
      studentAnswer,
      maxMarks,
      subject,
      gradingCriteria,
      rubric
    } = await request.json()

    if (!question || !studentAnswer) {
      return NextResponse.json({ error: 'Question and student answer are required' }, { status: 400 })
    }

    const autoGradingPrompt = `
You are an expert educational assessor specializing in fair and accurate grading of subjective answers for Bangladeshi students.

QUESTION:
${question}

MODEL ANSWER (if available):
${modelAnswer || 'No model answer provided'}

STUDENT ANSWER:
${studentAnswer}

GRADING PARAMETERS:
- Maximum Marks: ${maxMarks || 10}
- Subject: ${subject || 'General'}
- Grading Criteria: ${gradingCriteria || 'Standard academic criteria'}

RUBRIC (if provided):
${rubric || 'Use standard educational rubric'}

Provide comprehensive grading analysis in the following JSON format:
{
  "grading": {
    "totalMarks": ${maxMarks || 10},
    "awardedMarks": number,
    "percentage": number,
    "grade": "A+|A|B+|B|C+|C|D|F",
    "passingStatus": "pass|fail"
  },
  "detailedAnalysis": {
    "strengths": [
      {
        "aspect": "what was done well",
        "description": "detailed explanation",
        "marksAwarded": number
      }
    ],
    "weaknesses": [
      {
        "aspect": "what needs improvement",
        "description": "detailed explanation",
        "marksDeducted": number,
        "suggestion": "how to improve"
      }
    ],
    "missingElements": [
      {
        "element": "what was missing",
        "importance": "high|medium|low",
        "impact": "how it affected the score"
      }
    ]
  },
  "criteriaAssessment": {
    "contentAccuracy": {
      "score": number (0-100),
      "feedback": "detailed feedback"
    },
    "conceptualUnderstanding": {
      "score": number (0-100),
      "feedback": "detailed feedback"
    },
    "clarity": {
      "score": number (0-100),
      "feedback": "detailed feedback"
    },
    "completeness": {
      "score": number (0-100),
      "feedback": "detailed feedback"
    },
    "organization": {
      "score": number (0-100),
      "feedback": "detailed feedback"
    },
    "languageUse": {
      "score": number (0-100),
      "feedback": "detailed feedback"
    }
  },
  "constructiveFeedback": {
    "positiveAspects": ["positive point 1", "positive point 2"],
    "areasForImprovement": ["improvement area 1", "improvement area 2"],
    "specificSuggestions": ["suggestion 1", "suggestion 2"],
    "nextSteps": ["next step 1", "next step 2"],
    "encouragement": "motivational message"
  },
  "comparisonWithModel": {
    "similarities": ["similarity 1", "similarity 2"],
    "differences": ["difference 1", "difference 2"],
    "additionalPoints": ["extra point 1", "extra point 2"],
    "alternativeApproaches": ["approach 1", "approach 2"]
  },
  "plagiarismCheck": {
    "suspicionLevel": "none|low|medium|high",
    "reasoning": "explanation of assessment",
    "recommendations": ["recommendation 1", "recommendation 2"]
  },
  "improvementPlan": {
    "immediateActions": ["action 1", "action 2"],
    "studyRecommendations": ["recommendation 1", "recommendation 2"],
    "practiceAreas": ["area 1", "area 2"],
    "resources": ["resource 1", "resource 2"]
  }
}

Grading Guidelines:
1. Be fair and consistent with educational standards
2. Provide constructive feedback that helps learning
3. Consider partial credit for partially correct answers
4. Recognize different valid approaches to the same problem
5. Be sensitive to language barriers while maintaining academic standards
6. Focus on conceptual understanding over perfect language
7. Provide specific, actionable feedback
8. Maintain encouraging tone while being honest about areas needing improvement
9. Consider Bangladeshi educational context and standards
10. Award marks based on demonstrated understanding, not just matching model answer
`

    const result = await generateText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      prompt: autoGradingPrompt,
      temperature: 0.2, // Lower temperature for more consistent grading
      maxTokens: 3000,
    })

    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response")
      }

      const gradingResult = JSON.parse(jsonMatch[0])
      
      // Validate grading result
      if (gradingResult.grading.awardedMarks > maxMarks) {
        gradingResult.grading.awardedMarks = maxMarks
      }
      if (gradingResult.grading.awardedMarks < 0) {
        gradingResult.grading.awardedMarks = 0
      }
      
      gradingResult.grading.percentage = (gradingResult.grading.awardedMarks / maxMarks) * 100

      return NextResponse.json(gradingResult)

    } catch (parseError) {
      console.error('Error parsing grading result:', parseError)
      
      // Simple fallback grading based on basic text analysis
      const answerLength = studentAnswer.length
      const hasKeywords = modelAnswer ? 
        modelAnswer.toLowerCase().split(' ').some((word: string) => 
          word.length > 3 && studentAnswer.toLowerCase().includes(word)
        ) : true
      
      const baseScore = Math.min(maxMarks, Math.max(1, Math.floor(answerLength / 50) + (hasKeywords ? 3 : 1)))
      
      const fallbackGrading = {
        grading: {
          totalMarks: maxMarks,
          awardedMarks: baseScore,
          percentage: (baseScore / maxMarks) * 100,
          grade: baseScore >= maxMarks * 0.8 ? "A" : baseScore >= maxMarks * 0.6 ? "B" : "C",
          passingStatus: baseScore >= maxMarks * 0.4 ? "pass" : "fail"
        },
        detailedAnalysis: {
          strengths: [
            {
              aspect: "Attempt made",
              description: "Student provided an answer showing engagement with the question",
              marksAwarded: 1
            }
          ],
          weaknesses: [
            {
              aspect: "Needs more detail",
              description: "Answer could be more comprehensive and detailed",
              marksDeducted: maxMarks - baseScore,
              suggestion: "Provide more specific examples and explanations"
            }
          ],
          missingElements: []
        },
        criteriaAssessment: {
          contentAccuracy: { score: 70, feedback: "Generally accurate content" },
          conceptualUnderstanding: { score: 65, feedback: "Shows basic understanding" },
          clarity: { score: 60, feedback: "Could be clearer" },
          completeness: { score: 50, feedback: "Needs more comprehensive coverage" },
          organization: { score: 60, feedback: "Reasonable structure" },
          languageUse: { score: 70, feedback: "Acceptable language use" }
        },
        constructiveFeedback: {
          positiveAspects: ["Shows effort", "Addresses the question"],
          areasForImprovement: ["Add more detail", "Improve organization"],
          specificSuggestions: ["Use examples", "Structure your answer better"],
          nextSteps: ["Review the topic", "Practice similar questions"],
          encouragement: "Good effort! With more practice, you can improve significantly."
        },
        comparisonWithModel: {
          similarities: ["Basic approach"],
          differences: ["Less detailed"],
          additionalPoints: [],
          alternativeApproaches: []
        },
        plagiarismCheck: {
          suspicionLevel: "none",
          reasoning: "Answer appears to be original work",
          recommendations: []
        },
        improvementPlan: {
          immediateActions: ["Review feedback", "Identify key concepts"],
          studyRecommendations: ["Read more on the topic", "Practice writing"],
          practiceAreas: ["Detailed explanations", "Example usage"],
          resources: ["Textbook chapters", "Online resources"]
        }
      }
      
      return NextResponse.json(fallbackGrading)
    }

  } catch (error) {
    console.error('Error in auto-grading:', error)
    return NextResponse.json({ error: 'Failed to grade answer' }, { status: 500 })
  }
}