import { describe, expect, it } from 'vitest'
import {
  NOT_FOUND_META,
  NOT_FOUND_OUTPUT_FILE,
  PORTAL_META,
  PORTAL_OUTPUT_FILE,
  documentMetaFor,
  escapeHtml,
  prerenderTargets,
  renderDocument,
} from './prerender'
import { NOT_FOUND_PAGE_PATH, PUBLIC_ROUTES, outputFilePath } from './routes'

const TEMPLATE = [
  '<!doctype html><html lang="de"><head>',
  '<title>Alt</title>',
  '<meta name="description" content="alt">',
  '<meta name="robots" content="index, follow">',
  '<link rel="canonical" href="https://example.test/alt">',
  '<meta property="og:type" content="website">',
  '<meta property="og:title" content="Alt">',
  '<meta property="og:description" content="alt">',
  '<meta property="og:url" content="https://example.test/alt">',
  '</head><body><div id="root"></div>',
  '<script type="module" src="/assets/index-abc.js"></script>',
  '</body></html>',
].join('\n')

/** Template that predates the canonical/OpenGraph block. */
const TEMPLATE_WITHOUT_SOCIAL_META = [
  '<!doctype html><html lang="de"><head>',
  '<title>Alt</title>',
  '<meta name="description" content="alt">',
  '<meta name="robots" content="index, follow">',
  '</head><body><div id="root"></div></body></html>',
].join('\n')

describe('renderDocument', () => {
  it('injects the rendered application markup into the single root element', () => {
    const html = renderDocument(TEMPLATE, NOT_FOUND_META, '<h1>Hallo</h1><p>x</p>')

    expect(html).toContain('<div id="root"><h1>Hallo</h1><p>x</p></div>')
    expect(html.match(/id="root"/g)).toHaveLength(1)
  })

  it('keeps the client bundle script of the Vite template', () => {
    const html = renderDocument(TEMPLATE, NOT_FOUND_META, '')

    expect(html).toContain('<script type="module" src="/assets/index-abc.js"></script>')
    expect(html).toContain('<div id="root"></div>')
  })

  it('sets title, description and robots per document', () => {
    const html = renderDocument(
      TEMPLATE,
      {
        title: 'Status — KI-Kustodiat',
        description: 'Statusseite',
        path: '/status',
        noindex: false,
      },
      '',
    )

    expect(html).toContain('<title>Status — KI-Kustodiat</title>')
    expect(html).toContain('<meta name="description" content="Statusseite">')
    expect(html).toContain('<meta name="robots" content="index, follow">')
    expect(html).not.toContain('<title>Alt</title>')
  })

  it('writes canonical URL and OpenGraph tags for public routes', () => {
    const html = renderDocument(
      TEMPLATE,
      {
        title: 'Status — KI-Kustodiat',
        description: 'Statusseite',
        path: '/status',
        noindex: false,
      },
      '',
    )

    expect(html).toContain('<link rel="canonical" href="https://kik.spengergasse.at/status">')
    expect(html).toContain('<meta property="og:type" content="website">')
    expect(html).toContain('<meta property="og:title" content="Status — KI-Kustodiat">')
    expect(html).toContain('<meta property="og:description" content="Statusseite">')
    expect(html).toContain('<meta property="og:url" content="https://kik.spengergasse.at/status">')
    expect(html).not.toContain('https://example.test/alt')
  })

  it('drops canonical and OpenGraph for documents without a public URL', () => {
    const html = renderDocument(TEMPLATE, NOT_FOUND_META, '')

    expect(html).not.toContain('rel="canonical"')
    expect(html).not.toContain('property="og:')
  })

  it('marks noindex documents and escapes markup in metadata', () => {
    const html = renderDocument(
      TEMPLATE,
      { title: '<script>alert(1)</script>', description: 'a "b" & c', path: null, noindex: true },
      '',
    )

    expect(html).toContain('<title>&lt;script&gt;alert(1)&lt;/script&gt;</title>')
    expect(html).toContain('<meta name="description" content="a &quot;b&quot; &amp; c">')
    expect(html).toContain('<meta name="robots" content="noindex, nofollow">')
    expect(html).not.toContain('<script>alert(1)</script>')
  })

  it('escapes the canonical URL derived from the route path', () => {
    const html = renderDocument(
      TEMPLATE,
      { title: 'x', description: 'y', path: '/a<b', noindex: false },
      '',
    )

    expect(html).toContain('<link rel="canonical" href="https://kik.spengergasse.at/a&lt;b">')
  })

  it('fails loudly when the template misses a marker', () => {
    const broken = '<!doctype html><html><head></head><body></body></html>'

    expect(() => renderDocument(broken, NOT_FOUND_META, '')).toThrow(/marker/)
  })

  it('fails loudly when the template misses the social meta block', () => {
    expect(() => renderDocument(TEMPLATE_WITHOUT_SOCIAL_META, NOT_FOUND_META, '')).toThrow(
      /canonical|og:/,
    )
  })

  it('fails loudly when the template misses a marker', () => {
    const broken = '<!doctype html><html><head></head><body></body></html>'

    expect(() => renderDocument(broken, NOT_FOUND_META, '')).toThrow(/marker/)
  })
})

describe('escapeHtml', () => {
  it('escapes all five HTML-significant characters', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;')
    expect(escapeHtml('plain text')).toBe('plain text')
  })
})

describe('prerenderTargets', () => {
  const targets = prerenderTargets()

  it('emits one page target per public route plus portal shell and 404 page', () => {
    expect(targets).toHaveLength(PUBLIC_ROUTES.length + 2)

    for (const route of PUBLIC_ROUTES) {
      const target = targets.find((candidate) => candidate.urlPath === route.path)
      expect(target?.kind).toBe('page')
      expect(target?.outputPath).toBe(outputFilePath(route.path))
      expect(target?.meta.title).toBe(route.title)
      expect(target?.meta.noindex).toBe(false)
    }
  })

  it('emits portal and 404 shells as noindex documents without a route to render', () => {
    const portal = targets.find((target) => target.outputPath === PORTAL_OUTPUT_FILE)
    const notFound = targets.find((target) => target.outputPath === NOT_FOUND_OUTPUT_FILE)

    expect(portal).toEqual({
      urlPath: null,
      outputPath: PORTAL_OUTPUT_FILE,
      kind: 'portal',
      meta: PORTAL_META,
    })
    expect(portal?.meta.noindex).toBe(true)
    expect(notFound?.urlPath).toBe(NOT_FOUND_PAGE_PATH)
    expect(notFound?.meta.noindex).toBe(true)
    expect(notFound?.kind).toBe('not-found')
  })

  it('never writes the same output file twice', () => {
    const outputs = targets.map((target) => target.outputPath)

    expect(new Set(outputs).size).toBe(outputs.length)
    expect(outputs.filter((output) => output === 'index.html')).toHaveLength(1)
  })
})

describe('documentMetaFor', () => {
  it('uses the route metadata for public pages', () => {
    const meta = documentMetaFor('/angebote/')

    expect(meta.title).toBe('Angebote — KI-Kustodiat')
    expect(meta.path).toBe('/angebote')
    expect(meta.noindex).toBe(false)
  })

  it('gives every public route a canonical path', () => {
    for (const route of PUBLIC_ROUTES) {
      expect(documentMetaFor(route.path).path).toBe(route.path)
    }
  })

  it('marks the portal as noindex and without a canonical URL', () => {
    expect(documentMetaFor('/portal/keys')).toEqual(PORTAL_META)
    expect(documentMetaFor('/portal/keys').path).toBeNull()
  })

  it('falls back to the not-found metadata for unknown paths', () => {
    expect(documentMetaFor('/does-not-exist')).toEqual(NOT_FOUND_META)
  })
})
