import { describe, expect, it } from 'vitest'
import { testConfig } from '../testing/fixtures'
import { issueCsrf, readCookie, verifyCsrf } from './csrf'
import { CSRF_COOKIE, SESSION_COOKIE, clearCookie, serializeCookie } from './sessions'
import { sha256Hex, signValue, verifySignedValue } from './tokens'

describe('token signing', () => {
  it('round-trips a signed value', () => {
    const signed = signValue('secret', 'purpose', 'value')
    expect(verifySignedValue('secret', 'purpose', signed)).toBe('value')
  })

  it('rejects a wrong secret, a wrong purpose and tampered values', () => {
    const signed = signValue('secret', 'purpose', 'value')
    expect(verifySignedValue('other', 'purpose', signed)).toBeNull()
    expect(verifySignedValue('secret', 'other', signed)).toBeNull()
    expect(verifySignedValue('secret', 'purpose', 'value.forged')).toBeNull()
    expect(verifySignedValue('secret', 'purpose', undefined)).toBeNull()
  })

  it('hashes deterministically', () => {
    expect(sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })
})

describe('CSRF', () => {
  const config = testConfig()

  it('accepts the header that repeats the cookie token', () => {
    const csrf = issueCsrf(config)
    expect(verifyCsrf(config, `${CSRF_COOKIE}=${csrf.cookieValue}`, csrf.token)).toBe(true)
  })

  it('rejects a missing header, a missing cookie and a mismatched token', () => {
    const csrf = issueCsrf(config)
    expect(verifyCsrf(config, `${CSRF_COOKIE}=${csrf.cookieValue}`, undefined)).toBe(false)
    expect(verifyCsrf(config, undefined, csrf.token)).toBe(false)
    expect(verifyCsrf(config, `${CSRF_COOKIE}=${csrf.cookieValue}`, 'other')).toBe(false)
  })

  it('rejects a cookie signed with another secret (cookie tossing)', () => {
    const foreign = signValue('attacker', 'kik.csrf', 'x')
    expect(verifyCsrf(config, `${CSRF_COOKIE}=${foreign}`, 'x')).toBe(false)
  })

  it('marks the CSRF cookie readable but SameSite=Lax', () => {
    const csrf = issueCsrf(testConfig({ cookieSecure: true }))
    expect(csrf.setCookie).toContain('SameSite=Lax')
    expect(csrf.setCookie).toContain('Secure')
    expect(csrf.setCookie).not.toContain('HttpOnly')
  })
})

describe('cookie serialization', () => {
  it('writes the session cookie flags required by the issue', () => {
    const cookie = serializeCookie(SESSION_COOKIE, 'abc', {
      secure: true,
      httpOnly: true,
      sameSite: 'Lax',
      maxAgeSeconds: 60,
    })
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('Secure')
    expect(cookie).toContain('SameSite=Lax')
    expect(cookie).toContain('Max-Age=60')
    expect(cookie).toContain('Path=/')
  })

  it('omits Secure for an insecure development run', () => {
    const cookie = serializeCookie(SESSION_COOKIE, 'abc', { secure: false, httpOnly: true })
    expect(cookie).not.toContain('Secure')
  })

  it('clears a cookie with Max-Age=0', () => {
    expect(clearCookie(SESSION_COOKIE, true)).toContain('Max-Age=0')
  })

  it('parses a cookie header', () => {
    expect(readCookie('a=1; kik_csrf=xyz; b=2', CSRF_COOKIE)).toBe('xyz')
    expect(readCookie('a=1', CSRF_COOKIE)).toBeUndefined()
    expect(readCookie(undefined, CSRF_COOKIE)).toBeUndefined()
  })
})
