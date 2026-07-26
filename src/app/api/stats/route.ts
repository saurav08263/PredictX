import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Total users (simulated online count with some randomness for realism)
    const totalUsers = await db.user.count()
    const usersOnline = Math.max(totalUsers, Math.floor(1200 + Math.random() * 800))

    // Total payouts today from won bets
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const wonBetsToday = await db.bet.findMany({
      where: {
        status: "WON",
        createdAt: { gte: today },
      },
    })

    const totalPayoutsToday = wonBetsToday.reduce((sum, bet) => sum + bet.payout, 0)

    // If no real data yet, show simulated totals
    const displayPayouts =
      totalPayoutsToday > 0
        ? totalPayoutsToday
        : 2845000 + Math.floor(Math.random() * 500000)

    // Top winners from bet data
    const topWinners = await db.bet.findMany({
      where: { status: "WON", payout: { gt: 0 } },
      include: {
        user: {
          select: { name: true, avatar: true, country: true },
        },
      },
      orderBy: { payout: "desc" },
      take: 5,
    })

    // If no real winners yet, provide simulated data
    const displayWinners =
      topWinners.length > 0
        ? topWinners.map((b) => ({
            name: b.user.name,
            avatar: b.user.avatar,
            country: b.user.country,
            amount: b.payout,
            direction: b.direction,
          }))
        : [
            { name: "CryptoKing99", avatar: "/images/winner-1.png", country: "IN", amount: 45600, direction: "UP" },
            { name: "SatoshiDev", avatar: "/images/winner-2.png", country: "US", amount: 32100, direction: "DOWN" },
            { name: "BlockHunter", avatar: "/images/winner-3.png", country: "GB", amount: 28900, direction: "UP" },
            { name: "DexMaster", avatar: "/images/winner-4.png", country: "JP", amount: 21400, direction: "UP" },
            { name: "NodeRunner", avatar: "/images/winner-5.png", country: "AE", amount: 18700, direction: "DOWN" },
          ]

    return NextResponse.json({
      usersOnline,
      totalPayoutsToday: displayPayouts,
      topWinners: displayWinners,
    })
  } catch (error) {
    console.error("Failed to get stats:", error)
    return NextResponse.json(
      { error: "Failed to retrieve stats" },
      { status: 500 }
    )
  }
}
