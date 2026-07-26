import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { sanitizeNumber, sanitizeEnum, errorResponse } from "@/lib/security"

const validMethods = ["UPI", "Paytm", "G Pay", "PhonePe", "BANK"] as const
const MIN_DEPOSIT = 100
const MAX_DEPOSIT = 1000000

export async function POST(request: Request) {
  // Rate limiting
  const rateLimitResponse = applyRateLimit(request, RATE_LIMITS.wallet)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { userId, amount, method } = body

    if (!userId || typeof userId !== "string") {
      return errorResponse("Missing required field: userId", 400)
    }

    const depositAmount = sanitizeNumber(amount, MIN_DEPOSIT, MAX_DEPOSIT)
    if (depositAmount === null) {
      return errorResponse(`Amount must be between ${MIN_DEPOSIT} and ${MAX_DEPOSIT}`, 400)
    }

    const depositMethod = sanitizeEnum(method, validMethods) || "UPI"

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } })
      if (!user) throw new Error("User not found")

      const newBalance = user.balance + depositAmount
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: newBalance },
      })

      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: "DEPOSIT",
          amount: depositAmount,
          status: "COMPLETED",
          method: depositMethod,
          balanceBefore: user.balance,
          balanceAfter: newBalance,
        },
      })

      return { user: updatedUser, transaction }
    })

    return NextResponse.json({
      balance: result.user.balance,
      transaction: {
        id: result.transaction.id,
        type: result.transaction.type,
        amount: result.transaction.amount,
        method: result.transaction.method,
        status: result.transaction.status,
        createdAt: result.transaction.createdAt,
      },
    })
  } catch (error) {
    console.error("Failed to deposit:", error)
    if (error instanceof Error && error.message === "User not found") {
      return errorResponse("User not found", 404)
    }
    return errorResponse("Failed to process deposit", 500)
  }
}
