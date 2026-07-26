import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthUserId } from "@/lib/auth"
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  // Rate limiting
  const rateLimitResponse = applyRateLimit(request, RATE_LIMITS.api)
  if (rateLimitResponse) return rateLimitResponse

  try {
    // Require authentication — read the user ID from the HTTP-only cookie.
    const authUid = await getAuthUserId()

    if (!authUid) {
      return NextResponse.json(
        { error: "Not authenticated", needsAuth: true },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({ where: { id: authUid } })

    if (!user) {
      // Cookie is stale — the user was deleted. Clear by returning 401.
      return NextResponse.json(
        { error: "Not authenticated", needsAuth: true },
        { status: 401 }
      )
    }

    const winRate =
      user.totalBets > 0
        ? Math.round((user.wins / user.totalBets) * 100)
        : 0

    return NextResponse.json({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      phone: user.phone,
      authMethod: user.authMethod,
      balance: user.balance,
      winnings: user.winnings,
      bonus: user.bonus,
      profit: user.profit,
      wins: user.wins,
      totalBets: user.totalBets,
      winRate,
      country: user.country,
      streak: 0,
      twoFactorEnabled: user.twoFactorEnabled,
      referralCode: user.referralCode,
      referralEarnings: user.referralEarnings,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  } catch (error) {
    console.error("Failed to get/create user:", error)
    return NextResponse.json(
      { error: "Failed to get user data" },
      { status: 500 }
    )
  }
}
