import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"

export async function loginService(
  email: string,
  password: string
) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  })

  return await res.json()
}

export async function googleLoginService() {
  const result = await signInWithPopup(
    auth,
    googleProvider
  )

  const user = result.user

  if (!user.email) {
    throw new Error("Google email not found")
  }

  const res = await fetch(
    "/api/auth/google",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        name:
          user.displayName ||
          "Trader",
      }),
    }
  )

  return await res.json()
}

export async function logoutService() {
  await fetch("/api/auth/logout", {
    method: "POST",
  })
}

export async function fetchUser() {
  const res = await fetch("/api/user")

  if (!res.ok) return null

  return await res.json()
}