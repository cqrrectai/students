import { type NextRequest, NextResponse } from "next/server"
import { databaseService } from "@/lib/database-service"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Create exam attempt or update existing one with proctoring data
    const { examId, userId, sessionId } = data
    
    const examAttemptData = {
      exam_id: examId,
      user_id: userId,
      started_at: new Date().toISOString(),
      answers: [],
      percentage: 0,
      score: 0,
      total_marks: 0,
      time_taken: 0,
      proctoring_data: {
        sessionId,
        ...data,
        createdAt: new Date().toISOString(),
      }
    }

    const { error } = await databaseService.createExamAttempt(examAttemptData)
    
    if (error) {
      console.error("Error storing proctoring data:", error)
      return NextResponse.json({ error: "Failed to store proctoring data" }, { status: 500 })
    }

    return NextResponse.json({ success: true, sessionId })
  } catch (error) {
    console.error("Error storing proctoring data:", error)
    return NextResponse.json({ error: "Failed to store proctoring data" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { sessionId, examId, userId } = data

    // Find the exam attempt with this session ID
    const { data: attempts } = await databaseService.getExamAttempts({
      examId,
      userId
    })

    if (!attempts || attempts.length === 0) {
      return NextResponse.json({ error: "No exam attempt found" }, { status: 404 })
    }

    const currentAttempt = attempts[0]
    const existingProctoring = (currentAttempt.proctoring_data as any) || {}
    
    // Update the exam attempt with new proctoring data
    const updatedProctoringData = {
      ...existingProctoring,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    const { error } = await databaseService.updateExamAttempt(currentAttempt.id, {
      proctoring_data: updatedProctoringData
    })

    if (error) {
      console.error("Error updating proctoring data:", error)
      return NextResponse.json({ error: "Failed to update proctoring data" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating proctoring data:", error)
    return NextResponse.json({ error: "Failed to update proctoring data" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")
    const examId = searchParams.get("examId")
    const userId = searchParams.get("userId")

    let filters: any = {}
    if (examId) filters.examId = examId
    if (userId) filters.userId = userId

    const { data: attempts } = await databaseService.getExamAttempts(filters)

    if (!attempts) {
      return NextResponse.json([])
    }

    // Filter by sessionId if provided, otherwise return all
    const filteredAttempts = sessionId 
      ? attempts.filter(attempt => {
          const proctoring = attempt.proctoring_data as any
          return proctoring?.sessionId === sessionId
        })
      : attempts

    const proctoringDataList = filteredAttempts.map(attempt => {
      const proctoringData = (attempt.proctoring_data as any) || {}
      return {
        ...proctoringData,
        examId: attempt.exam_id,
        userId: attempt.user_id,
        attemptId: attempt.id
      }
    })

    return NextResponse.json(sessionId ? proctoringDataList[0] || {} : proctoringDataList)
  } catch (error) {
    console.error("Error retrieving proctoring data:", error)
    return NextResponse.json({ error: "Failed to retrieve proctoring data" }, { status: 500 })
  }
}
