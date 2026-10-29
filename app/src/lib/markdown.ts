/**
 * Pure helpers of the Markdown pipeline.
 *
 * The old static site rendered `website/content/*.md` in the browser with
 * `marked` and then post-processed the DOM (`website/app.js`): `.md` links
 * became hash routes, link-only paragraphs became buttons, and tables got a
 * scroll wrapper. This module ports the string/`hast` parts of that, without
 * touching the DOM, so they are unit-testable and produce identical markup in
 * the prerender step and in the browser.
 */

import type { Element, ElementContent } from 'hast'
import { legacyHashTarget } from '../routes'

/** Already a URL/route/anchor — never rewritten. */
const NON_RELATIVE_HREF = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i

/**
 * `[Status](status.md)` → `/status` and the old hash routes (`[Startseite](#/)`,
 * `[Status](#/status)`) → their real paths.
 *
 * The old page rewrote to `#/` hash routes; the app has real prerendered
 * documents per route, so the same Markdown link becomes a real path.
 * `index.md` (and an empty target) map to the site root.
 */
export function resolveMarkdownHref(href: string): string {
  const legacy = legacyHashTarget(href)
  if (legacy !== null) {
    return legacy
  }

  if (!href.endsWith('.md') || NON_RELATIVE_HREF.test(href)) {
    return href
  }

  const target = href
    .slice(0, -'.md'.length)
    .replace(/^(?:\.{1,2}\/)+/, '')
    .replace(/^\/+/, '')

  return target === '' || target === 'index' ? '/' : `/${target}`
}

/** Visible text of an inline Markdown node (`**bold**` → `bold`). */
export function hastText(node: ElementContent): string {
  if (node.type === 'text') {
    return node.value
  }
  if (node.type === 'element') {
    return node.children.map(hastText).join('')
  }
  return ''
}

/**
 * Returns the anchors of a paragraph that consists of links and whitespace only
 * (`website/app.js` → `isLinksOnly`), or `null` for a normal paragraph.
 */
export function linkOnlyAnchors(paragraph: Element): Element[] | null {
  const anchors: Element[] = []

  for (const child of paragraph.children) {
    if (child.type === 'element' && child.tagName === 'a') {
      anchors.push(child)
      continue
    }
    if (child.type === 'text' && child.value.trim() === '') {
      continue
    }
    return null
  }

  return anchors.length > 0 ? anchors : null
}

/** `href` of an anchor, already rewritten to its real path (`undefined` if missing). */
export function anchorHref(anchor: Element): string | undefined {
  const href = anchor.properties?.href
  return typeof href === 'string' ? resolveMarkdownHref(href) : undefined
}
