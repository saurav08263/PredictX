import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthUserId } from "@/lib/auth"
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { verifyTotp } from "@/lib/totp"

export const dynamic = "force-dynamic"

/**
 * Disable 2FA: require a valid TOTP code from the user's stored secret.
 * Clears the secret + flag on success.
 */
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

    const user = await db.user.findUnique({
      where: { id: uid },
      select: { id: true, twoFactorEnabled: true, twoFactorSecret: true },
    })
    if (!user) {
      return NextResponse.json(
        { error: "User not found", needsAuth: true },
        { status: 401 }
      )
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "2FA is not currently enabled." },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { code } = body as { code?: string }

    if (!code) {
      return NextResponse.json(
        { error: "Verification code is required to disable 2FA" },
        { status: 400 }
      )
    }

    if (!user.twoFactorSecret || !verifyTotp(user.twoFactorSecret, code)) {
      return NextResponse.json(
        { error: "Invalid verification code. Please try again." },
        { status: 400 }
      )
    }

    await db.user.update({
      where: { id: uid },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("2FA disable error:", error)
    return NextResponse.json(
      { error: "Failed to disable 2FA" },
      { status: 500 }
    )
  }
}
