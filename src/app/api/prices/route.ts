import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const COINS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"] as const

const fallbacks: Record<string, number> = {
  BTCUSDT: 66916.0,
  ETHUSDT: 1829.38,
  SOLUSDT: 75.26,
}

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

export async function GET() {
  try {
    const results: Record<string, { price: number; source: string }> = {}

    for (const coin of COINS) {
      const price = await fetchBinancePrice(coin)
      results[coin] = {
        price: price ?? fallbacks[coin] ?? 0,
        source: price ? "binance" : "simulated",
      }
    }

    return NextResponse.json({
      prices: results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to get prices:", error)
    return NextResponse.json(
      { prices: fallbacks, timestamp: new Date().toISOString() },
      { status: 200 }
    )
  }
}
