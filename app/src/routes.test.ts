import { describe, expect, it } from 'vitest'
import {
  NOT_FOUND_PAGE_PATH,
  PUBLIC_ROUTES,
  canonicalUrl,
  isTokensPath,
  legacyHashTarget,
  matchPublicRoute,
  normalizeRoutePath,
  outputFilePath,
} from './routes'

const EXPECTED_PATHS = [
  '/',
  '/status',
  '/milestones',
  '/angebote',
  '/faq',
  '/anleitung/tokens',
  '/anleitung/openwebui',
]

describe('public route table', () => {
  it('contains exactly the planned public routes in a stable order', () => {
    expect(PUBLIC_ROUTES.map((route) => route.path)).toEqual(EXPECTED_PATHS)
  })

  it('keeps paths, titles and headings unique', () => {
    for (const field of ['path', 'title', 'heading'] as const) {
      const values = PUBLIC_ROUTES.map((route) => route[field])
      expect(new Set(values).size).toBe(values.length)
    }
  })

  it('has an own prerendered output file per route', () => {
    const files = PUBLIC_ROUTES.map((route) => outputFilePath(route.path))

    expect(new Set(files).size).toBe(files.length)
    expect(outputFilePath('/')).toBe('index.html')
    expect(outputFilePath('/status')).toBe('status/index.html')
    expect(files.every((file) => file.endsWith('.html'))).toBe(true)
  })

  it('resolves every route independent of trailing slash and query string', () => {
    for (const path of EXPECTED_PATHS) {
      const suffix = path === '/' ? '' : '/'
      expect(matchPublicRoute(`${path}${suffix}?utm_source=test`)?.path).toBe(path)
    }

    expect(matchPublicRoute('/does-not-exist')).toBeUndefined()
    expect(matchPublicRoute('/status/details')).toBeUndefined()
  })

  it('does not shadow the token-management namespace', () => {
    expect(PUBLIC_ROUTES.some((route) => isTokensPath(route.path))).toBe(false)
  })

  it('keeps the 404 sentinel out of the public route table', () => {
    expect(matchPublicRoute(NOT_FOUND_PAGE_PATH)).toBeUndefined()
    expect(isTokensPath(NOT_FOUND_PAGE_PATH)).toBe(false)
  })
})

describe('canonicalUrl', () => {
  it('derives the absolute URL from the route path', () => {
    expect(canonicalUrl('/')).toBe('https://kik.spengergasse.at/')
    expect(canonicalUrl('/status')).toBe('https://kik.spengergasse.at/status')
    expect(canonicalUrl('/status/')).toBe('https://kik.spengergasse.at/status')
    expect(canonicalUrl('https://example.test/angebote?x=1')).toBe(
      'https://kik.spengergasse.at/angebote',
    )
  })
})

describe('normalizeRoutePath', () => {
  const cases: Array<[string, string]> = [
    ['/', '/'],
    ['/status', '/status'],
    ['/status/', '/status'],
    ['/status///', '/status'],
    ['/status?utm=x', '/status'],
    ['/status#abschnitt', '/status'],
    ['//status', '/status'],
    ['status', '/status'],
    ['https://kik.spengergasse.at/status?x=1', '/status'],
    ['', '/'],
  ]

  it.each(cases)('normalizes %j to %j', (input, expected) => {
    expect(normalizeRoutePath(input)).toBe(expected)
  })
})

describe('isTokensPath', () => {
  it.each(['/tokens', '/tokens/', '/tokens/keys', '/tokens/keys/new'])('matches %s', (path) => {
    expect(isTokensPath(path)).toBe(true)
  })

  it.each(['/', '/status', '/tokensx', '/tokens-keys', '/anleitung/tokens'])(
    'does not match %s',
    (path) => {
      expect(isTokensPath(path)).toBe(false)
    },
  )
})

describe('legacyHashTarget', () => {
  const cases: Array<[string, string | null]> = [
    ['#/status', '/status'],
    ['#/status/', '/status'],
    ['#/anleitung/openwebui', '/anleitung/openwebui'],
    ['#/status?utm=x', '/status'],
    ['#/', '/'],
    ['', null],
    ['#', null],
    ['#status', null],
    ['#section-2', null],
  ]

  it.each(cases)('maps %j to %j', (hash, expected) => {
    expect(legacyHashTarget(hash)).toBe(expected)
  })

  it('only produces targets that the router knows or that belong to the portal', () => {
    for (const [hash] of cases) {
      const target = legacyHashTarget(hash)
      if (target !== null) {
        expect(
          target === '/' || matchPublicRoute(target) !== undefined || isTokensPath(target),
        ).toBe(true)
      }
    }
  })
})
