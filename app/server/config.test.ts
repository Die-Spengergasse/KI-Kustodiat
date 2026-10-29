import { describe, expect, it } from 'vitest'
import { loadPortalConfig, parseEnvFile, readSecret, resolveCookieSecure } from './config'

describe('parseEnvFile', () => {
  it('reads KEY=VALUE, ignores comments and blanks, strips one quote pair', () => {
    const parsed = parseEnvFile(
      ['# comment', '', 'PORTAL_X=1', 'QUOTED="a b"', "SINGLE='c'", 'EQUALS=a=b', 'BROKEN'].join(
        '\n',
      ),
    )
    expect(parsed).toEqual({
      PORTAL_X: '1',
      QUOTED: 'a b',
      SINGLE: 'c',
      EQUALS: 'a=b',
    })
  })

  it('handles CRLF files', () => {
    expect(parseEnvFile('A=1\r\nB=2\r\n')).toEqual({ A: '1', B: '2' })
  })
})

describe('resolveCookieSecure', () => {
  it('is off outside production', () => {
    expect(resolveCookieSecure({})).toBe(false)
    expect(resolveCookieSecure({ NODE_ENV: 'development' })).toBe(false)
    expect(resolveCookieSecure({ NODE_ENV: 'test' })).toBe(false)
  })

  it('is on in production and can be forced either way', () => {
    expect(resolveCookieSecure({ NODE_ENV: 'production' })).toBe(true)
    expect(resolveCookieSecure({ NODE_ENV: 'production', PORTAL_COOKIE_SECURE: 'false' })).toBe(
      false,
    )
    expect(resolveCookieSecure({ PORTAL_COOKIE_SECURE: 'true' })).toBe(true)
  })
})

describe('readSecret', () => {
  it('ignores an empty secret file and falls back to the literal value', () => {
    process.env.PORTAL_TEST_SECRET_FILE = '/dev/null'
    process.env.PORTAL_TEST_SECRET = 'literal'
    try {
      expect(
        readSecret({
          valueEnv: 'PORTAL_TEST_SECRET',
          fileEnv: 'PORTAL_TEST_SECRET_FILE',
          credential: 'test',
        }),
      ).toBe('literal')
    } finally {
      delete process.env.PORTAL_TEST_SECRET_FILE
      delete process.env.PORTAL_TEST_SECRET
    }
  })

  it('returns undefined when nothing is configured', () => {
    expect(
      readSecret({ valueEnv: 'PORTAL_NOPE', fileEnv: 'PORTAL_NOPE_FILE', credential: 'nope' }),
    ).toBeUndefined()
  })
})

describe('loadPortalConfig', () => {
  it('reports the missing variables instead of throwing', () => {
    // Whatever the host has, the function must never throw — that is the contract
    // the API routes rely on when the deployment is incomplete.
    const result = loadPortalConfig()
    if (result.ok) {
      expect(result.config.sessionSecret.length).toBeGreaterThan(0)
      expect(result.config.ldap.url.startsWith('ldaps://')).toBe(true)
    } else {
      expect(result.missing.length).toBeGreaterThan(0)
    }
  })
})
