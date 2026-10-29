import { expect, test } from '@playwright/test'
import { PUBLIC_ROUTES, canonicalUrl } from '../src/routes'

/**
 * Everything a bot sees (`#45`): per-route metadata, the generated sitemap and
 * robots.txt, the real 404 and the internal-link contract.
 *
 * The route table is imported directly, so a route that exists but is missing
 * from the sitemap or has no canonical URL fails these tests.
 */

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

test.describe('per-route metadata', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.path} carries title, description, canonical and OpenGraph`, async ({
      request,
    }) => {
      const response = await request.get(route.path)
      expect(response.status()).toBe(200)
      expect(response.headers()['content-type']).toContain('text/html')

      const html = await response.text()
      const url = canonicalUrl(route.path)

      expect(html).toContain(`<title>${escapeHtml(route.title)}</title>`)
      expect(html).toContain(`<meta name="description" content="${escapeHtml(route.description)}">`)
      expect(html).toContain('<meta name="robots" content="index, follow">')

      expect(html).toContain(`<link rel="canonical" href="${url}">`)
      expect(html).toContain('<meta property="og:type" content="website">')
      expect(html).toContain(`<meta property="og:title" content="${escapeHtml(route.title)}">`)
      expect(html).toContain(
        `<meta property="og:description" content="${escapeHtml(route.description)}">`,
      )
      expect(html).toContain(`<meta property="og:url" content="${url}">`)

      // Crawlable content: a heading and at least one internal link.
      expect(html).toMatch(/<h1[ >]/)
      expect(html).toMatch(/href="\/[^"]*"/)
    })
  }

  test('the canonical URLs are stable under trailing slashes and queries', async ({ request }) => {
    const plain = await (await request.get('/status')).text()
    const slashed = await (await request.get('/status/?utm_source=test')).text()

    expect(plain).toContain('<link rel="canonical" href="https://kik.spengergasse.at/status">')
    expect(slashed).toContain('<link rel="canonical" href="https://kik.spengergasse.at/status">')
  })
})

test.describe('sitemap.xml', () => {
  test('lists exactly the public routes', async ({ request }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('xml')

    const sitemap = await response.text()
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])

    expect(locs).toEqual(PUBLIC_ROUTES.map((route) => canonicalUrl(route.path)))
    expect(sitemap).not.toContain('/portal')
  })
})

test.describe('robots.txt', () => {
  test('points at the sitemap and keeps crawlers out of the portal', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/plain')

    const robots = await response.text()
    expect(robots).toContain('User-agent: *')
    expect(robots).toContain('Disallow: /portal')
    expect(robots).toContain('Sitemap: https://kik.spengergasse.at/sitemap.xml')
  })
})

test.describe('not found', () => {
  test('unknown paths answer 404 with the styled page', async ({ request }) => {
    for (const path of ['/nope', '/status/details', '/gibt-es-nicht']) {
      const response = await request.get(path)

      expect(response.status(), path).toBe(404)
      expect(response.headers()['content-type']).toContain('text/html')

      const html = await response.text()
      expect(html).toContain('<meta name="robots" content="noindex, nofollow">')
      expect(html).toContain('<h1>Seite nicht gefunden</h1>')
      expect(html).toContain('href="/"')
    }
  })

  test('the 404 page has no canonical URL and never reaches the sitemap', async ({ request }) => {
    const html = await (await request.get('/nope')).text()

    expect(html).not.toContain('rel="canonical"')
    expect(await (await request.get('/sitemap.xml')).text()).not.toContain('404')
  })
})

test.describe('portal', () => {
  test('is served as a noindex shell that is not in the sitemap', async ({ request }) => {
    const response = await request.get('/portal')

    expect(response.status()).toBe(200)
    expect(response.headers()['x-robots-tag']).toContain('noindex')
    expect(await response.text()).toContain('<meta name="robots" content="noindex, nofollow">')
    expect(await (await request.get('/sitemap.xml')).text()).not.toContain('/portal')
  })
})
