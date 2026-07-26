import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 })

    const activeBet = await db.bet.findFirst({
      where: { userId, status: "PENDING" },
      include: { round: true, user: true },
    })

    if (!activeBet) return NextResponse.json({ activeBet: null, resolved: false })

    const round = activeBet.round
    const now = Date.now()
    
    // STRICT TIME BOUNDARY PARSING FROM THE ROUND STRING NAME ITSELF
    const parts = round.roundId.split("-")
    const stamp = parseInt(parts[parts.length - 1], 10)
    const roundStart = isNaN(stamp) ? new Date(activeBet.createdAt).getTime() : stamp

    const elapsed = (now - roundStart) / 1000

    // JAR TIMING CHALU AAHI TAR COUNTDOWN CONTINUOUS UPDATE THEVA
    if (elapsed < round.duration) {
      const timeLeft = Math.max(1, Math.ceil(round.duration - elapsed))
      return NextResponse.json({
        activeBet: {
          id: activeBet.id,
          direction: activeBet.direction,
          amount: activeBet.amount,
          round: {
            roundId: round.roundId,
            coin: round.coin,
            duration: round.duration,
            entryPrice: round.entryPrice,
          },
        },
        timeLeft,
        resolved: false,
      })
    }

    // TARGET TIME EXCEEDED - FORCE INSTANT SETTLE
    let exitPrice = round.entryPrice
    try {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${round.coin}`, { cache: "no-store" })
      const data = await res.json()
      if (data.price) exitPrice = parseFloat(data.price)
    } catch (e) {}

    const wentUp = exitPrice > round.entryPrice
    const won = (activeBet.direction === "UP" && wentUp) || (activeBet.direction === "DOWN" && !wentUp)
    const payout = won ? Math.round(activeBet.amount * 1.8 * 100) / 100 : 0

    const finalBalance = await db.$transaction(async (tx) => {
      await tx.round.update({ where: { id: round.id }, data: { exitPrice, status: "COMPLETED", endedAt: new Date() } })
      await tx.bet.update({ where: { id: activeBet.id }, data: { status: won ? "WON" : "LOST", payout } })

      const user = activeBet.user
      const updatedBalance = won ? user.balance + payout : user.balance
      
      if (won) {
        await tx.user.update({
          where: { id: user.id },
          data: { balance: updatedBalance, winnings: user.winnings + payout, profit: user.profit + (payout - activeBet.amount), wins: user.wins + 1, totalBets: user.totalBets + 1 }
        })
      } else {
        await tx.user.update({
          where: { id: user.id },
          data: { totalBets: user.totalBets + 1 }
        })
      }
      return updatedBalance
    })

    return NextResponse.json({
      activeBet: null,
      resolved: true,
      result: { roundId: round.roundId, coin: round.coin, direction: activeBet.direction, entryPrice: round.entryPrice, exitPrice, won, payout },
      balance: finalBalance,
    })
  } catch (error) {
    return NextResponse.json({ error: "Resolution engine crash" }, { status: 500 })
  }
}