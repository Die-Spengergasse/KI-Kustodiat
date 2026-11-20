/**
 * HTTP contract of `/api/credit` (Issue #64), against the real gateway and the
 * real portal schema.
 *
 *   PORTAL_DB_TEST=1 PORTAL_LITELLM_TEST=1 npm test -- server/routes/credit.integration.test.ts
 *
 * Proves the guard (401/403), the CSRF requirement, the validation contract and
 * that a top-up ends up in *both* places: `max_budget` at the gateway and a row
 * in `portal.credit_grant`. Everything it creates is removed again.
 */

import { sql } from 'drizzle-orm'
import Fastify, { type FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { issueCsrf } from '../auth/csrf'
import { deleteLitellmUser, provisionLitellmUser } from '../auth/provisioning'
import { createSession } from '../auth/sessions'
import { loadPortalConfig } from '../config'
import { closeDatabase, getDatabase } from '../db/client'
import { users, type Role } from '../db/schema'
import { createLitellmClient } from '../litellm/client'
import { testConfig } from '../testing/fixtures'
import { registerCreditRoutes } from './credit'

const configResult = loadPortalConfig()
const enabled =
  process.env.PORTAL_DB_TEST === '1' &&
  process.env.PORTAL_LITELLM_TEST === '1' &&
  configResult.ok &&
  configResult.config.litellm.adminKey !== ''
const routeConfig = (configResult.ok ? configResult.config : null) ?? testConfig()

const ADMIN_SAM = 'ap64-admin'
const TEACHER_SAM = 'ap64-teacher'
const STUDENT_SAM = 'ap64-student'

interface Session {
  cookie: string
  csrfToken: string
}

describe.skipIf(!enabled)('/api/credit', () => {
  const config = routeConfig
  let app: FastifyInstance
  let admin: Session
  let teacher: Session

  async function sessionFor(sam: string, role: Role): Promise<Session> {
    const db = getDatabase(config.databaseUrl)
    const rows = await db
      .insert(users)
      .values({
        sam,
        displayName: `AP64 ${role}`,
        mail: null,
        ldapDn: `CN=${sam},OU=Lehrer,OU=Automatisch gewartete Benutzer,DC=test`,
        role,
        litellmUserId: sam,
      })
      .onConflictDoUpdate({ target: users.sam, set: { role, updatedAt: new Date() } })
      .returning({ id: users.id })
    const userId = rows[0]?.id
    if (userId === undefined) throw new Error('could not create test user')

    await provisionLitellmUser(config.litellm, { userId: sam, alias: sam, mail: null })
    const session = await createSession(db, config, {
      userId,
      ip: '203.0.113.64',
      userAgent: 'vitest',
    })
    const csrf = issueCsrf(config)
    return {
      cookie: `kik_session=${session.signedCookie}; kik_csrf=${csrf.cookieValue}`,
      csrfToken: csrf.token,
    }
  }

  function headers(session: Session | null, withCsrf = true): Record<string, string> {
    if (session === null) return {}
    return {
      cookie: session.cookie,
      ...(withCsrf ? { 'x-csrf-token': session.csrfToken } : {}),
    }
  }

  beforeAll(async () => {
    for (const sam of [ADMIN_SAM, TEACHER_SAM, STUDENT_SAM]) {
      await deleteLitellmUser(config.litellm, sam).catch(() => undefined)
    }

    app = Fastify({ trustProxy: true })
    await registerCreditRoutes(app)
    await app.ready()
    admin = await sessionFor(ADMIN_SAM, 'admin')
    teacher = await sessionFor(TEACHER_SAM, 'teacher')
    // The student is the account that gets topped up; give it an allowance.
    await sessionFor(STUDENT_SAM, 'student')
    await createLitellmClient(config.litellm).setUserBudget({
      userId: STUDENT_SAM,
      maxBudgetUsd: 5,
    })
  })

  afterAll(async () => {
    const db = getDatabase(config.databaseUrl)
    await db.execute(
      sql`delete from portal.audit_log where sam in (${ADMIN_SAM}, ${TEACHER_SAM}, ${STUDENT_SAM})`,
    )
    await db.execute(
      sql`delete from portal.users where sam in (${ADMIN_SAM}, ${TEACHER_SAM}, ${STUDENT_SAM})`,
    )
    for (const sam of [ADMIN_SAM, TEACHER_SAM, STUDENT_SAM]) {
      await deleteLitellmUser(config.litellm, sam).catch(() => undefined)
    }
    await app.close()
    await closeDatabase()
  })

  it('answers 401 without a session', async () => {
    const list = await app.inject({ method: 'GET', url: '/api/credit/users' })
    expect(list.statusCode).toBe(401)
    expect(list.headers['cache-control']).toBe('no-store')

    const topUp = await app.inject({
      method: 'POST',
      url: `/api/credit/users/${STUDENT_SAM}/credit`,
      payload: { amountUsd: 1 },
    })
    expect(topUp.statusCode).toBe(401)
  })

  it('answers 403 for a non-admin, for a missing CSRF token and for an unknown path', async () => {
    const list = await app.inject({
      method: 'GET',
      url: '/api/credit/users',
      headers: headers(teacher),
    })
    expect(list.statusCode).toBe(403)
    expect(list.json()).toMatchObject({ error: 'forbidden' })

    const noCsrf = await app.inject({
      method: 'POST',
      url: `/api/credit/users/${STUDENT_SAM}/credit`,
      headers: headers(admin, false),
      payload: { amountUsd: 1 },
    })
    expect(noCsrf.statusCode).toBe(403)
    expect(noCsrf.json()).toMatchObject({ error: 'invalid_csrf' })

    // The role guard runs before the CSRF check; a teacher without a token is
    // still a 403, just not the CSRF one.
    const teacherNoCsrf = await app.inject({
      method: 'POST',
      url: `/api/credit/users/${STUDENT_SAM}/credit`,
      headers: headers(teacher, false),
      payload: { amountUsd: 1 },
    })
    expect(teacherNoCsrf.statusCode).toBe(403)

    // `/api/credit` is the path, not `/api/admin` — that one is nginx-blocked.
    const wrong = await app.inject({
      method: 'GET',
      url: '/api/credit/unknown',
      headers: headers(admin),
    })
    expect(wrong.statusCode).toBe(404)
  })

  it('lists accounts with their allowance for an admin', async () => {
    const list = await app.inject({
      method: 'GET',
      url: '/api/credit/users',
      headers: headers(admin),
    })
    expect(list.statusCode).toBe(200)
    const body = list.json() as {
      users: Array<{ sam: string; maxBudgetUsd: number | null; grantedUsd: number }>
      maxCreditUsd: number
    }
    expect(body.maxCreditUsd).toBe(config.admin.maxCreditUsd)
    expect(body.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sam: STUDENT_SAM, maxBudgetUsd: 5, grantedUsd: 0 }),
      ]),
    )

    const search = await app.inject({
      method: 'GET',
      url: `/api/credit/users?q=${STUDENT_SAM}`,
      headers: headers(admin),
    })
    const filtered = search.json() as { users: Array<{ sam: string }> }
    expect(filtered.users.map((user) => user.sam)).toEqual([STUDENT_SAM])
  })

  it('validates the amount and the target before touching the gateway', async () => {
    for (const payload of [{ amountUsd: 0 }, { amountUsd: -2 }, { amountUsd: '2,50' }]) {
      const response = await app.inject({
        method: 'POST',
        url: `/api/credit/users/${STUDENT_SAM}/credit`,
        headers: headers(admin),
        payload,
      })
      expect(response.statusCode).toBe(400)
      expect(response.json()).toMatchObject({ error: 'amount_invalid' })
    }

    const tooLarge = await app.inject({
      method: 'POST',
      url: `/api/credit/users/${STUDENT_SAM}/credit`,
      headers: headers(admin),
      payload: { amountUsd: config.admin.maxCreditUsd + 1 },
    })
    expect(tooLarge.statusCode).toBe(400)
    expect(tooLarge.json()).toMatchObject({ error: 'amount_too_large' })

    const unknown = await app.inject({
      method: 'POST',
      url: '/api/credit/users/ap64-nobody/credit',
      headers: headers(admin),
      payload: { amountUsd: 1 },
    })
    expect(unknown.statusCode).toBe(404)

    const invalidSam = await app.inject({
      method: 'POST',
      url: '/api/credit/users/bad%20sam/credit',
      headers: headers(admin),
      payload: { amountUsd: 1 },
    })
    expect(invalidSam.statusCode).toBe(404)

    // The gateway budget is still the untouched 5.
    const gatewayUser = await createLitellmClient(config.litellm).getUser(STUDENT_SAM)
    expect(gatewayUser?.maxBudgetUsd).toBe(5)
  })

  it('refuses a target without a monthly allowance', async () => {
    const response = await app.inject({
      method: 'POST',
      url: `/api/credit/users/${TEACHER_SAM}/credit`,
      headers: headers(admin),
      payload: { amountUsd: 1 },
    })
    expect(response.statusCode).toBe(409)
    expect(response.json()).toMatchObject({ error: 'budget_not_initialized' })
  })

  it('raises the allowance, keeps the period and records the grant', async () => {
    const before = await createLitellmClient(config.litellm).getUser(STUDENT_SAM)
    expect(before?.budgetDuration).toBe('1mo')

    const response = await app.inject({
      method: 'POST',
      url: `/api/credit/users/${STUDENT_SAM}/credit`,
      headers: headers(admin),
      payload: { amountUsd: 2.5, note: 'Nachtest AP64' },
    })
    expect(response.statusCode).toBe(200)
    const body = response.json() as {
      user: { sam: string; maxBudgetUsd: number; availableUsd: number; grantedUsd: number }
    }
    expect(body.user).toMatchObject({
      sam: STUDENT_SAM,
      maxBudgetUsd: 7.5,
      availableUsd: 7.5,
      grantedUsd: 2.5,
    })

    const after = await createLitellmClient(config.litellm).getUser(STUDENT_SAM)
    expect(after?.maxBudgetUsd).toBe(7.5)
    // The top-up must not move the period.
    expect(after?.budgetDuration).toBe('1mo')
    expect(after?.budgetResetAt).toBe(before?.budgetResetAt)

    const db = getDatabase(config.databaseUrl)
    const grant = await db.execute<{
      amount_usd: string
      max_budget_after_usd: string
      note: string
      resets_at: Date | null
    }>(
      sql`select amount_usd, max_budget_after_usd, note, resets_at
          from portal.credit_grant
          where note = 'Nachtest AP64'`,
    )
    expect(grant.rows[0]).toMatchObject({
      amount_usd: '2.50',
      max_budget_after_usd: '7.50',
      note: 'Nachtest AP64',
    })
    expect(grant.rows[0]?.resets_at?.toISOString()).toBe(after?.budgetResetAt ?? undefined)

    const audit = await db.execute<{ sam: string; detail: string }>(
      sql`select sam, detail from portal.audit_log
          where event = 'credit_granted' and sam = ${STUDENT_SAM}`,
    )
    expect(audit.rows[0]).toMatchObject({ sam: STUDENT_SAM })
    expect(audit.rows[0]?.detail).toContain(`von ${ADMIN_SAM}`)
    expect(audit.rows[0]?.detail).toContain('+2.50 USD')

    // A second list shows the grant for the running period.
    const list = await app.inject({
      method: 'GET',
      url: `/api/credit/users?q=${STUDENT_SAM}`,
      headers: headers(admin),
    })
    const listed = list.json() as { users: Array<{ sam: string; grantedUsd: number }> }
    expect(listed.users[0]).toMatchObject({ sam: STUDENT_SAM, grantedUsd: 2.5 })
  })
})
