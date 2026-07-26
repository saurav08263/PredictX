import { NextRequest, NextResponse } from "next/server"
import ZAI from "z-ai-web-dev-sdk"
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

export async function GET(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = applyRateLimit(req, RATE_LIMITS.ai)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const zai = await ZAI.create()

    const results = await zai.functions.invoke("web_search", {
      query: "crypto bitcoin latest news today",
      num: 10,
    })

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: "No news results found" },
        { status: 404 }
      )
    }

    // Take top 5 results and format them
    const news = results.slice(0, 5).map((item) => ({
      title: item.name || "Untitled",
      snippet: item.snippet || "",
      url: item.url || "",
      source: item.host_name || "",
      date: item.date || "",
    }))

    return NextResponse.json({ news })
  } catch (error) {
    console.error("Crypto News error:", error)
    return NextResponse.json(
      { error: "Failed to fetch crypto news" },
      { status: 500 }
    )
  }
}
