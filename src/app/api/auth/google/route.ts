import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import {
  generateGoogleName,
  generateGoogleEmail,
  setAuthUserId,
} from "@/lib/auth"
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { ensureReferralCode } from "@/lib/referral"

export const dynamic = "force-dynamic"

const WELCOME_BONUS = 10000

/** POST /api/auth/google — simulated Google OAuth sign-in. */
export async function POST(request: Request) {
  const rateLimitResponse = applyRateLimit(request, RATE_LIMITS.auth)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json().catch(() => ({}))
    const { email, name, referralCode: refCode } = (body || {}) as {
      email?: string
      name?: string
      referralCode?: string
    }

    // Simulated Google OAuth: in production, this would exchange a Google ID token
    // for user info via the Google People API. Here we accept an optional email/name
    // from the client (demo) and otherwise generate a random Google-style account.
    const googleEmail = (email?.trim().toLowerCase() || generateGoogleEmail())
    const googleName = name?.trim() || generateGoogleName()

    let user = await db.user.findUnique({ where: { email: googleEmail } })
    let isNewUser = false

    if (!user) {
      // Resolve referrer (if a referral code was provided)
      let referrerId: string | null = null
      if (refCode && typeof refCode === "string") {
        const referrer = await db.user.findUnique({
          where: { referralCode: refCode.trim().toUpperCase() },
          select: { id: true },
        })
        if (referrer) referrerId = referrer.id
      }
      isNewUser = true
      user = await db.user.create({
        data: {
          name: googleName,
          email: googleEmail,
          authMethod: "google",
          isVerified: true,
          balance: WELCOME_BONUS,
          bonus: WELCOME_BONUS,
          referredBy: referrerId,
        },
      })
      await db.transaction.create({
        data: {
          userId: user.id,
          type: "DEPOSIT",
          amount: WELCOME_BONUS,
          status: "COMPLETED",
          method: "WELCOME_BONUS",
          balanceBefore: 0,
          balanceAfter: WELCOME_BONUS,
        },
      })

      // Credit referrer if applicable
      if (referrerId) {
        const REFERRAL_BONUS = 2000
        await db.user.update({
          where: { id: referrerId },
          data: {
            referralEarnings: { increment: REFERRAL_BONUS },
            balance: { increment: REFERRAL_BONUS },
            bonus: { increment: REFERRAL_BONUS },
          },
        })
        await db.transaction.create({
          data: {
            userId: referrerId,
            type: "DEPOSIT",
            amount: REFERRAL_BONUS,
            status: "COMPLETED",
            method: "REFERRAL_BONUS",
            referenceId: user.id,
            balanceBefore: 0,
            balanceAfter: REFERRAL_BONUS,
          },
        })
      }
    }

    // Backfill referral code if missing (for users created before this field existed)
    await ensureReferralCode(user.id)

    await setAuthUserId(user.id)

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      authMethod: user.authMethod,
      isNewUser,
    })
 } catch (error: any) {
  console.error("========== GOOGLE AUTH ERROR ==========")
  console.error(error)
  console.error(error?.stack)
  console.error("======================================")

  return NextResponse.json(
    {
      error: error?.message || "Failed to sign in with Google",
      stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
    },
    { status: 500 }
  )
}
}
