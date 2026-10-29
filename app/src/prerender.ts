/**
 * Pure helpers for the build-time prerender step.
 *
 * No React and no filesystem access in here on purpose: the string/regex logic is
 * unit-testable, `scripts/prerender.ts` only wires it to `dist/` and the SSR bundle.
 */

import {
  NOT_FOUND_PAGE_PATH,
  PUBLIC_ROUTES,
  canonicalUrl,
  isTokensPath,
  matchPublicRoute,
  outputFilePath,
} from './routes'
import { isDesignRoute } from './devRoutes'

export interface DocumentMeta {
  title: string
  description: string
  /**
   * Public route path of the document, or `null` when it has no indexable URL
   * (Tokenverwaltung, 404, dev-only pages). Non-null paths get `<link rel="canonical">`
   * and the OpenGraph block.
   */
  path: string | null
  /** The authenticated area and the 404 document must never be indexed. */
  noindex: boolean
}

export const TOKENS_OUTPUT_FILE = 'tokens.html'
export const NOT_FOUND_OUTPUT_FILE = '404.html'

/** `og:type` of every public document: the site has pages, no articles. */
export const OG_TYPE = 'website'

export const TOKENS_META: DocumentMeta = {
  title: 'Tokenverwaltung — KI-Kustodiat',
  description: 'Tokenverwaltung des KI-Kustodiats der Spengergasse.',
  path: null,
  noindex: true,
}

export const NOT_FOUND_META: DocumentMeta = {
  title: 'Seite nicht gefunden — KI-Kustodiat',
  description: 'Diese Seite existiert nicht.',
  path: null,
  noindex: true,
}

/** Title for the dev-only style guide; it is never prerendered (see `devRoutes.ts`). */
export const DESIGN_META: DocumentMeta = {
  title: 'Design-System — KI-Kustodiat',
  description: 'Entwicklungsseite: Design-Tokens und UI-Primitives.',
  path: null,
  noindex: true,
}

const TITLE_PATTERN = /<title>[\s\S]*?<\/title>/
const DESCRIPTION_PATTERN = /<meta\s+name="description"[\s\S]*?>/
const ROBOTS_PATTERN = /<meta\s+name="robots"[\s\S]*?>/
const CANONICAL_PATTERN = /<link\s+rel="canonical"[\s\S]*?>/
const OG_TITLE_PATTERN = /<meta\s+property="og:title"[\s\S]*?>/
const OG_DESCRIPTION_PATTERN = /<meta\s+property="og:description"[\s\S]*?>/
const OG_TYPE_PATTERN = /<meta\s+property="og:type"[\s\S]*?>/
const OG_URL_PATTERN = /<meta\s+property="og:url"[\s\S]*?>/
const ROOT_PATTERN = /<div id="root">\s*<\/div>/

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character)
}

function requireMarker(template: string, pattern: RegExp, marker: string): void {
  if (!pattern.test(template)) {
    throw new Error(`Prerender template is missing the marker ${marker}`)
  }
}

/**
 * Fills the Vite `index.html` template: per-route `<title>`, description, robots
 * directive, canonical URL, OpenGraph block and the server-rendered markup.
 *
 * Documents without a public URL (`meta.path === null`) drop the canonical and
 * OpenGraph tags instead of pointing at a page that does not exist.
 */
export function renderDocument(template: string, meta: DocumentMeta, appHtml: string): string {
  requireMarker(template, TITLE_PATTERN, '<title>')
  requireMarker(template, DESCRIPTION_PATTERN, '<meta name="description">')
  requireMarker(template, ROBOTS_PATTERN, '<meta name="robots">')
  requireMarker(template, CANONICAL_PATTERN, '<link rel="canonical">')
  requireMarker(template, OG_TITLE_PATTERN, '<meta property="og:title">')
  requireMarker(template, OG_DESCRIPTION_PATTERN, '<meta property="og:description">')
  requireMarker(template, OG_TYPE_PATTERN, '<meta property="og:type">')
  requireMarker(template, OG_URL_PATTERN, '<meta property="og:url">')
  requireMarker(template, ROOT_PATTERN, '<div id="root"></div>')

  const robots = meta.noindex ? 'noindex, nofollow' : 'index, follow'
  const url = meta.path === null ? null : canonicalUrl(meta.path)

  return template
    .replace(TITLE_PATTERN, () => `<title>${escapeHtml(meta.title)}</title>`)
    .replace(
      DESCRIPTION_PATTERN,
      () => `<meta name="description" content="${escapeHtml(meta.description)}">`,
    )
    .replace(ROBOTS_PATTERN, () => `<meta name="robots" content="${robots}">`)
    .replace(CANONICAL_PATTERN, () =>
      url === null ? '' : `<link rel="canonical" href="${escapeHtml(url)}">`,
    )
    .replace(OG_TITLE_PATTERN, () =>
      url === null ? '' : `<meta property="og:title" content="${escapeHtml(meta.title)}">`,
    )
    .replace(OG_DESCRIPTION_PATTERN, () =>
      url === null
        ? ''
        : `<meta property="og:description" content="${escapeHtml(meta.description)}">`,
    )
    .replace(OG_TYPE_PATTERN, () =>
      url === null ? '' : `<meta property="og:type" content="${OG_TYPE}">`,
    )
    .replace(OG_URL_PATTERN, () =>
      url === null ? '' : `<meta property="og:url" content="${escapeHtml(url)}">`,
    )
    .replace(ROOT_PATTERN, () => `<div id="root">${appHtml}</div>`)
}

export function documentMetaFor(input: string): DocumentMeta {
  if (isDesignRoute(input)) {
    return DESIGN_META
  }
  if (isTokensPath(input)) {
    return TOKENS_META
  }
  const route = matchPublicRoute(input)
  if (route === undefined) {
    return NOT_FOUND_META
  }
  return { title: route.title, description: route.description, path: route.path, noindex: false }
}

export type PrerenderKind = 'page' | 'tokens' | 'not-found'

export interface PrerenderTarget {
  /** Route to render through the SSR entry; `null` for the client-rendered shell. */
  urlPath: string | null
  /** Path relative to `dist/`. */
  outputPath: string
  kind: PrerenderKind
  meta: DocumentMeta
}

/**
 * Every file the prerender step must emit: one document per public route plus the
 * Tokenverwaltung shell and the (prerendered) 404 page. `sitemap.xml` and `robots.txt` are
 * derived from the same route table in `bots.ts`.
 */
export function prerenderTargets(): PrerenderTarget[] {
  const pages: PrerenderTarget[] = PUBLIC_ROUTES.map((route) => ({
    urlPath: route.path,
    outputPath: outputFilePath(route.path),
    kind: 'page',
    meta: {
      title: route.title,
      description: route.description,
      path: route.path,
      noindex: false,
    },
  }))

  return [
    ...pages,
    { urlPath: null, outputPath: TOKENS_OUTPUT_FILE, kind: 'tokens', meta: TOKENS_META },
    {
      urlPath: NOT_FOUND_PAGE_PATH,
      outputPath: NOT_FOUND_OUTPUT_FILE,
      kind: 'not-found',
      meta: NOT_FOUND_META,
    },
  ]
}
