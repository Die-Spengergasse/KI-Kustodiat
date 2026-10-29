/**
 * Server-side sessions in PostgreSQL (Issue #47).
 *
 * The browser only ever holds an opaque, HMAC-signed token in an `httpOnly`
 * cookie; the session row lives in `portal.sessions` and can be revoked without
 * touching the client. Expiry is rolling: every use extends `expires_at` (TTL)
 * as long as the session keeps being used at least once per idle window.
 */

import { and, eq, gt, isNull, lt, sql } from 'drizzle-orm'
import type { PortalConfig } from '../config'
import type { PortalDatabase } from '../db/client'
import { sessions, users } from '../db/schema'
import { randomToken, sha256Hex, signValue, verifySignedValue } from './tokens'

export const SESSION_COOKIE = 'kik_session'
export const CSRF_COOKIE = 'kik_csrf'
export const CSRF_HEADER = 'x-csrf-token'

/** Purpose strings bind a signature to exactly one cookie. */
export const SESSION_PURPOSE = 'kik.session'
export const CSRF_PURPOSE = 'kik.csrf'

/** Sliding window writes are throttled to one update per half minute. */
const TOUCH_INTERVAL_MS = 30_000

export type SessionRow = typeof sessions.$inferSelect
export type UserRow = typeof users.$inferSelect

export interface CookieOptions {
  secure: boolean
  httpOnly: boolean
  /** Seconds; omit for a session cookie that dies with the browser. */
  maxAgeSeconds?: number
  sameSite?: 'Lax' | 'Strict'
  path?: string
}

export function serializeCookie(name: string, value: string, options: CookieOptions): string {
  const parts = [`${name}=${value}`, `Path=${options.path ?? '/'}`]
  if (options.maxAgeSeconds !== undefined) parts.push(`Max-Age=${options.maxAgeSeconds}`)
  if (options.httpOnly) parts.push('HttpOnly')
  if (options.secure) parts.push('Secure')
  parts.push(`SameSite=${options.sameSite ?? 'Lax'}`)
  return parts.join('; ')
}

/** Deletes a cookie (same attributes, empty value, immediate expiry). */
export function clearCookie(name: string, secure: boolean): string {
  return serializeCookie(name, '', { secure, httpOnly: true, maxAgeSeconds: 0 })
}

export interface IssuedSession {
  token: string
  expiresAt: Date
  signedCookie: string
}

export async function createSession(
  db: PortalDatabase,
  config: PortalConfig,
  input: { userId: string; ip: string | null; userAgent: string | null },
): Promise<IssuedSession> {
  const token = randomToken(32)
  const expiresAt = new Date(Date.now() + config.sessionTtlSeconds * 1000)
  await db.insert(sessions).values({
    tokenHash: sha256Hex(token),
    userId: input.userId,
    expiresAt,
    lastSeenAt: new Date(),
    ip: input.ip,
    userAgent: input.userAgent?.slice(0, 500) ?? null,
  })
  return {
    token,
    expiresAt,
    signedCookie: signValue(config.sessionSecret, SESSION_PURPOSE, token),
  }
}

export interface ActiveSession {
  session: SessionRow
  user: UserRow
}

/**
 * Resolves a cookie value to a live session: signature → hash → row. Returns
 * `null` for forged, expired, revoked or idle-timed-out sessions, so callers can
 * treat every rejection identically.
 */
export async function loadSession(
  db: PortalDatabase,
  config: PortalConfig,
  signedCookie: string | undefined,
): Promise<ActiveSession | null> {
  const token = verifySignedValue(config.sessionSecret, SESSION_PURPOSE, signedCookie)
  if (token === null) return null

  const idleCutoff = new Date(Date.now() - config.sessionIdleSeconds * 1000)
  const rows = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, sha256Hex(token)),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, new Date()),
        gt(sessions.lastSeenAt, idleCutoff),
      ),
    )
    .limit(1)

  return rows[0] ?? null
}

/** Extends a session (rolling expiry); skipped when it was touched recently. */
export async function touchSession(
  db: PortalDatabase,
  config: PortalConfig,
  session: SessionRow,
): Promise<void> {
  const now = Date.now()
  if (now - session.lastSeenAt.getTime() < TOUCH_INTERVAL_MS) return
  await db
    .update(sessions)
    .set({ lastSeenAt: new Date(now), expiresAt: new Date(now + config.sessionTtlSeconds * 1000) })
    .where(eq(sessions.id, session.id))
}

/** Revokes the session behind a cookie; returns the affected user id, if any. */
export async function revokeSession(
  db: PortalDatabase,
  config: PortalConfig,
  signedCookie: string | undefined,
): Promise<string | null> {
  const token = verifySignedValue(config.sessionSecret, SESSION_PURPOSE, signedCookie)
  if (token === null) return null
  const rows = await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.tokenHash, sha256Hex(token)), isNull(sessions.revokedAt)))
    .returning({ userId: sessions.userId })
  return rows[0]?.userId ?? null
}

/** Housekeeping: drops sessions that can never be used again. */
export async function pruneSessions(db: PortalDatabase): Promise<number> {
  const removed = await db
    .delete(sessions)
    .where(lt(sessions.expiresAt, sql`now() - interval '7 days'`))
    .returning({ id: sessions.id })
  return removed.length
}
