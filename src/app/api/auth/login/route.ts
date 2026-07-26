import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import {
  verifyPassword,
  setAuthUserId,
} from "@/lib/auth"
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const rateLimitResponse = applyRateLimit(request, RATE_LIMITS.auth)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { email, password } = body as { email?: string; password?: string }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    if (!verifyPassword(password, user.password)) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    await setAuthUserId(user.id)

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      authMethod: user.authMethod,
      isNewUser: false,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Failed to log in" },
      { status: 500 }
    )
  }
}
