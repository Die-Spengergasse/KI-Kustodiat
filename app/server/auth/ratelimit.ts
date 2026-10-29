/**
 * Login rate limiting (Issue #47).
 *
 * Two independent counters over a sliding window: per account (the `sam` that was
 * tried) and per client IP. Both live in `portal.login_attempts`, so a restart
 * does not reset a lockout and several app instances would share the count.
 *
 * The pure `evaluateRateLimit` is unit-tested; the query helpers below are the
 * only database access it needs.
 */

import { and, eq, sql, type SQL } from 'drizzle-orm'
import type { PortalRateLimitConfig } from '../config'
import type { PortalDatabase } from '../db/client'
import { loginAttempts } from '../db/schema'

export interface FailureWindow {
  failures: number
  /** Age of the oldest failure inside the window, in seconds. */
  oldestAgeSeconds: number
}

export interface RateLimitInput {
  account: FailureWindow
  ip: FailureWindow
  config: PortalRateLimitConfig
}

export interface RateLimitDecision {
  blocked: boolean
  /** Seconds until the oldest failure leaves the window. */
  retryAfterSeconds: number
  reason: 'account' | 'ip' | null
}

export const NO_FAILURES: FailureWindow = { failures: 0, oldestAgeSeconds: 0 }

export function evaluateRateLimit(input: RateLimitInput): RateLimitDecision {
  const { account, ip, config } = input

  if (account.failures >= config.accountLimit) {
    return {
      blocked: true,
      reason: 'account',
      retryAfterSeconds: Math.max(1, Math.round(config.windowSeconds - account.oldestAgeSeconds)),
    }
  }

  if (ip.failures >= config.ipLimit) {
    return {
      blocked: true,
      reason: 'ip',
      retryAfterSeconds: Math.max(1, Math.round(config.windowSeconds - ip.oldestAgeSeconds)),
    }
  }

  return { blocked: false, reason: null, retryAfterSeconds: 0 }
}

/** Failures inside the window for one account (`sam` is compared lower-case). */
export async function accountFailureWindow(
  db: PortalDatabase,
  config: PortalRateLimitConfig,
  sam: string,
): Promise<FailureWindow> {
  return failureWindow(db, config, eq(loginAttempts.sam, sam.toLowerCase()))
}

/** Failures inside the window from one client IP. */
export async function ipFailureWindow(
  db: PortalDatabase,
  config: PortalRateLimitConfig,
  ip: string,
): Promise<FailureWindow> {
  return failureWindow(db, config, eq(loginAttempts.ip, ip))
}

async function failureWindow(
  db: PortalDatabase,
  config: PortalRateLimitConfig,
  scope: SQL,
): Promise<FailureWindow> {
  const rows = await db
    .select({
      failures: sql<number>`count(*)::int`,
      oldest: sql<string | null>`min(${loginAttempts.createdAt})::text`,
    })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.success, false),
        sql`${loginAttempts.createdAt} > now() - (${config.windowSeconds} * interval '1 second')`,
        scope,
      ),
    )

  const row = rows[0]
  if (row === undefined || row.failures === 0 || row.oldest === null) return NO_FAILURES
  const oldestAgeSeconds = Math.max(0, (Date.now() - new Date(row.oldest).getTime()) / 1000)
  return { failures: row.failures, oldestAgeSeconds }
}

export async function recordAttempt(
  db: PortalDatabase,
  input: {
    ip: string
    sam: string
    success: boolean
    reason?: string | null
  },
): Promise<void> {
  await db.insert(loginAttempts).values({
    ip: input.ip,
    sam: input.sam.toLowerCase(),
    success: input.success,
    reason: input.reason ?? null,
  })
}

/** Housekeeping: the counters only need the window plus a little slack. */
export async function pruneAttempts(db: PortalDatabase): Promise<number> {
  const removed = await db
    .delete(loginAttempts)
    .where(sql`${loginAttempts.createdAt} < now() - interval '7 days'`)
    .returning({ id: loginAttempts.id })
  return removed.length
}
