import { describe, expect, it } from 'vitest'
import {
  NOT_FOUND_PAGE_PATH,
  PUBLIC_ROUTES,
  isPortalPath,
  legacyHashTarget,
  matchPublicRoute,
  normalizeRoutePath,
  outputFilePath,
} from './routes'

const EXPECTED_PATHS = ['/', '/status', '/milestones', '/angebote', '/faq', '/openwebui-anleitung']

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

  it('does not shadow the portal namespace', () => {
    expect(PUBLIC_ROUTES.some((route) => isPortalPath(route.path))).toBe(false)
  })

  it('keeps the 404 sentinel out of the public route table', () => {
    expect(matchPublicRoute(NOT_FOUND_PAGE_PATH)).toBeUndefined()
    expect(isPortalPath(NOT_FOUND_PAGE_PATH)).toBe(false)
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

describe('isPortalPath', () => {
  it.each(['/portal', '/portal/', '/portal/keys', '/portal/keys/new'])('matches %s', (path) => {
    expect(isPortalPath(path)).toBe(true)
  })

  it.each(['/', '/status', '/portalx', '/portal-keys'])('does not match %s', (path) => {
    expect(isPortalPath(path)).toBe(false)
  })
})

describe('legacyHashTarget', () => {
  const cases: Array<[string, string | null]> = [
    ['#/status', '/status'],
    ['#/status/', '/status'],
    ['#/openwebui-anleitung', '/openwebui-anleitung'],
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
          target === '/' || matchPublicRoute(target) !== undefined || isPortalPath(target),
        ).toBe(true)
      }
    }
  })
})
