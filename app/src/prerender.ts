/**
 * Pure helpers for the build-time prerender step.
 *
 * No React and no filesystem access in here on purpose: the string/regex logic is
 * unit-testable, `scripts/prerender.ts` only wires it to `dist/` and the SSR bundle.
 */

import {
  NOT_FOUND_PAGE_PATH,
  PUBLIC_ROUTES,
  isPortalPath,
  matchPublicRoute,
  outputFilePath,
} from './routes'
import { isDesignRoute } from './devRoutes'

export interface DocumentMeta {
  title: string
  description: string
  /** Portal and 404 documents must never be indexed. */
  noindex: boolean
}

export const PORTAL_OUTPUT_FILE = 'portal.html'
export const NOT_FOUND_OUTPUT_FILE = '404.html'

export const PORTAL_META: DocumentMeta = {
  title: 'Portal — KI-Kustodiat',
  description: 'Token-Portal des KI-Kustodiats der Spengergasse.',
  noindex: true,
}

export const NOT_FOUND_META: DocumentMeta = {
  title: 'Seite nicht gefunden — KI-Kustodiat',
  description: 'Diese Seite existiert nicht.',
  noindex: true,
}

/** Title for the dev-only style guide; it is never prerendered (see `devRoutes.ts`). */
export const DESIGN_META: DocumentMeta = {
  title: 'Design-System — KI-Kustodiat',
  description: 'Entwicklungsseite: Design-Tokens und UI-Primitives.',
  noindex: true,
}

const TITLE_PATTERN = /<title>[\s\S]*?<\/title>/
const DESCRIPTION_PATTERN = /<meta\s+name="description"[\s\S]*?>/
const ROBOTS_PATTERN = /<meta\s+name="robots"[\s\S]*?>/
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
 * directive and the server-rendered application markup.
 */
export function renderDocument(template: string, meta: DocumentMeta, appHtml: string): string {
  requireMarker(template, TITLE_PATTERN, '<title>')
  requireMarker(template, DESCRIPTION_PATTERN, '<meta name="description">')
  requireMarker(template, ROBOTS_PATTERN, '<meta name="robots">')
  requireMarker(template, ROOT_PATTERN, '<div id="root"></div>')

  const robots = meta.noindex ? 'noindex, nofollow' : 'index, follow'

  return template
    .replace(TITLE_PATTERN, () => `<title>${escapeHtml(meta.title)}</title>`)
    .replace(
      DESCRIPTION_PATTERN,
      () => `<meta name="description" content="${escapeHtml(meta.description)}">`,
    )
    .replace(ROBOTS_PATTERN, () => `<meta name="robots" content="${robots}">`)
    .replace(ROOT_PATTERN, () => `<div id="root">${appHtml}</div>`)
}

export function documentMetaFor(input: string): DocumentMeta {
  if (isDesignRoute(input)) {
    return DESIGN_META
  }
  if (isPortalPath(input)) {
    return PORTAL_META
  }
  const route = matchPublicRoute(input)
  if (route === undefined) {
    return NOT_FOUND_META
  }
  return { title: route.title, description: route.description, noindex: false }
}

export type PrerenderKind = 'page' | 'portal' | 'not-found'

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
 * portal shell and the (prerendered) 404 page.
 */
export function prerenderTargets(): PrerenderTarget[] {
  const pages: PrerenderTarget[] = PUBLIC_ROUTES.map((route) => ({
    urlPath: route.path,
    outputPath: outputFilePath(route.path),
    kind: 'page',
    meta: { title: route.title, description: route.description, noindex: false },
  }))

  return [
    ...pages,
    { urlPath: null, outputPath: PORTAL_OUTPUT_FILE, kind: 'portal', meta: PORTAL_META },
    {
      urlPath: NOT_FOUND_PAGE_PATH,
      outputPath: NOT_FOUND_OUTPUT_FILE,
      kind: 'not-found',
      meta: NOT_FOUND_META,
    },
  ]
}
