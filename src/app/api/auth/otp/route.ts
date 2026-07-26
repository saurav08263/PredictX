import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import {
  generateOtp,
  setAuthUserId,
  hashPassword,
} from "@/lib/auth"
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { ensureReferralCode } from "@/lib/referral"

export const dynamic = "force-dynamic"

const OTP_TTL_MINUTES = 5
const WELCOME_BONUS = 10000

/** POST /api/auth/otp — send OTP to phone (demo: returns OTP in response) */
export async function POST(request: Request) {
  const rateLimitResponse = applyRateLimit(request, RATE_LIMITS.auth)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { phone } = body as { phone?: string }

    if (!phone || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { error: "A valid phone number is required" },
        { status: 400 }
      )
    }

    const normalizedPhone = phone.trim()

    // Generate and store OTP
    const code = generateOtp()
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)

    // Invalidate previous unconsumed OTPs for this phone
    await db.otpCode.updateMany({
      where: { phone: normalizedPhone, consumed: false },
      data: { consumed: true },
    })

    await db.otpCode.create({
      data: {
        phone: normalizedPhone,
        code,
        expiresAt,
      },
    })

    // For demo: return the OTP so the UI can display it (no real SMS gateway).
    // In production, you would send via Twilio/etc. and NEVER return the code.
    return NextResponse.json({
      sent: true,
      otp: code, // DEMO ONLY — remove in production
      expiresIn: OTP_TTL_MINUTES * 60,
      message: `OTP sent to ${normalizedPhone}`,
    })
  } catch (error) {
    console.error("OTP send error:", error)
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    )
  }
}

/** PUT /api/auth/otp — verify OTP and log the user in */
export async function PUT(request: Request) {
  const rateLimitResponse = applyRateLimit(request, RATE_LIMITS.auth)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { phone, code, referralCode: refCode } = body as {
      phone?: string
      code?: string
      referralCode?: string
    }

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Phone and OTP code are required" },
        { status: 400 }
      )
    }

    const normalizedPhone = phone.trim()

    const otpRecord = await db.otpCode.findFirst({
      where: {
        phone: normalizedPhone,
        code,
        consumed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    })

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 401 }
      )
    }

    // Mark OTP as consumed
    await db.otpCode.update({
      where: { id: otpRecord.id },
      data: { consumed: true },
    })

    // Find or create user
    let user = await db.user.findUnique({
      where: { phone: normalizedPhone },
    })

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
          phone: normalizedPhone,
          name: `Trader ${normalizedPhone.slice(-4)}`,
          authMethod: "phone",
          isVerified: true,
          balance: WELCOME_BONUS,
          bonus: WELCOME_BONUS,
          password: hashPassword(Math.random().toString(36).slice(2)),
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

    // Backfill referral code if missing
    await ensureReferralCode(user.id)

    await setAuthUserId(user.id)

    return NextResponse.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      authMethod: user.authMethod,
      isNewUser,
    })
  } catch (error) {
    console.error("OTP verify error:", error)
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    )
  }
}
