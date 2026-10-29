import { describe, expect, it } from 'vitest'
import { DESIGN_ROUTE_PATH, isDesignRoute } from './devRoutes'
import { prerenderTargets } from './prerender'
import { PUBLIC_ROUTES, matchPublicRoute, outputFilePath } from './routes'

describe('dev-only design route', () => {
  it('lives outside the public route table', () => {
    expect(PUBLIC_ROUTES.some((route) => (route.path as string) === DESIGN_ROUTE_PATH)).toBe(false)
    expect(matchPublicRoute(DESIGN_ROUTE_PATH)).toBeUndefined()
  })

  it('is never prerendered', () => {
    const outputs = prerenderTargets().map((target) => target.outputPath)
    expect(outputs).not.toContain(outputFilePath(DESIGN_ROUTE_PATH))
    expect(outputs.some((file) => file.includes('_design'))).toBe(false)
  })

  it('matches only the exact path, with any trailing slash or query', () => {
    expect(isDesignRoute('/_design')).toBe(true)
    expect(isDesignRoute('/_design/')).toBe(true)
    expect(isDesignRoute('/_design?x=1')).toBe(true)
    expect(isDesignRoute('/')).toBe(false)
    expect(isDesignRoute('/_design/foo')).toBe(false)
    expect(isDesignRoute('/design')).toBe(false)
  })
})
