import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthUserId, hashPassword, verifyPassword } from "@/lib/auth"
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const rateLimitResponse = applyRateLimit(request, RATE_LIMITS.auth)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const uid = await getAuthUserId()
    if (!uid) {
      return NextResponse.json(
        { error: "Not authenticated", needsAuth: true },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({ where: { id: uid } })
    if (!user) {
      return NextResponse.json(
        { error: "User not found", needsAuth: true },
        { status: 401 }
      )
    }

    // Only email-auth users can change password (Google/phone users don't have one)
    if (user.authMethod !== "email" || !user.password) {
      return NextResponse.json(
        { error: `Password change is only available for email-auth accounts. You sign in via ${user.authMethod}.` },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body as {
      currentPassword?: string
      newPassword?: string
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      )
    }

    if (!verifyPassword(currentPassword, user.password)) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      )
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 }
      )
    }

    await db.user.update({
      where: { id: uid },
      data: { password: hashPassword(newPassword) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    )
  }
}
