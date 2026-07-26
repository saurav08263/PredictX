/**
 * Simple in-memory rate limiter for API routes.
 * Tracks requests per IP/key within a sliding window.
 */

type RateLimitEntry = {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 60 seconds
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) {
        store.delete(key)
      }
    }
  }, 60_000)
}

export type RateLimitConfig = {
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Window duration in seconds */
  windowSeconds: number
}

export const RATE_LIMITS = {
  /** For placing bets - stricter limit */
  bet: { limit: 30, windowSeconds: 60 },
  /** For general API calls */
  api: { limit: 60, windowSeconds: 60 },
  /** For AI endpoints - expensive, more restrictive */
  ai: { limit: 10, windowSeconds: 60 },
  /** For wallet operations */
  wallet: { limit: 10, windowSeconds: 60 },
  /** For auth operations - stricter to prevent brute force */
  auth: { limit: 20, windowSeconds: 60 },
} as const

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    // New window
    const resetAt = now + config.windowSeconds * 1000
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: config.limit - 1, resetAt }
  }

  if (entry.count >= config.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count += 1
  return { allowed: true, remaining: config.limit - entry.count, resetAt: entry.resetAt }
}

/**
 * Extract client identifier from request for rate limiting.
 * Uses X-Forwarded-For header or falls back to a generic key.
 */
export function getClientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  return "global"
}

/**
 * Apply rate limiting to an API route handler.
 * Returns a Response if rate limited, null if allowed.
 */
export function applyRateLimit(
  request: Request,
  config: RateLimitConfig
): Response | null {
  const clientId = getClientId(request)
  const result = checkRateLimit(`rl:${clientId}:${config.limit}:${config.windowSeconds}`, config)

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
        },
      }
    )
  }

  return null
}
