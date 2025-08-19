import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { examId, examInfo, examResults, userId } = body

    // Validate required fields
    if (!examId || !examResults) {
      return Response.json({ 
        error: "Missing required fields: examId and examResults are required" 
      }, { status: 400 })
    }

    // If examInfo is not provided, create a minimal structure
    const defaultExamInfo = {
      title: "Exam",
      subject: "General",
      questionsData: [],
      totalMarks: examResults.totalQuestions || 10,
      duration: 60,
      security: { passingScore: 60 }
    }

    const examData = examInfo || defaultExamInfo

    // For testing purposes, if no AI model is available or if it's a simple test, return fallback immediately
    if (!process.env.GROQ_API_KEY || examResults.percentage === undefined) {
      console.log('Using fallback analytics (no AI model or test mode)')
      const fallbackAnalytics = generateFallbackAnalytics(examData, examResults)
      return Response.json(fallbackAnalytics)
    }

    // Prepare data for AI analysis
    const analysisPrompt = `
You are an advanced AI educational analyst. Analyze the following exam performance data and provide comprehensive insights.

EXAM INFORMATION:
- Title: ${examData.title}
- Subject: ${examData.subject}
- Total Questions: ${examData.questionsData.length || examResults.totalQuestions || 10}
- Total Marks: ${examData.totalMarks}
- Duration: ${examData.duration} minutes
- Passing Score: ${examData.security.passingScore}%

STUDENT PERFORMANCE:
- Score: ${examResults.score || examResults.totalScore}/${examData.totalMarks}
- Percentage: ${examResults.percentage}%
- Time Taken: ${Math.round((examResults.timeTaken || examResults.timeSpent || 3600000) / 60000)} minutes
- Passed: ${examResults.passed || examResults.percentage >= (examData.security.passingScore || 60)}

DETAILED QUESTION ANALYSIS:
${examData.questionsData && examData.questionsData.length > 0
  ? examData.questionsData
      .map((q: any, index: number) => {
        const answer = examResults.answers?.find((a: any) => a.questionId === q.id)
        return `
Question ${index + 1}:
- Subject: ${q.subject || examData.subject}
- Difficulty: ${q.difficulty || 'medium'}
- Marks: ${q.marks || 1}
- Correct Answer: ${q.correctAnswer}
- Student Answer: ${answer?.selectedAnswer || answer?.selectedOption || "Not answered"}
- Correct: ${answer?.isCorrect || false}
- Question: ${q.question}
`
      })
      .join("\n")
  : "Question details not available - analyzing based on overall performance"}

Please provide a comprehensive analysis in the following JSON format:
{
  "overallPerformance": {
    "score": number,
    "percentage": number,
    "grade": "A+/A/B+/B/C+/C/D/F",
    "timeEfficiency": number (0-100, how efficiently time was used),
    "accuracyRate": number (0-100),
    "consistencyScore": number (0-100, how consistent performance was across questions)
  },
  "subjectAnalysis": [
    {
      "subject": "string",
      "score": number,
      "totalQuestions": number,
      "accuracy": number,
      "avgTimePerQuestion": number,
      "difficulty": "easy/medium/hard",
      "strengths": ["specific strength 1", "specific strength 2"],
      "weaknesses": ["specific weakness 1", "specific weakness 2"]
    }
  ],
  "timeAnalysis": {
    "totalTime": number,
    "avgTimePerQuestion": number,
    "fastestQuestion": {"id": "string", "time": number, "question": "string"},
    "slowestQuestion": {"id": "string", "time": number, "question": "string"},
    "timeDistribution": [{"questionNumber": number, "time": number, "correct": boolean}]
  },
  "difficultyAnalysis": {
    "easy": {"correct": number, "total": number, "avgTime": number},
    "medium": {"correct": number, "total": number, "avgTime": number},
    "hard": {"correct": number, "total": number, "avgTime": number}
  },
  "aiInsights": {
    "strengths": ["detailed strength analysis 1", "detailed strength analysis 2", "detailed strength analysis 3"],
    "weaknesses": ["detailed weakness analysis 1", "detailed weakness analysis 2", "detailed weakness analysis 3"],
    "recommendations": ["specific actionable recommendation 1", "specific actionable recommendation 2", "specific actionable recommendation 3"],
    "studyPlan": ["step 1 of personalized study plan", "step 2 of personalized study plan", "step 3 of personalized study plan", "step 4 of personalized study plan", "step 5 of personalized study plan"],
    "nextSteps": ["immediate next step 1", "immediate next step 2", "immediate next step 3"],
    "motivationalMessage": "personalized encouraging message based on performance"
  },
  "comparativeAnalysis": {
    "percentile": number (estimated percentile based on performance),
    "averageScore": number (estimated average score),
    "topPerformers": number (estimated percentage of top performers),
    "improvementAreas": ["area 1", "area 2", "area 3"]
  }
}

Provide detailed, personalized, and actionable insights. Be encouraging but honest about areas needing improvement. Focus on specific learning strategies and study techniques.
`

    // Add timeout for AI processing
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI processing timeout')), 30000) // 30 second timeout
    )

    let fullResponse: string
    try {
      const result = await Promise.race([
        streamText({
          model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
          prompt: analysisPrompt,
          temperature: 0.7,
        }),
        timeoutPromise
      ]) as any

      fullResponse = await result.text
    } catch (aiError) {
      console.log('AI processing failed or timed out, using fallback analytics:', aiError)
      const fallbackAnalytics = generateFallbackAnalytics(examData, examResults)
      return Response.json(fallbackAnalytics)
    }

    try {
      // Extract JSON from the response
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in response")
      }

      const analyticsData = JSON.parse(jsonMatch[0])

      // Add some calculated fields and ensure data integrity
      if (examData.questionsData && examData.questionsData.length > 0) {
        analyticsData.timeAnalysis.timeDistribution = examData.questionsData.map((q: any, index: number) => {
          const answer = examResults.answers?.find((a: any) => a.questionId === q.id)
          return {
            questionNumber: index + 1,
            time: Math.random() * 120 + 30, // Simulated time data
            correct: answer?.isCorrect || false,
          }
        })
      } else {
        // Generate time distribution based on total questions
        const totalQuestions = examResults.totalQuestions || 10
        analyticsData.timeAnalysis.timeDistribution = Array.from({ length: totalQuestions }, (_, index) => ({
          questionNumber: index + 1,
          time: Math.random() * 120 + 30,
          correct: Math.random() > 0.3, // Simulated correctness
        }))
      }

      // Ensure all required fields are present
      if (!analyticsData.overallPerformance) {
        analyticsData.overallPerformance = {
          score: examResults.score,
          percentage: examResults.percentage,
          grade:
            examResults.percentage >= 90
              ? "A+"
              : examResults.percentage >= 80
                ? "A"
                : examResults.percentage >= 70
                  ? "B+"
                  : examResults.percentage >= 60
                    ? "B"
                    : examResults.percentage >= 50
                      ? "C"
                      : "F",
          timeEfficiency: Math.min(100, Math.max(0, 100 - (examResults.timeTaken / (examInfo.duration * 60000)) * 100)),
          accuracyRate: examResults.percentage,
          consistencyScore: Math.random() * 30 + 70, // Simulated consistency score
        }
      }

      return Response.json(analyticsData)
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)

      // Fallback analytics if AI parsing fails
      const fallbackAnalytics = generateFallbackAnalytics(examData, examResults)
      return Response.json(fallbackAnalytics)
    }
  } catch (error) {
    console.error("Error generating analytics:", error)
    return Response.json({ error: "Failed to generate analytics" }, { status: 500 })
  }
}

function generateFallbackAnalytics(examInfo: any, examResults: any) {
  const correctAnswers = examResults.answers.filter((a: any) => a.isCorrect).length
  const totalQuestions = examInfo.questionsData.length

  return {
    overallPerformance: {
      score: examResults.score,
      percentage: examResults.percentage,
      grade:
        examResults.percentage >= 90
          ? "A+"
          : examResults.percentage >= 80
            ? "A"
            : examResults.percentage >= 70
              ? "B+"
              : examResults.percentage >= 60
                ? "B"
                : examResults.percentage >= 50
                  ? "C"
                  : "F",
      timeEfficiency: Math.min(100, Math.max(0, 100 - (examResults.timeTaken / (examInfo.duration * 60000)) * 100)),
      accuracyRate: examResults.percentage,
      consistencyScore: 75,
    },
    subjectAnalysis: [
      {
        subject: examInfo.subject,
        score: correctAnswers,
        totalQuestions: totalQuestions,
        accuracy: examResults.percentage,
        avgTimePerQuestion: examResults.timeTaken / totalQuestions / 1000,
        difficulty: "medium",
        strengths: ["Good overall understanding", "Consistent performance"],
        weaknesses: ["Time management", "Complex problem solving"],
      },
    ],
    timeAnalysis: {
      totalTime: examResults.timeTaken,
      avgTimePerQuestion: examResults.timeTaken / totalQuestions / 1000,
      fastestQuestion: { id: "1", time: 30, question: "Sample fastest question" },
      slowestQuestion: { id: "2", time: 120, question: "Sample slowest question" },
      timeDistribution: Array.from({ length: totalQuestions }, (_, i) => ({
        questionNumber: i + 1,
        time: Math.random() * 120 + 30,
        correct: examResults.answers[i]?.isCorrect || false,
      })),
    },
    difficultyAnalysis: {
      easy: { correct: Math.floor(correctAnswers * 0.4), total: Math.floor(totalQuestions * 0.3), avgTime: 45 },
      medium: { correct: Math.floor(correctAnswers * 0.4), total: Math.floor(totalQuestions * 0.5), avgTime: 75 },
      hard: { correct: Math.floor(correctAnswers * 0.2), total: Math.floor(totalQuestions * 0.2), avgTime: 105 },
    },
    aiInsights: {
      strengths: [
        "Shows good understanding of fundamental concepts",
        "Demonstrates consistent problem-solving approach",
        "Maintains focus throughout the exam",
      ],
      weaknesses: [
        "Could improve time management skills",
        "May need more practice with complex problems",
        "Should review specific topic areas",
      ],
      recommendations: [
        "Practice timed exercises to improve speed",
        "Focus on understanding rather than memorization",
        "Review incorrect answers to identify patterns",
      ],
      studyPlan: [
        "Review fundamental concepts daily for 30 minutes",
        "Practice 10 questions daily with time limits",
        "Take weekly mock tests to track progress",
        "Focus on weak areas identified in this analysis",
        "Join study groups for collaborative learning",
      ],
      nextSteps: ["Schedule regular study sessions", "Create a revision timetable", "Seek help for challenging topics"],
      motivationalMessage: "You're making good progress! Focus on consistent practice and you'll see improvement.",
    },
    comparativeAnalysis: {
      percentile: Math.min(95, Math.max(5, examResults.percentage)),
      averageScore: 65,
      topPerformers: 15,
      improvementAreas: ["Time management", "Complex problem solving", "Subject-specific knowledge"],
    },
  }
}
