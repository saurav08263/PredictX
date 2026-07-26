import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * GET /api/bet/active?userId=xxx
 * Returns the user's current active (PENDING) bet, if any.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "Missing query parameter: userId" },
        { status: 400 }
      )
    }

    const activeBet = await db.bet.findFirst({
      where: { userId, status: "PENDING" },
      include: {
        round: {
          select: {
            roundId: true,
            coin: true,
            duration: true,
            entryPrice: true,
            exitPrice: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    if (!activeBet) {
      return NextResponse.json({ activeBet: null })
    }

    return NextResponse.json({
      activeBet: {
        id: activeBet.id,
        direction: activeBet.direction,
        amount: activeBet.amount,
        multiplier: activeBet.multiplier,
        potentialPayout: Math.round(activeBet.amount * activeBet.multiplier * 100) / 100,
        round: activeBet.round,
        createdAt: activeBet.createdAt,
      },
    })
  } catch (error) {
    console.error("Failed to get active bet:", error)
    return NextResponse.json(
      { error: "Failed to retrieve active bet" },
      { status: 500 }
    )
  }
}
