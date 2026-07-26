/**
 * Environment variable validation for the application.
 * All sensitive configuration should be loaded from environment variables.
 * This module provides type-safe access to all env vars with validation.
 */

class EnvError extends Error {
  constructor(key: string) {
    super(`[ENV] Missing required environment variable: ${key}`)
    this.name = "EnvError"
  }
}

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback
  if (value === undefined) {
    // In development, warn but don't throw
    if (process.env.NODE_ENV === "development") {
      console.warn(`[ENV] Missing environment variable: ${key}`)
      return ""
    }
    throw new EnvError(key)
  }
  return value
}

function getEnvInt(key: string, fallback: number): number {
  const raw = getEnv(key, String(fallback))
  const parsed = parseInt(raw, 10)
  if (isNaN(parsed)) {
    console.warn(`[ENV] Invalid integer for ${key}: "${raw}", using fallback ${fallback}`)
    return fallback
  }
  return parsed
}

function getEnvFloat(key: string, fallback: number): number {
  const raw = getEnv(key, String(fallback))
  const parsed = parseFloat(raw)
  if (isNaN(parsed)) {
    console.warn(`[ENV] Invalid float for ${key}: "${raw}", using fallback ${fallback}`)
    return fallback
  }
  return parsed
}

export const env = {
  /** Database URL for Prisma */
  databaseUrl: getEnv("DATABASE_URL", "file:./db/custom.db"),

  /** App configuration */
  nodeEnv: getEnv("NODE_ENV", "development"),
  isDev: getEnv("NODE_ENV", "development") === "development",
  isProd: getEnv("NODE_ENV", "development") === "production",

  /** Price service port */
  priceServicePort: getEnv("PRICE_SERVICE_PORT", "3003"),

  /** Bet multiplier */
  betMultiplier: getEnvFloat("BET_MULTIPLIER", 1.8),

  /** Min bet amount */
  minBet: getEnvInt("MIN_BET", 10),

  /** Max bet amount */
  maxBet: getEnvInt("MAX_BET", 100000),

  /** Polygon RPC URL (optional) */
  polygonRpcUrl: getEnv("POLYGON_RPC_URL", ""),

  /** USDC contract address (optional) */
  usdcContractAddress: getEnv("USDC_CONTRACT_ADDRESS", ""),
} as const

/**
 * Validate that all required environment variables are set.
 * Call this at app startup to catch missing vars early.
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const requiredVars = ["DATABASE_URL"]
  const missing = requiredVars.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error(
      `[ENV] Missing required environment variables: ${missing.join(", ")}`
    )
    return { valid: false, missing }
  }

  return { valid: true, missing: [] }
}
