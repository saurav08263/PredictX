import { NextResponse } from "next/server"
import { db } from "@/lib/db"

const MULTIPLIER = 1.8

/**
 * POST /api/round/resolve
 * Called by the price service when a round ends.
 * Body: { roundId, exitPrice, coin, duration }
 *
 * This endpoint:
 * 1. Updates the Round with exitPrice and COMPLETED status
 * 2. Resolves all PENDING bets (WIN or LOSE)
 * 3. Credits winnings to winning users
 * 4. Creates transaction records
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { roundId, exitPrice } = body

    if (!roundId || exitPrice === undefined || exitPrice === null) {
      return NextResponse.json(
        { error: "Missing required fields: roundId, exitPrice" },
        { status: 400 }
      )
    }

    const exit = Number(exitPrice)
    if (!isFinite(exit) || exit <= 0) {
      return NextResponse.json(
        { error: "Invalid exitPrice" },
        { status: 400 }
      )
    }


  // Find the round
const round = await db.round.findUnique({
  where: { roundId },
  include: {
    bets: {
      where: { status: "PENDING" },
      include: {
        user: true,
      },
    },
  },
})

    // Most rounds have no bets placed on them — silently acknowledge.
    // This prevents log noise from the price-service polling every round.
    if (!round) {
      return NextResponse.json({
        roundId,
        resolvedBets: 0,
        results: [],
        note: "Round had no bets — nothing to resolve",
      })
    }

    if (round.status === "COMPLETED") {
      return NextResponse.json({ error: "Round already resolved" }, { status: 400 })
    }

    const entryPrice = round.entryPrice
    const wentUp = exit > entryPrice

    // Resolve all pending bets in a transaction
    const resolvedBets = await db.$transaction(async (tx) => {
      // Update round
      await tx.round.update({
        where: { id: round.id },
        data: {
          exitPrice: exit,
          status: "COMPLETED",
          endedAt: new Date(),
        },
      })

      const results: any[] = []

      for (const bet of round.bets) {
        const won = (bet.direction === "UP" && wentUp) || (bet.direction === "DOWN" && !wentUp)
        const payout = won ? Math.round(bet.amount * MULTIPLIER * 100) / 100 : 0

        // Update bet
        await tx.bet.update({
          where: { id: bet.id },
          data: {
            status: won ? "WON" : "LOST",
            payout,
          },
        })

        // Update user
        const user = bet.user
        if (won) {
          const newBalance = user.balance + payout
          const newWinnings = user.winnings + payout
          const newProfit = user.profit + (payout - bet.amount)
          const newWins = user.wins + 1
          const newTotalBets = user.totalBets + 1

          await tx.user.update({
            where: { id: user.id },
            data: {
              balance: newBalance,
              winnings: newWinnings,
              profit: newProfit,
              wins: newWins,
              totalBets: newTotalBets,
            },
          })

          await tx.transaction.create({
            data: {
              userId: user.id,
              type: "BET_WON",
              amount: payout,
              status: "COMPLETED",
              balanceBefore: user.balance,
              balanceAfter: newBalance,
              referenceId: bet.id,
            },
          })
        } else {
          await tx.user.update({
            where: { id: user.id },
            data: {
              totalBets: user.totalBets + 1,
            },
          })

          await tx.transaction.create({
            data: {
              userId: user.id,
              type: "BET_LOST",
              amount: bet.amount,
              status: "COMPLETED",
              balanceBefore: user.balance,
              balanceAfter: user.balance, // balance already deducted at bet placement
              referenceId: bet.id,
            },
          })
        }

        results.push({
          betId: bet.id,
          userId: user.id,
          direction: bet.direction,
          amount: bet.amount,
          won,
          payout,
        })
      }

      return results
    })

    return NextResponse.json({
      roundId,
      entryPrice,
      exitPrice: exit,
      wentUp,
      resolvedBets: resolvedBets.length,
      results: resolvedBets,
    })
  } catch (error) {
    console.error("Failed to resolve round:", error)
    return NextResponse.json(
      { error: "Failed to resolve round" },
      { status: 500 }
    )
  }
}
