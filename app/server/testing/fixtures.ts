/**
 * Test fixtures for the portal server (Issue #47). Not imported by production
 * code: the tests need a deterministic config object without `/etc/portal`.
 */

import type { PortalConfig } from '../config'

export function testConfig(overrides: Partial<PortalConfig> = {}): PortalConfig {
  return {
    databaseUrl: 'postgres://portal:secret@127.0.0.1:5432/litellm',
    sessionSecret: 'test-session-secret',
    sessionTtlSeconds: 8 * 60 * 60,
    sessionIdleSeconds: 60 * 60,
    cookieSecure: false,
    trustProxy: true,
    adminGroup: null,
    rateLimit: { windowSeconds: 900, accountLimit: 5, ipLimit: 20, lockoutSeconds: 900 },
    ldap: {
      url: 'ldaps://ldap.invalid:636',
      baseDn: 'OU=Automatisch gewartete Benutzer,OU=Benutzer,OU=SPG,DC=htl-wien5,DC=schule',
      bindDn: 'CN=service,DC=example',
      bindPassword: 'not-used',
      timeoutMs: 1_000,
    },
    litellm: { baseUrl: 'http://127.0.0.1:4000', adminKey: 'sk-test', timeoutMs: 1_000 },
    keys: {
      maxActiveKeys: { student: 10, teacher: 10, staff: 10, admin: 10 },
      monthlyBudgetUsd: { student: 5, teacher: 5, staff: 5, admin: 5 },
    },
    ...overrides,
  }
}
