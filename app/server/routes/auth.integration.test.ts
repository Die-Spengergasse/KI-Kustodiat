/**
 * HTTP-level integration test of `/api/auth/*` (Issue #47).
 *
 * Opt-in — needs PostgreSQL from `/etc/portal/portal.env` and the school
 * directory (the login path runs the real search-then-bind, only with wrong or
 * unknown credentials):
 *
 *   PORTAL_DB_TEST=1 PORTAL_LOGIN_ACCOUNT_LIMIT=3 npm test -- server/routes/auth.integration.test.ts
 *
 * Proves the negative contract: no session → 401, missing CSRF → 403, unknown
 * user → 401 (not 500), and the per-account lockout with lockout feedback.
 */

import { eq, sql } from 'drizzle-orm'
import Fastify, { type FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { loadPortalConfig } from '../config'
import { closeDatabase, getDatabase } from '../db/client'
import { auditLog, loginAttempts } from '../db/schema'
import { testConfig } from '../testing/fixtures'
import { registerAuthRoutes } from './auth'

const configResult = loadPortalConfig()
const enabled = process.env.PORTAL_DB_TEST === '1' && configResult.ok
const UNKNOWN_SAM = 'ap5-unknown-user-4711'
const LOCKOUT_SAM = 'ap5-lockout-user-4711'
/** A documentation-range IP, so the per-IP counter never mixes with other tests. */
const TEST_IP = '203.0.113.7'

interface IssuedCsrf {
  token: string
  cookie: string
}

// The block body runs even when skipped, so fall back to the fixture config.
const routeConfig = (configResult.ok ? configResult.config : null) ?? testConfig()

describe.skipIf(!enabled)('/api/auth', () => {
  const config = routeConfig
  let app: FastifyInstance

  async function csrf(): Promise<IssuedCsrf> {
    const response = await app.inject({ method: 'GET', url: '/api/auth/me' })
    const body = response.json() as { csrfToken: string }
    const cookie = response.cookies.find((c) => c.name === 'kik_csrf')
    if (cookie === undefined) throw new Error('no kik_csrf cookie issued')
    return { token: body.csrfToken, cookie: `${cookie.name}=${cookie.value}` }
  }

  beforeAll(async () => {
    // `trustProxy` mirrors the production app: the client IP comes from X-Forwarded-For.
    app = Fastify({ trustProxy: true })
    await registerAuthRoutes(app)
    await app.ready()
    // The counters live in the database, so a previous run must not lock this one.
    await getDatabase(config.databaseUrl).execute(
      sql`delete from portal.login_attempts where sam in (${UNKNOWN_SAM}, ${LOCKOUT_SAM}) or ip = ${TEST_IP}`,
    )
  })

  afterAll(async () => {
    await app.close()
    await closeDatabase()
  })

  it('answers 401 without a session and still hands out a CSRF token', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/auth/me' })
    expect(response.statusCode).toBe(401)
    expect(response.json()).toMatchObject({ authenticated: false })
    expect((response.json() as { csrfToken?: string }).csrfToken?.length).toBeGreaterThan(20)
    expect(response.headers['cache-control']).toBe('no-store')
  })

  it('rejects a login without a CSRF token (403)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: UNKNOWN_SAM, password: 'whatever' },
    })
    expect(response.statusCode).toBe(403)
    expect(response.json()).toEqual({ error: 'invalid_csrf' })
  })

  it('rejects an unknown user with 401 and records the attempt', async () => {
    const { token, cookie } = await csrf()
    const db = getDatabase(config.databaseUrl)
    const before = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(loginAttempts)
      .where(eq(loginAttempts.sam, UNKNOWN_SAM))
    const beforeCount = before[0]?.count ?? 0

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      headers: { cookie, 'x-csrf-token': token, 'x-forwarded-for': TEST_IP },
      payload: { username: UNKNOWN_SAM, password: 'whatever' },
    })
    expect(response.statusCode).toBe(401)
    expect(response.json()).toEqual({ error: 'invalid_credentials' })

    const after = await db
      .select({ count: sql<number>`count(*)::int`, success: loginAttempts.success })
      .from(loginAttempts)
      .where(eq(loginAttempts.sam, UNKNOWN_SAM))
      .groupBy(loginAttempts.success)
    const failed = after.find((row) => row.success === false)?.count ?? 0
    expect(failed).toBe(beforeCount + 1)

    const audit = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(auditLog)
      .where(eq(auditLog.event, 'login_failure'))
    expect(audit[0]?.count ?? 0).toBeGreaterThan(0)
  })

  it('locks the account after the configured number of failures (429 + Retry-After)', async () => {
    const accountSam = LOCKOUT_SAM
    const limit = config!.rateLimit.accountLimit
    const { token, cookie } = await csrf()

    for (let attempt = 0; attempt < limit; attempt += 1) {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        headers: { cookie, 'x-csrf-token': token, 'x-forwarded-for': TEST_IP },
        payload: { username: accountSam, password: 'wrong' },
      })
      expect(response.statusCode).toBe(401)
    }

    const locked = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      headers: { cookie, 'x-csrf-token': token, 'x-forwarded-for': TEST_IP },
      payload: { username: accountSam, password: 'wrong' },
    })
    expect(locked.statusCode).toBe(429)
    const body = locked.json() as { error: string; retryAfterSeconds: number; reason: string }
    expect(body.error).toBe('rate_limited')
    expect(body.reason).toBe('account')
    expect(body.retryAfterSeconds).toBeGreaterThan(0)
    expect(Number(locked.headers['retry-after'])).toBeGreaterThan(0)
  })

  it('rejects a logout without a CSRF token (403)', async () => {
    const response = await app.inject({ method: 'POST', url: '/api/auth/logout' })
    expect(response.statusCode).toBe(403)
  })

  it('answers 204 for a logout with a valid token and no session', async () => {
    const { token, cookie } = await csrf()
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: { cookie, 'x-csrf-token': token },
    })
    expect(response.statusCode).toBe(204)
  })
})
