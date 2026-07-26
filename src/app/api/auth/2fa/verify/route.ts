import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthUserId } from "@/lib/auth"
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { verifyTotp } from "@/lib/totp"

export const dynamic = "force-dynamic"

/**
 * Verify 2FA: confirm the user-entered TOTP code against the secret from setup.
 * On success, persist the secret + mark 2FA enabled.
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
      select: { id: true, twoFactorEnabled: true },
    })
    if (!user) {
      return NextResponse.json(
        { error: "User not found", needsAuth: true },
        { status: 401 }
      )
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "2FA is already enabled." },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { code, secret } = body as { code?: string; secret?: string }

    if (!code || !secret) {
      return NextResponse.json(
        { error: "Verification code and secret are required" },
        { status: 400 }
      )
    }

    if (!verifyTotp(secret, code)) {
      return NextResponse.json(
        { error: "Invalid verification code. Please try again." },
        { status: 400 }
      )
    }

    await db.user.update({
      where: { id: uid },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("2FA verify error:", error)
    return NextResponse.json(
      { error: "Failed to verify 2FA" },
      { status: 500 }
    )
  }
}
