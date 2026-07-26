import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthUserId } from "@/lib/auth"
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { generateTotpSecret, computeTotp, buildOtpauthUrl } from "@/lib/totp"

export const dynamic = "force-dynamic"

/**
 * Setup 2FA: generate a new TOTP secret + return the otpauth URL + a demo code.
 * The secret is NOT persisted yet — the user must verify a code first via /2fa/verify.
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
      select: { id: true, email: true, phone: true, name: true, twoFactorEnabled: true },
    })
    if (!user) {
      return NextResponse.json(
        { error: "User not found", needsAuth: true },
        { status: 401 }
      )
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "2FA is already enabled. Disable it first to reconfigure." },
        { status: 400 }
      )
    }

    const secret = generateTotpSecret()
    const account = user.email || user.phone || user.name
    const otpauthUrl = buildOtpauthUrl(secret, account)
    // Demo: surface the current TOTP code so the user can complete enrollment
    // without a real authenticator app. In production, the user would scan the QR.
    const demoCode = computeTotp(secret)

    return NextResponse.json({
      secret,
      otpauthUrl,
      demoCode,
      account,
    })
  } catch (error) {
    console.error("2FA setup error:", error)
    return NextResponse.json(
      { error: "Failed to setup 2FA" },
      { status: 500 }
    )
  }
}
