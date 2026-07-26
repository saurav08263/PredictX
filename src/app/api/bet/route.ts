import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, direction, amount, coin, duration, roundId, entryPrice } = body

    if (!userId || !direction || !amount || !coin || !duration) {
      return NextResponse.json({ error: "Missing bet parameters" }, { status: 400 })
    }

    const durationNum = Number(duration)
    const betAmount = Number(amount)
    
    let targetRoundId = roundId || `ROUND-${coin}-${durationNum}-${Date.now()}`
    let targetEntryPrice = entryPrice ? Number(entryPrice) : 60000

    let round = await db.round.findUnique({ where: { roundId: targetRoundId } })
    if (!round) {
      round = await db.round.create({
        data: {
          roundId: targetRoundId,
          coin,
          duration: durationNum,
          entryPrice: targetEntryPrice,
          status: "ACTIVE",
        },
      })
    }

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } })
      if (!user || user.balance < betAmount) throw new Error("Insufficient balance")

      const bet = await tx.bet.create({
        data: {
          userId,
          roundId: round!.id,
          direction,
          amount: betAmount,
          multiplier: 1.8,
          status: "PENDING",
          payout: 0,
        },
      })

      const newBalance = user.balance - betAmount
      await tx.user.update({ where: { id: userId }, data: { balance: newBalance } })

      return { bet, newBalance }
    })

    return NextResponse.json({
      id: result.bet.id,
      direction: result.bet.direction,
      amount: result.bet.amount,
      status: result.bet.status,
      roundId: round.roundId,
      coin: round.coin,
      duration: round.duration,
      entryPrice: round.entryPrice,
      balance: result.newBalance,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process bet" }, { status: 500 })
  }
}