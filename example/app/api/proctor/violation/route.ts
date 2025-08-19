import { type NextRequest, NextResponse } from "next/server"

// In a real application, this would be stored in a database
const violations = new Map()

export async function POST(request: NextRequest) {
  try {
    const { examId, violation } = await request.json()

    // Store violation data
    const violationKey = `${examId}_${violation.id}`
    violations.set(violationKey, {
      ...violation,
      examId,
      createdAt: new Date().toISOString(),
    })

    // In a real application, you might want to:
    // 1. Send real-time alerts to administrators
    // 2. Check if violation threshold is exceeded
    // 3. Automatically terminate exam if needed

    console.log(`Violation recorded for exam ${examId}:`, violation)

    return NextResponse.json({ success: true, violationId: violation.id })
  } catch (error) {
    console.error("Error storing violation:", error)
    return NextResponse.json({ error: "Failed to store violation" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const examId = searchParams.get("examId")

    if (examId) {
      // Return violations for specific exam
      const examViolations = Array.from(violations.values()).filter((v) => v.examId === examId)
      return NextResponse.json(examViolations)
    }

    // Return all violations (for admin purposes)
    return NextResponse.json(Array.from(violations.values()))
  } catch (error) {
    console.error("Error retrieving violations:", error)
    return NextResponse.json({ error: "Failed to retrieve violations" }, { status: 500 })
  }
}
