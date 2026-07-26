import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * GET /api/bets?userId=xxx
 * Returns the user's last 20 bets with round details.
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

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const bets = await db.bet.findMany({
      where: { userId },
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
      take: 20,
    })

    const formattedBets = bets.map((bet) => ({
      id: bet.id,
      direction: bet.direction,
      amount: bet.amount,
      multiplier: bet.multiplier,
      status: bet.status,
      payout: bet.payout,
      round: bet.round,
      createdAt: bet.createdAt,
    }))

    return NextResponse.json({ bets: formattedBets })
  } catch (error) {
    console.error("Failed to get bets:", error)
    return NextResponse.json(
      { error: "Failed to retrieve bets" },
      { status: 500 }
    )
  }
}
