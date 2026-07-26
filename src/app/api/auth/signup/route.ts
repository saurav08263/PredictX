import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import {
  hashPassword,
  setAuthUserId,
  getAuthUserId,
} from "@/lib/auth"
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { ensureReferralCode } from "@/lib/referral"

export const dynamic = "force-dynamic"

const WELCOME_BONUS = 10000

export async function POST(request: Request) {
  const rateLimitResponse = applyRateLimit(request, RATE_LIMITS.auth)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { name, email, password, referralCode: refCode } = body as {
      name?: string
      email?: string
      password?: string
      referralCode?: string
    }

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    })
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    // Resolve referrer (if a referral code was provided)
    let referrerId: string | null = null
    if (refCode && typeof refCode === "string") {
      const referrer = await db.user.findUnique({
        where: { referralCode: refCode.trim().toUpperCase() },
        select: { id: true },
      })
      if (referrer) referrerId = referrer.id
    }

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashPassword(password),
        authMethod: "email",
        isVerified: true,
        balance: WELCOME_BONUS,
        bonus: WELCOME_BONUS,
        referredBy: referrerId,
      },
    })

    // Generate + persist the new user's own referral code
    const referralCode = await ensureReferralCode(user.id)

    // If a referrer was used, credit them a referral bonus
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

    await setAuthUserId(user.id)

    // Record welcome bonus transaction
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

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      authMethod: user.authMethod,
      referralCode,
      isNewUser: true,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const uid = await getAuthUserId()
    if (!uid) {
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }
    const user = await db.user.findUnique({
      where: { id: uid },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        authMethod: true,
        avatar: true,
      },
    })
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }
    return NextResponse.json({ authenticated: true, user })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }
}
