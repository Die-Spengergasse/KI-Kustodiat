import { describe, expect, it } from 'vitest'
import { testConfig } from '../testing/fixtures'
import { evaluateRateLimit, NO_FAILURES } from './ratelimit'
import { roleLabel, loginFailureMessage } from '../../src/lib/portalMessages'
import { escapeFilterValue } from './ldap'

const config = testConfig().rateLimit

describe('evaluateRateLimit', () => {
  it('lets the first attempts through', () => {
    expect(
      evaluateRateLimit({
        account: { failures: 4, oldestAgeSeconds: 30 },
        ip: NO_FAILURES,
        config,
      }),
    ).toEqual({ blocked: false, reason: null, retryAfterSeconds: 0 })
  })

  it('blocks the account at the limit and reports the remaining window', () => {
    const decision = evaluateRateLimit({
      account: { failures: 5, oldestAgeSeconds: 60 },
      ip: { failures: 5, oldestAgeSeconds: 60 },
      config,
    })
    expect(decision).toMatchObject({ blocked: true, reason: 'account' })
    expect(decision.retryAfterSeconds).toBe(config.windowSeconds - 60)
  })

  it('blocks the IP when only the IP counter is exhausted', () => {
    const decision = evaluateRateLimit({
      account: { failures: 1, oldestAgeSeconds: 10 },
      ip: { failures: 20, oldestAgeSeconds: 600 },
      config,
    })
    expect(decision).toMatchObject({ blocked: true, reason: 'ip' })
    expect(decision.retryAfterSeconds).toBe(config.windowSeconds - 600)
  })

  it('never reports a retry time below one second', () => {
    const decision = evaluateRateLimit({
      account: { failures: 5, oldestAgeSeconds: config.windowSeconds },
      ip: NO_FAILURES,
      config,
    })
    expect(decision.retryAfterSeconds).toBe(1)
  })
})

describe('escapeFilterValue', () => {
  it('escapes the RFC 4515 special characters', () => {
    expect(escapeFilterValue('a*b(c)d\\e')).toBe('a\\2ab\\28c\\29d\\5ce')
  })

  it('leaves normal login names untouched', () => {
    expect(escapeFilterValue('GEO220154')).toBe('GEO220154')
  })
})

describe('portal wording', () => {
  it('labels every role', () => {
    expect(roleLabel('teacher')).toBe('Lehrkraft')
    expect(roleLabel('student')).toBe('Schüler:in')
    expect(roleLabel('staff')).toBe('Verwaltung')
    expect(roleLabel('admin')).toBe('Administrator:in')
  })

  it('does not reveal whether an account exists', () => {
    expect(loginFailureMessage({ status: 401 })).toBe('Benutzername oder Passwort ist falsch.')
  })

  it('turns a lockout into minutes', () => {
    expect(loginFailureMessage({ status: 429, retryAfterSeconds: 61 })).toContain('2 Minuten')
    expect(loginFailureMessage({ status: 429, retryAfterSeconds: 5 })).toContain('1 Minute.')
  })
})
