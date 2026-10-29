/**
 * Single source of truth for the public route table.
 *
 * Shared by the client (link + render decisions), the Fastify server (which file to
 * serve, real 404 handling) and the prerender script (which files to write). Keeping
 * this list framework-free is what makes it unit-testable without a DOM.
 */

/** Origin the public site is served from — canonical URLs and the sitemap use it. */
export const SITE_ORIGIN = 'https://kik.spengergasse.at'

interface RouteDefinition {
  /** URL path, no trailing slash except for the root. */
  path: string
  /** Document title used for the prerendered <title>. */
  title: string
  /** Page heading; must match the `<h1>` of the route's Markdown (see `lib/content.test.ts`). */
  heading: string
  /** Meta description for the prerendered document. */
  description: string
}

/**
 * The single owner of the public site's metadata: every route renders
 * `website/content/<slug>.md` through `MarkdownContent`, and `title`, `heading`
 * and `description` are what the prerender step writes into the document, the
 * canonical/OpenGraph tags and the sitemap. The `heading` must stay in sync with
 * the first line of that file (asserted in `lib/content.test.ts`).
 */
export const PUBLIC_ROUTES = [
  {
    path: '/',
    title: 'KI-Kustodiat der Spengergasse',
    heading: 'KI-Kustodiat der Spengergasse',
    description:
      'KI-Kustodiat der Spengergasse — datenschutzkonforme KI-Infrastruktur für Unterricht und Coding.',
  },
  {
    path: '/status',
    title: 'Status — KI-Kustodiat',
    heading: 'Status des Projekts',
    description: 'Aktueller Betriebsstatus des KI-Kustodiats der Spengergasse.',
  },
  {
    path: '/milestones',
    title: 'Milestones — KI-Kustodiat',
    heading: 'Milestones',
    description: 'Meilensteine und Projektfortschritt des KI-Kustodiats.',
  },
  {
    path: '/angebote',
    title: 'Angebote — KI-Kustodiat',
    heading: 'Angebote',
    description: 'Token-Preise, Gratis- und Bildungsangebote sowie Hardware-Optionen.',
  },
  {
    path: '/faq',
    title: 'FAQ — KI-Kustodiat',
    heading: 'FAQ — häufig gestellte Fragen',
    description: 'Häufig gestellte Fragen zum KI-Kustodiat der Spengergasse.',
  },
  {
    path: '/anleitung/tokens',
    title: 'Anleitung Tokens — KI-Kustodiat',
    heading: 'Anleitung Tokens',
    description:
      'Wie du einen API-Token erzeugst, ihn in Coding-Werkzeugen und für Sprache-zu-Text einsetzt und was die Limits bedeuten.',
  },
  {
    path: '/anleitung/openwebui',
    title: 'Anleitung Open WebUI — KI-Kustodiat',
    heading: 'Anleitung Open WebUI',
    description: 'Anleitung zum Zugang zu Open WebUI und zum Einbinden eigener KI-Modelle.',
  },
] as const satisfies readonly RouteDefinition[]

/** Literal-typed view of a route, used to keep the page registry exhaustive. */
export type PublicRoute = (typeof PUBLIC_ROUTES)[number]
export type PublicRoutePath = PublicRoute['path']

/**
 * Normalizes an arbitrary request target (`/status/`, `/status?x=1`, a full URL)
 * to the canonical route path form used by the route table.
 */
export function normalizeRoutePath(input: string): string {
  const withoutOrigin = input.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]*/i, '')
  const pathOnly = withoutOrigin.split(/[?#]/)[0] ?? '/'
  const withLeadingSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, '/')
  const trimmed = collapsed.length > 1 ? collapsed.replace(/\/+$/, '') : collapsed
  return trimmed === '' ? '/' : trimmed
}

export function matchPublicRoute(input: string): PublicRoute | undefined {
  const path = normalizeRoutePath(input)
  return PUBLIC_ROUTES.find((route) => route.path === path)
}

/**
 * Absolute URL of a path on the public site: `/` → `https://kik.spengergasse.at/`,
 * `/status` → `https://kik.spengergasse.at/status`. Used for `<link rel="canonical">`,
 * the OpenGraph URL and the sitemap, so all three can never disagree.
 */
export function canonicalUrl(input: string): string {
  const path = normalizeRoutePath(input)
  return path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`
}

/** Everything under `/tokens` is the client-rendered (noindex) authenticated area. */
export function isTokensPath(input: string): boolean {
  const path = normalizeRoutePath(input)
  return path === '/tokens' || path.startsWith('/tokens/')
}

/**
 * Tokenverwaltung pages (Issue #48, formerly under `/portal`). Everything else
 * under `/tokens` is served the same noindex shell but shows a "not found" note —
 * the nav below is the single source for the authenticated area's navigation and
 * its labels.
 */
export const TOKENS_PAGES = [
  { path: '/tokens', label: 'Übersicht' },
  { path: '/tokens/keys', label: 'API-Keys' },
  { path: '/tokens/usage', label: 'Verbrauch' },
] as const

export type TokensPagePath = (typeof TOKENS_PAGES)[number]['path']

export function matchTokensPage(input: string): TokensPagePath | null {
  const path = normalizeRoutePath(input)
  const match = TOKENS_PAGES.find((page) => page.path === path)
  return match === undefined ? null : match.path
}

/**
 * Output location of a route inside `dist/`:
 * `/` -> `index.html`, `/status` -> `status/index.html`.
 */
export function outputFilePath(input: string): string {
  const path = normalizeRoutePath(input)
  return path === '/' ? 'index.html' : `${path.slice(1)}/index.html`
}

/**
 * Legacy hash URLs (`/#/status`) still exist in the wild. Returns the path to
 * redirect to, or `null` when the hash is not a legacy route.
 */
export function legacyHashTarget(hash: string): string | null {
  if (!hash.startsWith('#/')) {
    return null
  }
  return normalizeRoutePath(hash.slice(1))
}

/**
 * Sentinel path used to prerender the 404 document with the regular layout. It is
 * intentionally not part of {@link PUBLIC_ROUTES}, so it always resolves to the
 * not-found page.
 */
export const NOT_FOUND_PAGE_PATH = '/404'
