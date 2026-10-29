import { describe, expect, it } from 'vitest'
import { PUBLIC_ROUTES, matchPublicRoute } from '../routes'
import { resolveMarkdownHref } from './markdown'
import { CONTENT_MARKDOWN, HOME_MARKDOWN } from './content'

const ALL_LINKS = PUBLIC_ROUTES.flatMap((route) =>
  [...CONTENT_MARKDOWN[route.path].matchAll(/\]\(([^)\s]+)\)/g)].map((match) => match[1] ?? ''),
)

describe('page content', () => {
  it('is read from the old site (website/content/*.md), not copied into the app', () => {
    expect(HOME_MARKDOWN).toContain(
      '[Open WebUI Chat öffnen](https://openwebui.kik.spengergasse.at)',
    )
    expect(HOME_MARKDOWN).toContain('[Status](status.md)')
    expect(CONTENT_MARKDOWN['/status']).toContain('# Status des Projekts')
  })

  it('has a non-empty Markdown document in website/content for every public route', () => {
    for (const route of PUBLIC_ROUTES) {
      const markdown = CONTENT_MARKDOWN[route.path]

      expect(markdown, `content for ${route.path}`).toBeTypeOf('string')
      expect(markdown.trim().length, `content for ${route.path}`).toBeGreaterThan(0)
      expect(markdown, `content for ${route.path}`).toContain('\n')
    }
  })

  it('renders one document per route and nothing else', () => {
    expect(Object.keys(CONTENT_MARKDOWN).sort()).toEqual(PUBLIC_ROUTES.map((r) => r.path).sort())
  })

  it('starts every document with the headline the route table promises', () => {
    for (const route of PUBLIC_ROUTES) {
      const [firstLine] = CONTENT_MARKDOWN[route.path].trimStart().split('\n')
      expect(firstLine, `${route.path} headline`).toBe(`# ${route.heading}`)
    }
  })

  it('only links to routes that exist', () => {
    const internal = ALL_LINKS.filter((href) => href.endsWith('.md'))

    expect(internal).not.toHaveLength(0)
    for (const href of internal) {
      expect(
        matchPublicRoute(resolveMarkdownHref(href)),
        `${href} should resolve to a prerendered route`,
      ).toBeDefined()
    }
  })

  it('resolves every legacy hash link to a real route', () => {
    const legacy = ALL_LINKS.filter((href) => href.startsWith('#/'))

    expect(legacy).not.toHaveLength(0)
    for (const href of legacy) {
      expect(matchPublicRoute(resolveMarkdownHref(href)), href).toBeDefined()
    }
  })

  it('keeps the informal address of the website conventions on every page', () => {
    for (const route of PUBLIC_ROUTES) {
      expect(CONTENT_MARKDOWN[route.path], route.path).not.toMatch(/\b(Sie|Ihre|Ihnen|Ihr)\b/)
    }
  })
})
