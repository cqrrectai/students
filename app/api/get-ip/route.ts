import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get IP address from various headers
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const cfConnectingIp = request.headers.get("cf-connecting-ip")

    let ip = forwarded?.split(",")[0] || realIp || cfConnectingIp || "127.0.0.1"

    // Clean up the IP address
    ip = ip.trim()

    return NextResponse.json({ ip })
  } catch (error) {
    console.error("Error getting IP address:", error)
    return NextResponse.json({ ip: "127.0.0.1" })
  }
}
