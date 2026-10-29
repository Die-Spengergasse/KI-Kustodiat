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

import { legacyHashTarget } from '../routes'

/** Already a URL/route/anchor — never rewritten. */
const NON_RELATIVE_HREF = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i

/**
 * `[Status](status.md)` → `/status` and the old hash routes (`[Startseite](#/)`,
 * `[Status](#/status)`) → their real paths.
 *
 * The old page rewrote to `#/` hash routes; the app has real prerendered
 * documents per route, so the same Markdown link becomes a real path.
 * `index.md` (and an empty target) map to the site root. Nested documents keep
 * their directory: `anleitung/tokens.md` → `/anleitung/tokens`.
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

export interface MarkdownSection {
  /** Text of the `##` heading, without the hashes. */
  title: string
  /** Everything between this `##` heading and the next one (or the end). */
  body: string
}

export interface MarkdownDocument {
  /** Everything before the first `##` heading — on the start page: headline and lead. */
  intro: string
  sections: MarkdownSection[]
}

const SECTION_HEADING = /^##[ \t]+(.+?)[ \t]*$/
const FENCE = /^[ \t]*(?:```|~~~)/

/**
 * Splits a Markdown document at its `##` headings, so a page can lay each
 * section out on its own (the start page renders them as tiles) while the text
 * itself keeps living in `website/content/*.md`.
 *
 * `###` and deeper stay inside their section; `##` lines inside fenced code
 * blocks are content, not separators.
 */
export function splitMarkdownSections(markdown: string): MarkdownDocument {
  const intro: string[] = []
  const sections: MarkdownSection[] = []
  let title: string | null = null
  let body: string[] = []
  let inFence = false

  const flush = (): void => {
    if (title !== null) {
      sections.push({ title, body: body.join('\n').trim() })
    }
    body = []
  }

  for (const line of markdown.split('\n')) {
    const heading = inFence ? null : SECTION_HEADING.exec(line)
    if (FENCE.test(line)) {
      inFence = !inFence
    }

    if (heading !== null) {
      flush()
      title = heading[1] ?? ''
      continue
    }

    if (title === null) {
      intro.push(line)
    } else {
      body.push(line)
    }
  }

  flush()

  return { intro: intro.join('\n').trim(), sections }
}
