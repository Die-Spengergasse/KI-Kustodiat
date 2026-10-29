/**
 * LDAP integration test against the real school directory (Issue #47).
 *
 * Opt-in, because it needs the school network and the service-account password
 * (`/etc/portal/ldap_app_password`, or `PORTAL_LDAP_BIND_PASSWORD[_FILE]`):
 *
 *   PORTAL_LDAP_TEST=1 npm test -- server/auth/ldap.integration.test.ts
 *
 * There is no test user password, so the *positive* password check cannot be
 * exercised here — the test proves the two halves separately: the service bind +
 * search finds a real teacher, and a bind as that teacher with a wrong password
 * fails with LDAP result code 49 (`invalidCredentials`). Role derivation is then
 * asserted against the real DNs the directory returns.
 */

import { Client } from 'ldapts'
import { describe, expect, it } from 'vitest'
import { loadPortalConfig } from '../config'
import { testConfig } from '../testing/fixtures'
import { findDirectoryUser, verifyDirectoryPassword } from './ldap'
import { roleFromDn } from './roles'

const configResult = loadPortalConfig()
const config = configResult.ok ? configResult.config : null
const enabled = process.env.PORTAL_LDAP_TEST === '1' && config !== null

// The block body runs even when skipped, so fall back to the fixture config.
const ldapConfig = (config ?? testConfig()).ldap

describe.skipIf(!enabled)('LDAP against ldap.spengergasse.at', () => {
  const ldap = ldapConfig

  it('binds with the service account and finds the teacher grafg', async () => {
    const user = await findDirectoryUser(ldap, 'grafg')
    expect(user).not.toBeNull()
    expect(user?.dn).toContain(',OU=Lehrer,')
    expect(user?.displayName.length).toBeGreaterThan(0)
    expect(user?.mail).toMatch(/@/)
    expect(roleFromDn(user?.dn)).toBe('teacher')
  })

  it('returns null for an account that does not exist', async () => {
    expect(await findDirectoryUser(ldap, 'ap5-does-not-exist-1234')).toBeNull()
  })

  it('rejects a wrong password as invalidCredentials (49) while binding as the user', async () => {
    const user = await findDirectoryUser(ldap, 'grafg')
    expect(user).not.toBeNull()

    // 1. The portal helper treats it as a failed password, not a crash.
    await expect(verifyDirectoryPassword(ldap, user!.dn, 'definitely-not-the-password'))
      .resolves //
      .toBe(false)

    // 2. And the LDAP result really is code 49 — the bind path is real.
    const client = new Client({
      url: ldap.url,
      timeout: ldap.timeoutMs,
      connectTimeout: ldap.timeoutMs,
      tlsOptions: { rejectUnauthorized: true, minVersion: 'TLSv1.2', ciphers: 'ALL' },
    })
    try {
      await client.bind(user!.dn, 'definitely-not-the-password')
      throw new Error('bind with a wrong password must not succeed')
    } catch (error) {
      expect((error as { code?: number }).code).toBe(49)
    } finally {
      await client.unbind().catch(() => undefined)
    }
  })

  it('never accepts an empty password (unauthenticated bind)', async () => {
    const user = await findDirectoryUser(ldap, 'grafg')
    await expect(verifyDirectoryPassword(ldap, user!.dn, '')).resolves.toBe(false)
  })

  it('maps a real student DN to the student role', async () => {
    const client = new Client({
      url: ldap.url,
      timeout: ldap.timeoutMs,
      connectTimeout: ldap.timeoutMs,
      tlsOptions: { rejectUnauthorized: true, minVersion: 'TLSv1.2', ciphers: 'ALL' },
    })
    let studentDn: string | undefined
    try {
      await client.bind(ldap.bindDn, ldap.bindPassword)
      const { searchEntries } = await client.search(`OU=Schueler,${ldap.baseDn}`, {
        scope: 'sub',
        filter: '(objectClass=user)',
        attributes: ['sAMAccountName'],
        sizeLimit: 1,
      })
      studentDn = searchEntries[0]?.dn
    } finally {
      await client.unbind().catch(() => undefined)
    }
    expect(studentDn).toBeDefined()
    expect(roleFromDn(studentDn)).toBe('student')
  })
})
