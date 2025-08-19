import { type NextRequest, NextResponse } from "next/server"

interface ExamQuestion {
  id: string
  question: string
  options?: string[]
  correctAnswer?: string
  questionType: "multiple-choice" | "short-answer" | "essay" | "true-false"
  difficulty: "easy" | "medium" | "hard"
  subject?: string
  marks?: number
  qualityScore?: number
  tags?: string[]
  explanation?: string
  timeEstimate?: number
}

export async function POST(request: NextRequest) {
  try {
    const { questions, format } = await request.json()

    if (format === "json") {
      const jsonData = JSON.stringify(questions, null, 2)
      return new NextResponse(jsonData, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": "attachment; filename=exam-questions.json",
        },
      })
    }

    if (format === "csv") {
      const csvHeaders = [
        "Question",
        "Type",
        "Difficulty",
        "Subject",
        "Marks",
        "Quality Score",
        "Time Estimate",
        "Options",
        "Correct Answer",
        "Explanation",
        "Tags",
      ]

      const csvRows = questions.map((q: ExamQuestion) => [
        `"${q.question.replace(/"/g, '""')}"`,
        q.questionType,
        q.difficulty,
        q.subject || "",
        q.marks || "",
        q.qualityScore || "",
        q.timeEstimate || "",
        q.options ? `"${q.options.join("; ").replace(/"/g, '""')}"` : "",
        q.correctAnswer ? `"${q.correctAnswer.replace(/"/g, '""')}"` : "",
        q.explanation ? `"${q.explanation.replace(/"/g, '""')}"` : "",
        q.tags ? q.tags.join("; ") : "",
      ])

      const csvContent = [csvHeaders.join(","), ...csvRows.map((row) => row.join(","))].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=exam-questions.csv",
        },
      })
    }

    if (format === "pdf") {
      // For PDF generation, you would typically use a library like jsPDF or Puppeteer
      // For now, we'll return a simple text format
      let pdfContent = "EXAM QUESTIONS\n\n"

      questions.forEach((q: ExamQuestion, index: number) => {
        pdfContent += `Question ${index + 1}: ${q.question}\n`
        pdfContent += `Type: ${q.questionType} | Difficulty: ${q.difficulty}\n`

        if (q.options && q.options.length > 0) {
          q.options.forEach((option, optIndex) => {
            pdfContent += `${String.fromCharCode(65 + optIndex)}. ${option}\n`
          })
        }

        if (q.correctAnswer) {
          pdfContent += `Correct Answer: ${q.correctAnswer}\n`
        }

        if (q.explanation) {
          pdfContent += `Explanation: ${q.explanation}\n`
        }

        pdfContent += "\n---\n\n"
      })

      return new NextResponse(pdfContent, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": "attachment; filename=exam-questions.txt",
        },
      })
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
