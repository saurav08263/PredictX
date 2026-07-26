import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

if (!(global as any).activeRoundsMap) {
  (global as any).activeRoundsMap = new Map()
}
const activeRounds = (global as any).activeRoundsMap

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const coin = searchParams.get("coin") || "BTCUSDT"
    const duration = parseInt(searchParams.get("duration") || "10", 10) // Fallback default tightly bound to selected value

    const mapKey = `${coin}-${duration}`
    const now = Date.now()
    let current = activeRounds.get(mapKey)

    // Clear and build static memory frames
    if (!current || (now - current.startedAt) >= current.duration * 1000) {
      current = {
        roundId: `ROUND-${coin}-${duration}-${now}`,
        startedAt: now,
        duration: duration,
        entryPrice: 60000
      }
      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${coin}`, { cache: "no-store" })
        const data = await res.json()
        if (data.price) current.entryPrice = parseFloat(data.price)
      } catch (e) {
        console.log("Binance fallback stream handled")
      }
      activeRounds.set(mapKey, current)
    }

    const elapsedSeconds = (now - current.startedAt) / 1000
    const timeLeft = Math.max(0, Math.ceil(current.duration - elapsedSeconds))

    return NextResponse.json({
      roundId: current.roundId,
      entryPrice: current.entryPrice,
      timeLeft,
      duration: current.duration,
      coin
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal engine error" }, { status: 500 })
  }
}