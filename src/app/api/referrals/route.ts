import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthUserId } from "@/lib/auth"
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { ensureReferralCode } from "@/lib/referral"

export const dynamic = "force-dynamic"

/**
 * GET /api/referrals
 * Returns the current user's referral code, referral stats (friends joined,
 * total earned), and a list of recent referrals.
 *
 * Referrals are tracked via the `referredBy` field on User — when a new user
 * signs up with a referral code, we store the referrer's userId there.
 */
export async function GET(request: Request) {
  const rateLimitResponse = applyRateLimit(request, RATE_LIMITS.api)
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
      select: {
        id: true,
        name: true,
        referralCode: true,
        referralEarnings: true,
      },
    })
    if (!user) {
      return NextResponse.json(
        { error: "User not found", needsAuth: true },
        { status: 401 }
      )
    }

    // Make sure the user has a referral code (backfills existing accounts)
    const referralCode = await ensureReferralCode(uid)

    // Find users who were referred by this user
    const referrals = await db.user.findMany({
      where: { referredBy: uid },
      select: {
        id: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    const friendsJoined = await db.user.count({
      where: { referredBy: uid },
    })

    return NextResponse.json({
      referralCode,
      referralLink: `https://cryptopredictor.app/r/${referralCode}`,
      friendsJoined,
      totalEarned: user.referralEarnings,
      recentReferrals: referrals.map((r) => ({
        id: r.id,
        name: r.name,
        avatar: r.avatar,
        joinedAt: r.createdAt,
      })),
    })
  } catch (error) {
    console.error("Failed to get referrals:", error)
    return NextResponse.json(
      { error: "Failed to retrieve referral data" },
      { status: 500 }
    )
  }
}
