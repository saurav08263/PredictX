import { createHash } from "crypto"
import { db } from "./db"

/**
 * Generate a unique, shareable referral code for a user.
 * Format: CP + 6 hex chars derived from userId + 2 random chars (8 chars total after prefix).
 * Ensures uniqueness by checking the DB on collision.
 */
export async function generateReferralCode(userId: string): Promise<string> {
  const hash = createHash("sha256").update(userId).digest("hex")
  const base = `CP${hash.slice(0, 6).toUpperCase()}`
  // Try base first, then with random suffix on collision
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate =
      attempt === 0 ? base : `${base}${Math.random().toString(36).slice(2, 4).toUpperCase()}`
    const existing = await db.user.findUnique({
      where: { referralCode: candidate },
      select: { id: true },
    })
    if (!existing || existing.id === userId) {
      return candidate
    }
  }
  // Fallback — append full random
  return `CP${hash.slice(0, 4).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

/** Ensure a user has a referral code; generate + persist if missing. Returns the code. */
export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  })
  if (user?.referralCode) return user.referralCode
  const code = await generateReferralCode(userId)
  await db.user.update({
    where: { id: userId },
    data: { referralCode: code },
  })
  return code
}
