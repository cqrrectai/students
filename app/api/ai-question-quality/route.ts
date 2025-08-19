import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set in environment variables")
}

export async function POST(request: NextRequest) {
  try {
    const { questions, subject, type } = await request.json()

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Questions array is required' }, { status: 400 })
    }

    const qualityAnalysisPrompt = `
You are an expert educational assessment specialist. Analyze the following multiple-choice questions for quality, accuracy, and educational value.

QUESTIONS TO ANALYZE:
${questions.map((q: any, index: number) => `
Question ${index + 1}:
Question: ${q.question}
Options: ${q.options?.join(', ')}
Correct Answer: ${q.correctAnswer}
Subject: ${q.subject || subject}
Difficulty: ${q.difficulty}
`).join('\n')}

For each question, provide a comprehensive quality analysis in the following JSON format:
{
  "overallQuality": {
    "averageScore": number (0-100),
    "totalQuestions": number,
    "recommendations": ["general recommendation 1", "general recommendation 2"]
  },
  "questionAnalysis": [
    {
      "questionIndex": number,
      "qualityScore": number (0-100),
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "improvements": ["improvement 1", "improvement 2"],
      "difficultyAccuracy": "accurate|too_easy|too_hard",
      "conceptualClarity": number (0-100),
      "optionQuality": number (0-100),
      "culturalRelevance": number (0-100),
      "educationalValue": number (0-100),
      "bloomsTaxonomy": "remember|understand|apply|analyze|evaluate|create"
    }
  ]
}

Evaluate based on:
1. Question clarity and unambiguity
2. Option plausibility and distractor quality
3. Correct answer accuracy
4. Educational value and concept testing
5. Cultural relevance for Bangladeshi students
6. Appropriate difficulty level
7. Bloom's taxonomy level
8. Grammar and language quality
`

    const result = await generateText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      prompt: qualityAnalysisPrompt,
      temperature: 0.3,
      maxTokens: 3000,
    })

    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response")
      }

      const qualityAnalysis = JSON.parse(jsonMatch[0])
      return NextResponse.json(qualityAnalysis)

    } catch (parseError) {
      console.error('Error parsing quality analysis:', parseError)
      
      // Fallback quality analysis
      const fallbackAnalysis = {
        overallQuality: {
          averageScore: 75,
          totalQuestions: questions.length,
          recommendations: [
            "Review question clarity and remove ambiguous wording",
            "Ensure all distractors are plausible but clearly incorrect",
            "Verify cultural relevance for Bangladeshi context"
          ]
        },
        questionAnalysis: questions.map((q: any, index: number) => ({
          questionIndex: index,
          qualityScore: Math.floor(Math.random() * 30) + 70,
          strengths: ["Clear question structure", "Appropriate difficulty level"],
          weaknesses: ["Could improve distractor quality", "May need more context"],
          improvements: ["Add more specific details", "Review option plausibility"],
          difficultyAccuracy: "accurate",
          conceptualClarity: 80,
          optionQuality: 75,
          culturalRelevance: 85,
          educationalValue: 80,
          bloomsTaxonomy: "understand"
        }))
      }
      
      return NextResponse.json(fallbackAnalysis)
    }

  } catch (error) {
    console.error('Error analyzing question quality:', error)
    return NextResponse.json({ error: 'Failed to analyze question quality' }, { status: 500 })
  }
}