import { cookies } from "next/headers"
import { createHash } from "crypto"
import { db } from "./db"

export const AUTH_COOKIE = "cp_uid"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/** Hash a password with sha256 (demo-grade; use bcrypt/argon2 in production). */
export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

/** Read the authenticated user's ID from the HTTP-only cookie. */
export async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const uid = cookieStore.get(AUTH_COOKIE)?.value
  if (!uid) return null
  return uid
}

/** Set the auth cookie (called after successful login/signup). */
export async function setAuthUserId(userId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })
}

/** Clear the auth cookie (called on logout). */
export async function clearAuthUserId(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE)
}

/** Get the full User record for the current request, or null if not logged in. */
export async function getCurrentUser() {
  const uid = await getAuthUserId()
  if (!uid) return null
  try {
    return await db.user.findUnique({ where: { id: uid } })
  } catch {
    return null
  }
}

/** Generate a random 6-digit OTP code. */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/** Generate a random Google-style display name. */
export function generateGoogleName(): string {
  const adjectives = ["Crypto", "Alpha", "Diamond", "Lunar", "Stellar", "Apex", "Quantum", "Neo"]
  const nouns = ["Trader", "Whale", "Bull", "Hunter", "Pirate", "Pilot", "Ninja", "King"]
  const a = adjectives[Math.floor(Math.random() * adjectives.length)]
  const n = nouns[Math.floor(Math.random() * nouns.length)]
  return `${a} ${n}`
}

/** Generate a random unique email for simulated Google sign-in. */
export function generateGoogleEmail(): string {
  return `guser_${Math.random().toString(36).slice(2, 10)}@gmail.com`
}

/** Mask a phone number for display. */
export function maskPhone(phone: string): string {
  if (phone.length < 4) return phone
  return phone.slice(0, 3) + "•••••" + phone.slice(-3)
}
