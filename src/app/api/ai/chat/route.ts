import { NextRequest, NextResponse } from "next/server"
import ZAI from "z-ai-web-dev-sdk"
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = applyRateLimit(req, RATE_LIMITS.ai)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await req.json()
    const { message, context } = body as {
      message?: string
      context?: { price?: number; balance?: number; change?: number }
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing required field: message" },
        { status: 400 }
      )
    }

    // Sanitize input - limit message length
    const sanitizedMessage = message.slice(0, 500)

    const zai = await ZAI.create()

    // Build context description for the AI
    const contextParts: string[] = []
    if (context?.price !== undefined) {
      contextParts.push(`Current Bitcoin price: $${context.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    }
    if (context?.balance !== undefined) {
      contextParts.push(`User's balance: $${context.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    }
    if (context?.change !== undefined) {
      const dir = context.change >= 0 ? "up" : "down"
      contextParts.push(`24h price change: ${context.change >= 0 ? "+" : ""}${context.change.toFixed(2)} (${dir})`)
    }

    const contextStr = contextParts.length > 0
      ? `\n\nCurrent context:\n${contextParts.join("\n")}`
      : ""

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are a crypto trading assistant for the PredicTX app. Help users understand price movements and make informed predictions. Keep responses concise (2-3 sentences). Be helpful but remind users this is not financial advice. Do not use markdown formatting.",
        },
        {
          role: "user",
          content: `${sanitizedMessage}${contextStr}`,
        },
      ],
      thinking: { type: "disabled" },
    })

    const response = completion.choices[0]?.message?.content?.trim()

    if (!response) {
      return NextResponse.json(
        { error: "Failed to generate response" },
        { status: 500 }
      )
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error("AI Chat error:", error)
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    )
  }
}
