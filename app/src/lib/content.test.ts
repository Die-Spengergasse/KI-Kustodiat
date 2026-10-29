import { describe, expect, it } from 'vitest'
import { PUBLIC_ROUTES, matchPublicRoute } from '../routes'
import { resolveMarkdownHref } from './markdown'
import { HOME_MARKDOWN } from './content'

const ROUTE_LINKS = [...HOME_MARKDOWN.matchAll(/\]\(([^)\s]+)\)/g)].map((match) => match[1] ?? '')

describe('start page content', () => {
  it('is read from the old site (website/content/index.md), not copied into the app', () => {
    expect(HOME_MARKDOWN).toContain(
      '[Open WebUI Chat öffnen](https://openwebui.kik.spengergasse.at)',
    )
    expect(HOME_MARKDOWN).toContain('[Status](status.md)')
  })

  it('starts with the headline the route table promises', () => {
    const [firstLine] = HOME_MARKDOWN.trimStart().split('\n')
    const homeRoute = PUBLIC_ROUTES.find((route) => route.path === '/')

    expect(firstLine).toBe(`# ${homeRoute?.heading}`)
  })

  it('only links to routes that exist', () => {
    const internal = ROUTE_LINKS.filter((href) => href.endsWith('.md'))

    expect(internal).not.toHaveLength(0)
    for (const href of internal) {
      expect(
        matchPublicRoute(resolveMarkdownHref(href)),
        `${href} should resolve to a prerendered route`,
      ).toBeDefined()
    }
  })

  it('keeps the informal address of the website conventions', () => {
    expect(HOME_MARKDOWN).not.toMatch(/\b(Sie|Ihre|Ihnen|Ihr)\b/)
  })
})
