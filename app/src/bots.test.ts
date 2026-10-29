import { describe, expect, it } from 'vitest'
import {
  BOT_FILES,
  PORTAL_DISALLOW_PATH,
  ROBOTS_OUTPUT_FILE,
  ROBOTS_PATH,
  SITEMAP_OUTPUT_FILE,
  SITEMAP_PATH,
  findBotFile,
  renderRobots,
  renderSitemap,
} from './bots'
import { PUBLIC_ROUTES, SITE_ORIGIN, canonicalUrl } from './routes'

describe('sitemap.xml', () => {
  const sitemap = renderSitemap()
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1] ?? '')

  it('lists exactly the public routes, in route-table order', () => {
    expect(locs).toEqual(PUBLIC_ROUTES.map((route) => canonicalUrl(route.path)))
  })

  it('is a valid urlset document', () => {
    expect(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(sitemap.trimEnd().endsWith('</urlset>')).toBe(true)
  })

  it('never mentions the portal or a dev-only route', () => {
    expect(sitemap).not.toContain('/portal')
    expect(sitemap).not.toContain('_design')
    expect(sitemap).not.toContain('404')
  })
})

describe('robots.txt', () => {
  const robots = renderRobots()

  it('allows the public site and disallows the portal', () => {
    expect(robots).toContain('User-agent: *')
    expect(robots).toContain('Allow: /')
    expect(robots).toContain(`Disallow: ${PORTAL_DISALLOW_PATH}`)
  })

  it('points at the generated sitemap', () => {
    expect(robots).toContain(`Sitemap: ${SITE_ORIGIN}${SITEMAP_PATH}`)
  })
})

describe('bot files', () => {
  it('maps request paths to the prerendered files', () => {
    expect(findBotFile(SITEMAP_PATH)?.outputFile).toBe(SITEMAP_OUTPUT_FILE)
    expect(findBotFile(ROBOTS_PATH)?.outputFile).toBe(ROBOTS_OUTPUT_FILE)
    expect(findBotFile('/status')).toBeUndefined()
    expect(findBotFile('/')).toBeUndefined()
  })

  it('keeps the content types the server sends', () => {
    expect(findBotFile(SITEMAP_PATH)?.contentType).toContain('xml')
    expect(findBotFile(ROBOTS_PATH)?.contentType).toContain('text/plain')
  })

  it('lists one entry per generated file', () => {
    expect(BOT_FILES.map((file) => file.path)).toEqual([SITEMAP_PATH, ROBOTS_PATH])
  })
})
