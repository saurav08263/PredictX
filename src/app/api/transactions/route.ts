import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      )
    }

    const transactions = await db.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Failed to get transactions:", error)
    return NextResponse.json(
      { error: "Failed to get transactions" },
      { status: 500 }
    )
  }
}
