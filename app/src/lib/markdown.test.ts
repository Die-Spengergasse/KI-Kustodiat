import type { Element } from 'hast'
import { describe, expect, it } from 'vitest'
import { anchorHref, hastText, linkOnlyAnchors, resolveMarkdownHref } from './markdown'

describe('resolveMarkdownHref', () => {
  const cases: Array<[string, string]> = [
    ['status.md', '/status'],
    ['./status.md', '/status'],
    ['../status.md', '/status'],
    ['/status.md', '/status'],
    ['openwebui-anleitung.md', '/openwebui-anleitung'],
    ['index.md', '/'],
    ['https://openwebui.kik.spengergasse.at', 'https://openwebui.kik.spengergasse.at'],
    ['https://github.com/x/y.md', 'https://github.com/x/y.md'],
    ['mailto:office@spengergasse.at', 'mailto:office@spengergasse.at'],
    ['#abschnitt', '#abschnitt'],
    ['notes.txt', 'notes.txt'],
    // Legacy hash routes of the old static site become real paths.
    ['#/', '/'],
    ['#/status', '/status'],
    ['#/status/', '/status'],
    ['#/openwebui-anleitung', '/openwebui-anleitung'],
  ]

  it.each(cases)('maps %j to %j', (href, expected) => {
    expect(resolveMarkdownHref(href)).toBe(expected)
  })
})

function element(tagName: string, children: Element['children'] = []): Element {
  return { type: 'element', tagName, properties: {}, children }
}

function anchor(href: string, text: string): Element {
  return {
    type: 'element',
    tagName: 'a',
    properties: { href },
    children: [{ type: 'text', value: text }],
  }
}

function text(value: string): Element['children'][number] {
  return { type: 'text', value }
}

describe('hastText', () => {
  it('flattens inline markup to its visible text', () => {
    const bold: Element = {
      type: 'element',
      tagName: 'strong',
      properties: {},
      children: [{ type: 'element', tagName: 'code', properties: {}, children: [text('@')] }],
    }

    expect(hastText(bold)).toBe('@')
  })
})

describe('linkOnlyAnchors', () => {
  it('accepts a paragraph of links and whitespace', () => {
    const paragraph = element('p', [anchor('a.md', 'A'), text(' '), anchor('b.md', 'B')])

    expect(linkOnlyAnchors(paragraph)?.map(anchorHref)).toEqual(['/a', '/b'])
  })

  it('rejects paragraphs that contain visible text', () => {
    expect(linkOnlyAnchors(element('p', [text('Hallo '), anchor('a.md', 'A')]))).toBeNull()
  })

  it('rejects paragraphs that contain other inline elements', () => {
    const bold = element('strong', [text('fett')])

    expect(linkOnlyAnchors(element('p', [anchor('a.md', 'A'), bold]))).toBeNull()
  })

  it('rejects paragraphs without links', () => {
    expect(linkOnlyAnchors(element('p', [text('nur Text')]))).toBeNull()
    expect(linkOnlyAnchors(element('p'))).toBeNull()
  })
})
