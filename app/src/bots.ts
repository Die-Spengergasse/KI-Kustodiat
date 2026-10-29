/**
 * Bot artifacts: `sitemap.xml` and `robots.txt`.
 *
 * Both are *derived* from {@link PUBLIC_ROUTES}, never hand-written: a route that
 * is added to the table shows up in the sitemap on the next build, and the
 * disallow rule for the authenticated area comes from the same table that keeps
 * `/tokens` out of it. `scripts/prerender.ts` writes the files into `dist/`, the
 * dev server renders them on the fly.
 */

import { PUBLIC_ROUTES, SITE_ORIGIN, canonicalUrl } from './routes'

export const SITEMAP_PATH = '/sitemap.xml'
export const ROBOTS_PATH = '/robots.txt'
export const SITEMAP_OUTPUT_FILE = 'sitemap.xml'
export const ROBOTS_OUTPUT_FILE = 'robots.txt'

/** The authenticated area is client-rendered, noindex and never indexed. */
export const TOKENS_DISALLOW_PATH = '/tokens'

export interface BotFile {
  /** Request path the file is served under. */
  path: string
  /** Location inside `dist/` (prerendered) and what the dev server answers. */
  outputFile: string
  contentType: string
  render: () => string
}

/** `<urlset>` with one `<loc>` per public route, in route-table order. */
export function renderSitemap(): string {
  const urls = PUBLIC_ROUTES.map(
    (route) => `  <url>\n    <loc>${canonicalUrl(route.path)}</loc>\n  </url>`,
  ).join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n')
}

/** Allow everything public, keep crawlers out of `/tokens`, point at the sitemap. */
export function renderRobots(): string {
  return [
    'User-agent: *',
    'Allow: /',
    `Disallow: ${TOKENS_DISALLOW_PATH}`,
    '',
    `Sitemap: ${SITE_ORIGIN}${SITEMAP_PATH}`,
    '',
  ].join('\n')
}

export const BOT_FILES: readonly BotFile[] = [
  {
    path: SITEMAP_PATH,
    outputFile: SITEMAP_OUTPUT_FILE,
    contentType: 'application/xml; charset=utf-8',
    render: renderSitemap,
  },
  {
    path: ROBOTS_PATH,
    outputFile: ROBOTS_OUTPUT_FILE,
    contentType: 'text/plain; charset=utf-8',
    render: renderRobots,
  },
]

export function findBotFile(input: string): BotFile | undefined {
  return BOT_FILES.find((file) => file.path === input)
}
