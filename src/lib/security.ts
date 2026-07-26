/**
 * Security utilities for API routes.
 * - CORS headers
 * - Input sanitization
 * - Response helpers with security headers
 */

/** Standard security headers applied to all API responses */
export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'self'",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
} as const

/**
 * Apply security headers to a Response.
 */
export function withSecurityHeaders(response: Response): Response {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }
  return response
}

/**
 * Sanitize a string input by removing dangerous characters and trimming.
 * Limits the string to a maximum length.
 */
export function sanitizeString(
  input: unknown,
  maxLength = 1000
): string {
  if (typeof input !== "string") return ""
  return input
    .replace(/[<>'"&]/g, (c) => {
      const entities: Record<string, string> = {
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#x27;",
        '"': "&quot;",
        "&": "&amp;",
      }
      return entities[c] || c
    })
    .slice(0, maxLength)
    .trim()
}

/**
 * Validate and sanitize a numeric input.
 * Returns null if invalid.
 */
export function sanitizeNumber(
  input: unknown,
  min?: number,
  max?: number
): number | null {
  if (typeof input === "number") {
    if (!isFinite(input)) return null
    if (min !== undefined && input < min) return null
    if (max !== undefined && input > max) return null
    return input
  }
  if (typeof input === "string") {
    const parsed = parseFloat(input)
    if (!isFinite(parsed)) return null
    if (min !== undefined && parsed < min) return null
    if (max !== undefined && parsed > max) return null
    return parsed
  }
  return null
}

/**
 * Validate that a value is one of the allowed enum values.
 */
export function sanitizeEnum<T extends string>(
  input: unknown,
  allowed: readonly T[]
): T | null {
  if (typeof input !== "string") return null
  if (allowed.includes(input as T)) return input as T
  return null
}

/**
 * Create a standardized error response with security headers.
 */
export function errorResponse(
  message: string,
  status = 400,
  extra?: Record<string, unknown>
): Response {
  const body: Record<string, unknown> = { error: message, ...extra }
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...SECURITY_HEADERS,
    },
  })
}

/**
 * Create a standardized success response with security headers.
 */
export function successResponse(
  data: Record<string, unknown>,
  status = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...SECURITY_HEADERS,
    },
  })
}
