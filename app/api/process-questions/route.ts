import { groq } from "@ai-sdk/groq"
import { generateObject } from "ai"
import { z } from "zod"
import { type NextRequest, NextResponse } from "next/server"

const ExamQuestionSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe("The main question text"),
      options: z.array(z.string()).optional().describe("Multiple choice options if applicable"),
      correctAnswer: z.string().optional().describe("The correct answer"),
      questionType: z.enum(["multiple-choice", "short-answer", "essay", "true-false"]).describe("Type of question"),
      difficulty: z.enum(["easy", "medium", "hard"]).describe("Difficulty level"),
      subject: z.string().optional().describe("Subject or topic area"),
      marks: z.number().optional().describe("Marks or points for this question"),
    }),
  ),
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const customInstructions = (formData.get("instructions") as string) || ""

    // Get all image files
    const imageFiles: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image-") && value instanceof File) {
        imageFiles.push(value)
      }
    }

    if (imageFiles.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 })
    }

    // Convert images to base64
    const imagePromises = imageFiles.map(async (file) => {
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString("base64")
      return {
        type: "image" as const,
        image: `data:${file.type};base64,${base64}`,
      }
    })

    const images = await Promise.all(imagePromises)

    // Create the prompt
    const systemPrompt = `You are an expert educator and exam question generator. Your task is to analyze the provided images containing question banks, textbooks, or handwritten questions and convert them into well-structured exam questions.

Instructions:
1. Extract all visible questions from the images
2. Format them as proper exam questions with clear structure
3. Identify the question type (multiple-choice, short-answer, essay, true-false)
4. Determine appropriate difficulty levels
5. Extract or infer correct answers where possible
6. Assign reasonable marks/points for each question
7. Identify the subject area if apparent

${customInstructions ? `Additional Instructions: ${customInstructions}` : ""}

Please ensure:
- Questions are clear and grammatically correct
- Multiple choice options are properly formatted
- Difficulty assessment is realistic
- Subject classification is accurate
- All text is properly extracted and readable`

    const userMessage = {
      role: "user" as const,
      content: [
        {
          type: "text" as const,
          text: "Please analyze these question bank images and convert them into structured exam questions. Extract all visible questions and format them properly.",
        },
        ...images,
      ],
    }

    // Generate structured questions using Groq
    const result = await generateObject({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      messages: [{ role: "system", content: systemPrompt }, userMessage],
      schema: ExamQuestionSchema,
      maxTokens: 4000,
    })

    return NextResponse.json({
      questions: result.object.questions,
      totalProcessed: imageFiles.length,
    })
  } catch (error) {
    console.error("Error processing questions:", error)
    return NextResponse.json({ error: "Failed to process images. Please try again." }, { status: 500 })
  }
}