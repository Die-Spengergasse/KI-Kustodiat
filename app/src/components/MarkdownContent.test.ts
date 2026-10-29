import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MarkdownContent } from './MarkdownContent'

function render(markdown: string): string {
  return renderToStaticMarkup(createElement(MarkdownContent, { markdown }))
}

describe('MarkdownContent', () => {
  it('renders the Markdown elements through the component map', () => {
    const html = render(
      [
        '# Titel',
        '',
        '## Abschnitt',
        '',
        '### Unterabschnitt',
        '',
        'Text mit **fett**, *kursiv* und `code`.',
        '',
        '> Zitat',
        '',
        '- eins',
        '- zwei',
        '',
        '---',
      ].join('\n'),
    )

    expect(html).toContain('<h1>Titel</h1>')
    expect(html).toContain('<h2>Abschnitt</h2>')
    expect(html).toContain('<h3>Unterabschnitt</h3>')
    expect(html).toContain('<strong>fett</strong>')
    expect(html).toContain('<em>kursiv</em>')
    expect(html).toContain('<code>code</code>')
    expect(html).toContain('<blockquote>')
    expect(html).toContain('<ul>')
    expect(html).toContain('<li>eins</li>')
    expect(html).toContain('<hr/>')
  })

  it('rewrites Markdown links to real route paths', () => {
    const html = render('Siehe [Status](status.md) und [Tokens](anleitung/tokens.md).')

    expect(html).toContain('href="/status"')
    expect(html).toContain('href="/anleitung/tokens"')
    expect(html).not.toContain('.md"')
  })

  it('keeps links plain — the start page groups them, it does not button them', () => {
    const html = render(
      '[Open WebUI Chat](https://openwebui.kik.spengergasse.at) [Anleitung](anleitung/openwebui.md)',
    )

    expect(html).toBe(
      '<p><a href="https://openwebui.kik.spengergasse.at">Open WebUI Chat</a> ' +
        '<a href="/anleitung/openwebui">Anleitung</a></p>',
    )
    expect(html).not.toContain('ui-button')
  })

  it('keeps list items with a link and a description', () => {
    const html = render('- [Tokenverwaltung](/tokens) — Schlüssel erzeugen\n')

    expect(html).toBe('<ul>\n<li><a href="/tokens">Tokenverwaltung</a> — Schlüssel erzeugen</li>\n</ul>')
  })

  it('wraps GFM tables in the scroll container', () => {
    const html = render(['| A | B |', '| - | - |', '| 1 | 2 |'].join('\n'))

    expect(html).toContain('<div class="table-scroll"><table>')
    expect(html).toContain('<th>A</th>')
    expect(html).toContain('<td>1</td>')
  })

  it('keeps non-breaking spaces from HTML entities', () => {
    expect(render('vor dem `@` (z.&nbsp;B. Name)')).toContain('z.\u00a0B.')
  })

  it('produces the same markup twice (prerender and hydration agree)', () => {
    const markdown = '# Titel\n\n[Status](status.md)\n'

    expect(render(markdown)).toBe(render(markdown))
  })
})
