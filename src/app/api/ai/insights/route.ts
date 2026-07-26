import { NextRequest, NextResponse } from "next/server"
import ZAI from "z-ai-web-dev-sdk"
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = applyRateLimit(req, RATE_LIMITS.ai)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await req.json()
    const { price, change, history } = body as {
      price?: number
      change?: number
      history?: number[]
    }

    if (price === undefined) {
      return NextResponse.json(
        { error: "Missing required field: price" },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const historySnippet = Array.isArray(history)
      ? history.slice(-10).join(", ")
      : "N/A"

    const direction = change !== undefined ? (change >= 0 ? "up" : "down") : "unknown"
    const changeStr = change !== undefined ? `${change >= 0 ? "+" : ""}${change.toFixed(2)}` : "N/A"

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are a cryptocurrency market analyst for a trading app called PredicTX. Provide brief, actionable prediction insights based on current price data. Keep your response to exactly 2-3 sentences. Be specific with price levels when relevant. Do not use markdown formatting.",
        },
        {
          role: "user",
          content: `Analyze Bitcoin's current price trend and give a brief prediction insight.

Current price: $${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
24h change: ${changeStr} (${direction})
Recent price history (last 10 points): ${historySnippet}

Provide a concise 2-3 sentence analysis of the current trend and what to watch for next.`,
        },
      ],
      thinking: { type: "disabled" },
    })

    const insight = completion.choices[0]?.message?.content?.trim()

    if (!insight) {
      return NextResponse.json(
        { error: "Failed to generate insight" },
        { status: 500 }
      )
    }

    return NextResponse.json({ insight })
  } catch (error) {
    console.error("AI Insights error:", error)
    return NextResponse.json(
      { error: "Failed to generate AI insight" },
      { status: 500 }
    )
  }
}
