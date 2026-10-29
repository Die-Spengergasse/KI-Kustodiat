/**
 * Token helpers shared by sessions and CSRF protection (Issue #47).
 *
 * Cookie values are `<token>.<hmac>` where the HMAC is keyed with
 * `PORTAL_SESSION_SECRET` and bound to a purpose string. That makes a forged or
 * reused-in-the-wrong-place cookie worthless before any database lookup happens,
 * and it survives a cookie-tossing attempt from another sub-domain.
 */

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url')
}

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function hmac(secret: string, purpose: string, value: string): string {
  return createHmac('sha256', secret).update(`${purpose}:${value}`).digest('base64url')
}

/** Constant-time comparison that never throws on differing lengths. */
export function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/** `<value>.<hmac>` for the given purpose. */
export function signValue(secret: string, purpose: string, value: string): string {
  return `${value}.${hmac(secret, purpose, value)}`
}

/** Returns the unsigned value, or `null` when the signature does not match. */
export function verifySignedValue(
  secret: string,
  purpose: string,
  signed: string | undefined,
): string | null {
  if (signed === undefined || signed === '') return null
  const separator = signed.lastIndexOf('.')
  if (separator <= 0 || separator === signed.length - 1) return null
  const value = signed.slice(0, separator)
  const signature = signed.slice(separator + 1)
  return safeEqual(signature, hmac(secret, purpose, value)) ? value : null
}
