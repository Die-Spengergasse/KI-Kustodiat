/**
 * HTTP contract of `/api/keys` (Issue #48), against the real gateway and the
 * real portal schema.
 *
 *   PORTAL_DB_TEST=1 PORTAL_LITELLM_TEST=1 npm test -- server/routes/keys.integration.test.ts
 *
 * Proves the negative contract (401 without a session, 403 without CSRF), the
 * show-once rule, the soft limit and the cross-user isolation (a foreign key is a
 * 404, never a 403 — no existence leak). Everything it creates is removed again.
 */

import { sql } from 'drizzle-orm'
import Fastify, { type FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { issueCsrf } from '../auth/csrf'
import { deleteLitellmUser, provisionLitellmUser } from '../auth/provisioning'
import { createSession } from '../auth/sessions'
import { loadPortalConfig } from '../config'
import { closeDatabase, getDatabase } from '../db/client'
import { users } from '../db/schema'
import { testConfig } from '../testing/fixtures'
import { registerKeyRoutes } from './keys'

const configResult = loadPortalConfig()
const enabled =
  process.env.PORTAL_DB_TEST === '1' &&
  process.env.PORTAL_LITELLM_TEST === '1' &&
  configResult.ok &&
  configResult.config.litellm.adminKey !== ''
const routeConfig = (configResult.ok ? configResult.config : null) ?? testConfig()

const OWNER_SAM = 'ap48-key-owner'
const OTHER_SAM = 'ap48-key-other'
const TOKEN_PATTERN = /^[0-9a-f]{64}$/

interface Session {
  cookie: string
  csrfToken: string
}

describe.skipIf(!enabled)('/api/keys', () => {
  const config = routeConfig
  let app: FastifyInstance
  let owner: Session
  let other: Session
  let ownerToken: string
  let ownerSecret: string

  async function sessionFor(sam: string): Promise<Session> {
    const db = getDatabase(config.databaseUrl)
    const rows = await db
      .insert(users)
      .values({
        sam,
        displayName: `AP48 ${sam}`,
        mail: null,
        ldapDn: `CN=${sam},OU=Lehrer,OU=Automatisch gewartete Benutzer,DC=test`,
        role: 'teacher',
        litellmUserId: sam,
      })
      .onConflictDoUpdate({ target: users.sam, set: { updatedAt: new Date() } })
      .returning({ id: users.id })
    const userId = rows[0]?.id
    if (userId === undefined) throw new Error('could not create test user')

    await provisionLitellmUser(config.litellm, { userId: sam, alias: sam, mail: null })
    const session = await createSession(db, config, {
      userId,
      ip: '203.0.113.48',
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
    await deleteLitellmUser(config.litellm, OWNER_SAM).catch(() => undefined)
    await deleteLitellmUser(config.litellm, OTHER_SAM).catch(() => undefined)

    app = Fastify({ trustProxy: true })
    await registerKeyRoutes(app)
    await app.ready()
    owner = await sessionFor(OWNER_SAM)
    other = await sessionFor(OTHER_SAM)
  })

  afterAll(async () => {
    const db = getDatabase(config.databaseUrl)
    await db.execute(sql`delete from portal.audit_log where sam in (${OWNER_SAM}, ${OTHER_SAM})`)
    await db.execute(sql`delete from portal.users where sam in (${OWNER_SAM}, ${OTHER_SAM})`)
    await deleteLitellmUser(config.litellm, OWNER_SAM).catch(() => undefined)
    await deleteLitellmUser(config.litellm, OTHER_SAM).catch(() => undefined)
    await app.close()
    await closeDatabase()
  })

  it('answers 401 without a session and 403 without a CSRF token', async () => {
    const anonymous = await app.inject({ method: 'GET', url: '/api/keys' })
    expect(anonymous.statusCode).toBe(401)
    expect(anonymous.headers['cache-control']).toBe('no-store')

    const noCsrf = await app.inject({
      method: 'POST',
      url: '/api/keys',
      headers: headers(owner, false),
      payload: { label: 'no csrf' },
    })
    expect(noCsrf.statusCode).toBe(403)
    expect(noCsrf.json()).toMatchObject({ error: 'invalid_csrf' })
  })

  it('creates exactly one clear-text secret, lists the key and stores no secret', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/keys',
      headers: headers(owner),
      payload: { label: 'Integrationstest' },
    })

    expect(created.statusCode).toBe(201)
    expect(created.headers['cache-control']).toBe('no-store')
    const body = created.json() as { secret: string; key: { token: string; label: string } }
    expect(body.secret).toMatch(/^sk-/)
    expect(body.key.token).toMatch(TOKEN_PATTERN)
    expect(body.key.label).toBe('Integrationstest')
    ownerToken = body.key.token
    ownerSecret = body.secret

    const list = await app.inject({ method: 'GET', url: '/api/keys', headers: headers(owner) })
    expect(list.statusCode).toBe(200)
    const listed = list.json() as { limit: number; keys: Array<{ token: string; label: string }> }
    expect(listed.limit).toBe(config.keys.maxActiveKeys.teacher)
    expect(listed.keys).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ token: ownerToken, label: 'Integrationstest' }),
      ]),
    )
    expect(JSON.stringify(listed)).not.toContain(ownerSecret)

    // Only the hash is persisted; the clear-text key appears in no portal row.
    const db = getDatabase(config.databaseUrl)
    const leak = await db.execute<{ count: string }>(
      sql`select count(*)::text as count from portal.key_meta where token_hash = ${ownerSecret}`,
    )
    expect(leak.rows[0]?.count).toBe('0')
    const meta = await db.execute<{ token_hash: string; label: string }>(
      sql`select token_hash, label from portal.key_meta where token_hash = ${ownerToken}`,
    )
    expect(meta.rows[0]).toMatchObject({ token_hash: ownerToken, label: 'Integrationstest' })
  })

  it('hides another user’s key behind 404 and keeps their list empty', async () => {
    const otherList = await app.inject({
      method: 'GET',
      url: '/api/keys',
      headers: headers(other),
    })
    expect((otherList.json() as { keys: unknown[] }).keys).toEqual([])

    const foreignRevoke = await app.inject({
      method: 'DELETE',
      url: `/api/keys/${ownerToken}`,
      headers: headers(other),
    })
    expect(foreignRevoke.statusCode).toBe(404)

    const foreignRotate = await app.inject({
      method: 'POST',
      url: `/api/keys/${ownerToken}/rotate`,
      headers: headers(other),
    })
    expect(foreignRotate.statusCode).toBe(404)

    // The owner's key is still there after both attempts.
    const list = await app.inject({ method: 'GET', url: '/api/keys', headers: headers(owner) })
    expect((list.json() as { keys: Array<{ token: string }> }).keys).toEqual(
      expect.arrayContaining([expect.objectContaining({ token: ownerToken })]),
    )
  })

  it('rotates with the same label and revokes the old key', async () => {
    const rotated = await app.inject({
      method: 'POST',
      url: `/api/keys/${ownerToken}/rotate`,
      headers: headers(owner),
    })
    expect(rotated.statusCode).toBe(201)
    const body = rotated.json() as {
      secret: string
      key: { token: string; label: string }
      revokedOld: boolean
    }
    expect(body.key.token).not.toBe(ownerToken)
    expect(body.key.label).toBe('Integrationstest')
    expect(body.secret).toMatch(/^sk-/)
    expect(body.revokedOld).toBe(true)

    const list = await app.inject({ method: 'GET', url: '/api/keys', headers: headers(owner) })
    const keys = (list.json() as { keys: Array<{ token: string; status: string }> }).keys
    expect(keys.find((key) => key.token === ownerToken)?.status).toBe('revoked')
    expect(keys.find((key) => key.token === body.key.token)?.status).toBe('active')
  })

  it('revokes the key and leaves a trail in key_meta and the audit log', async () => {
    const list = await app.inject({ method: 'GET', url: '/api/keys', headers: headers(owner) })
    const active = (list.json() as { keys: Array<{ token: string; status: string }> }).keys.find(
      (key) => key.status === 'active',
    )
    if (active === undefined) throw new Error('no active key to revoke')

    const revoked = await app.inject({
      method: 'DELETE',
      url: `/api/keys/${active.token}`,
      headers: headers(owner),
    })
    expect(revoked.statusCode).toBe(200)

    const db = getDatabase(config.databaseUrl)
    const meta = await db.execute<{ revoke_reason: string; revoked: boolean }>(
      sql`select revoke_reason, revoked_at is not null as revoked from portal.key_meta where token_hash = ${active.token}`,
    )
    expect(meta.rows[0]).toMatchObject({ revoke_reason: 'user', revoked: true })

    const events = await db.execute<{ event: string }>(
      sql`select event from portal.audit_log where sam = ${OWNER_SAM} order by id`,
    )
    const names = events.rows.map((row) => row.event)
    expect(names).toEqual(
      expect.arrayContaining(['budget_set', 'key_created', 'key_rotated', 'key_revoked']),
    )
    // No key material in the audit trail.
    const auditText = await db.execute<{ count: string }>(
      sql`select count(*)::text as count from portal.audit_log where detail like ${`%${ownerSecret.slice(0, 12)}%`}`,
    )
    expect(auditText.rows[0]?.count).toBe('0')
  })

  it('rejects the key after the soft limit with a clear error', async () => {
    const limit = config.keys.maxActiveKeys.teacher
    const created: string[] = []
    for (let index = 0; index < limit; index += 1) {
      const response = await app.inject({
        method: 'POST',
        url: '/api/keys',
        headers: headers(owner),
        payload: { label: `Limit ${index + 1}` },
      })
      expect(response.statusCode).toBe(201)
      created.push((response.json() as { key: { token: string } }).key.token)
    }

    const rejected = await app.inject({
      method: 'POST',
      url: '/api/keys',
      headers: headers(owner),
      payload: { label: 'Einer zu viel' },
    })
    expect(rejected.statusCode).toBe(409)
    expect(rejected.json()).toMatchObject({ error: 'key_limit_reached', limit })

    // Revolve one key: the slot is free again.
    await app.inject({
      method: 'DELETE',
      url: `/api/keys/${created[0]}`,
      headers: headers(owner),
    })
    const allowed = await app.inject({
      method: 'POST',
      url: '/api/keys',
      headers: headers(owner),
      payload: { label: 'Nach Widerruf' },
    })
    expect(allowed.statusCode).toBe(201)
  })
})
