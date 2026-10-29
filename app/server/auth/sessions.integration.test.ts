/**
 * Session and rate-limit persistence against PostgreSQL (Issue #47).
 *
 * Opt-in, same gate as the HTTP test:
 *
 *   PORTAL_DB_TEST=1 npm test -- server/auth/sessions.integration.test.ts
 */

import { sql } from 'drizzle-orm'
import { afterAll, describe, expect, it } from 'vitest'
import { loadPortalConfig } from '../config'
import { closeDatabase, getDatabase } from '../db/client'
import { users } from '../db/schema'
import { testConfig } from '../testing/fixtures'
import { NO_FAILURES, accountFailureWindow, evaluateRateLimit, recordAttempt } from './ratelimit'
import { createSession, loadSession, revokeSession, touchSession } from './sessions'

const configResult = loadPortalConfig()
const enabled = process.env.PORTAL_DB_TEST === '1' && configResult.ok

// The block body runs even when skipped, so fall back to the fixture config.
const persistenceConfig = (configResult.ok ? configResult.config : null) ?? testConfig()

describe.skipIf(!enabled)('portal persistence', () => {
  const config = persistenceConfig

  afterAll(async () => {
    await closeDatabase()
  })

  async function createTestUser(sam: string): Promise<string> {
    const db = getDatabase(config.databaseUrl)
    const rows = await db
      .insert(users)
      .values({
        sam,
        displayName: 'AP5 Session Test',
        mail: null,
        ldapDn: `CN=${sam},OU=Lehrer,OU=Automatisch gewartete Benutzer,DC=test`,
        role: 'teacher',
      })
      .onConflictDoUpdate({ target: users.sam, set: { updatedAt: new Date() } })
      .returning({ id: users.id })
    const id = rows[0]?.id
    if (id === undefined) throw new Error('could not create test user')
    return id
  }

  it('creates a session, resolves the cookie, rolls the expiry and revokes it', async () => {
    const db = getDatabase(config.databaseUrl)
    const userId = await createTestUser('ap5-session-test')

    const session = await createSession(db, config!, {
      userId,
      ip: '127.0.0.1',
      userAgent: 'vitest',
    })
    const active = await loadSession(db, config!, session.signedCookie)
    expect(active?.user.sam).toBe('ap5-session-test')

    // A forged signature must not resolve.
    expect(await loadSession(db, config!, `${session.token}.forged`)).toBeNull()
    expect(await loadSession(db, config!, undefined)).toBeNull()

    // Rolling expiry: a stale `last_seen_at` is pushed forward.
    await db.execute(
      sql`update portal.sessions set last_seen_at = now() - interval '5 minutes' where token_hash = encode(sha256(${session.token}::bytea), 'hex')`,
    )
    const stale = await loadSession(db, config!, session.signedCookie)
    expect(stale).not.toBeNull()
    await touchSession(db, config!, stale!.session)
    const touched = await loadSession(db, config!, session.signedCookie)
    expect(touched!.session.lastSeenAt.getTime()).toBeGreaterThan(
      stale!.session.lastSeenAt.getTime(),
    )

    expect(await revokeSession(db, config!, session.signedCookie)).toBe(userId)
    expect(await loadSession(db, config!, session.signedCookie)).toBeNull()
  })

  it('counts failures per account inside the window and feeds the decision', async () => {
    const db = getDatabase(config.databaseUrl)
    const sam = 'ap5-ratelimit-test'
    await db.execute(sql`delete from portal.login_attempts where sam = ${sam}`)

    for (let i = 0; i < config!.rateLimit.accountLimit; i += 1) {
      await recordAttempt(db, { ip: '127.0.0.2', sam, success: false, reason: 'test' })
    }
    const window = await accountFailureWindow(db, config!.rateLimit, sam)
    expect(window.failures).toBe(config!.rateLimit.accountLimit)
    expect(window.oldestAgeSeconds).toBeGreaterThanOrEqual(0)

    const decision = evaluateRateLimit({
      account: window,
      ip: NO_FAILURES,
      config: config!.rateLimit,
    })
    expect(decision.blocked).toBe(true)
    expect(decision.reason).toBe('account')
  })
})
