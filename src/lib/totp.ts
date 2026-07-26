import { createHmac, randomBytes } from "crypto"

/**
 * Demo-friendly TOTP (Time-based One-Time Password) implementation.
 * Uses HMAC-SHA1, 30-second period, 6 digits — compatible with Google Authenticator.
 */

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
const PERIOD = 30
const DIGITS = 6

/** Encode a buffer to base32 (RFC 4648). */
function base32Encode(buffer: Buffer): string {
  let result = ""
  let bits = 0
  let value = 0
  for (const byte of buffer) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      result += BASE32_CHARS[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) {
    result += BASE32_CHARS[(value << (5 - bits)) & 31]
  }
  return result
}

/** Decode a base32 string to a buffer. */
function base32Decode(encoded: string): Buffer {
  const cleaned = encoded.replace(/=+$/, "").toUpperCase()
  let bits = 0
  let value = 0
  const output: number[] = []
  for (const char of cleaned) {
    const idx = BASE32_CHARS.indexOf(char)
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return Buffer.from(output)
}

/** Generate a new random base32 TOTP secret (20 bytes = 160 bits, standard). */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20))
}

/** Compute the TOTP code for a given secret and timestamp (default: now). */
export function computeTotp(secret: string, timestamp: number = Date.now()): string {
  const counter = Math.floor(timestamp / 1000 / PERIOD)
  const buffer = Buffer.alloc(8)
  // Write counter as big-endian 64-bit
  buffer.writeBigUInt64BE(BigInt(counter))

  const key = base32Decode(secret)
  const hmac = createHmac("sha1", key).update(buffer).digest()
  const offset = hmac[hmac.length - 1] & 0x0f
  const truncated =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  const code = truncated % 10 ** DIGITS
  return code.toString().padStart(DIGITS, "0")
}

/** Verify a TOTP code, allowing for ±1 time step drift (covers clock skew). */
export function verifyTotp(secret: string, code: string): boolean {
  if (!/^\d{6}$/.test(code)) return false
  const now = Date.now()
  // Check current window + previous + next
  for (const offset of [-1, 0, 1]) {
    const ts = now + offset * PERIOD * 1000
    if (computeTotp(secret, ts) === code) return true
  }
  return false
}

/** Build the otpauth:// URI for QR code scanning (Google Authenticator compatible). */
export function buildOtpauthUrl(secret: string, account: string, issuer: string = "CryptoPredictor"): string {
  const label = encodeURIComponent(`${issuer}:${account}`)
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(PERIOD),
  })
  return `otpauth://totp/${label}?${params.toString()}`
}
