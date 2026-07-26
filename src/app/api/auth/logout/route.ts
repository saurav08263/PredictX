import { NextResponse } from "next/server"
import { clearAuthUserId } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    await clearAuthUserId()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 })
  }
}
