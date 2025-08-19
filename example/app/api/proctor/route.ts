import { type NextRequest, NextResponse } from "next/server"

// In a real application, this would be stored in a database
const proctoringData = new Map()

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Store initial proctoring session data
    proctoringData.set(data.sessionId, {
      ...data,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, sessionId: data.sessionId })
  } catch (error) {
    console.error("Error storing proctoring data:", error)
    return NextResponse.json({ error: "Failed to store proctoring data" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    // Update proctoring session data
    if (proctoringData.has(data.sessionId)) {
      proctoringData.set(data.sessionId, {
        ...data,
        updatedAt: new Date().toISOString(),
      })
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

    if (sessionId && proctoringData.has(sessionId)) {
      return NextResponse.json(proctoringData.get(sessionId))
    }

    // Return all sessions (for admin purposes)
    return NextResponse.json(Array.from(proctoringData.values()))
  } catch (error) {
    console.error("Error retrieving proctoring data:", error)
    return NextResponse.json({ error: "Failed to retrieve proctoring data" }, { status: 500 })
  }
}
