import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { sanitizeNumber, sanitizeEnum, errorResponse } from "@/lib/security"

const validMethods = ["UPI", "Paytm", "G Pay", "PhonePe", "BANK"] as const
const MIN_WITHDRAW = 200
const MAX_WITHDRAW = 500000

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

    const withdrawAmount = sanitizeNumber(amount, MIN_WITHDRAW, MAX_WITHDRAW)
    if (withdrawAmount === null) {
      return errorResponse(`Amount must be between ${MIN_WITHDRAW} and ${MAX_WITHDRAW}`, 400)
    }

    const withdrawMethod = sanitizeEnum(method, validMethods) || "UPI"

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } })
      if (!user) throw new Error("User not found")

      if (user.balance < withdrawAmount) {
        throw new Error("Insufficient balance for withdrawal")
      }

      const newBalance = user.balance - withdrawAmount
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: newBalance },
      })

      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: "WITHDRAWAL",
          amount: withdrawAmount,
          status: "PENDING", // Withdrawals need approval
          method: withdrawMethod,
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
    console.error("Failed to withdraw:", error)
    if (error instanceof Error) {
      if (error.message === "User not found") {
        return errorResponse("User not found", 404)
      }
      if (error.message.includes("Insufficient")) {
        return errorResponse(error.message, 400)
      }
    }
    return errorResponse("Failed to process withdrawal", 500)
  }
}
