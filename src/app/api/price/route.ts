import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const COINS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"] as const

async function fetchBinancePrice(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`,
      { signal: AbortSignal.timeout(5000), cache: "no-store" }
    )
    if (!res.ok) return null
    const data = await res.json()
    return parseFloat(data.price)
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const coin = searchParams.get("coin") || "BTCUSDT"

    if (!COINS.includes(coin as any)) {
      return NextResponse.json(
        { error: `Invalid coin. Must be one of: ${COINS.join(", ")}` },
        { status: 400 }
      )
    }

    const price = await fetchBinancePrice(coin)

    if (price === null) {
      // Fallback simulated price
      const fallbacks: Record<string, number> = {
        BTCUSDT: 66916.0,
        ETHUSDT: 1829.38,
        SOLUSDT: 75.26,
      }
      return NextResponse.json({
        coin,
        price: fallbacks[coin] || 0,
        source: "simulated",
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      coin,
      price,
      source: "binance",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to get price:", error)
    return NextResponse.json(
      { error: "Failed to retrieve price" },
      { status: 500 }
    )
  }
}
