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
    const html = render('Siehe [Status](status.md) und [Anleitung](./openwebui-anleitung.md).')

    expect(html).toContain('href="/status"')
    expect(html).toContain('href="/openwebui-anleitung"')
    expect(html).not.toContain('.md"')
  })

  it('turns a single-link paragraph into one filled button', () => {
    const html = render('[Open WebUI Chat öffnen](https://openwebui.kik.spengergasse.at)')

    expect(html).toBe(
      '<p><a class="ui-button ui-button--primary" href="https://openwebui.kik.spengergasse.at">' +
        'Open WebUI Chat öffnen</a></p>',
    )
  })

  it('turns a multi-link paragraph into the card grid with outline buttons', () => {
    const html = render(
      '[Chat](https://openwebui.kik.spengergasse.at) [Anleitung](openwebui-anleitung.md)',
    )

    expect(html).toBe(
      '<div class="cards">' +
        '<a class="ui-button ui-button--outline" href="https://openwebui.kik.spengergasse.at">Chat</a>' +
        '<a class="ui-button ui-button--outline" href="/openwebui-anleitung">Anleitung</a>' +
        '</div>',
    )
  })

  it('keeps link-only paragraphs as written when linkButtons is false', () => {
    const html = renderToStaticMarkup(
      createElement(MarkdownContent, {
        markdown:
          '[Chat](https://openwebui.kik.spengergasse.at) [Anleitung](openwebui-anleitung.md)',
        linkButtons: false,
      }),
    )

    expect(html).toBe(
      '<p><a href="https://openwebui.kik.spengergasse.at">Chat</a> ' +
        '<a href="/openwebui-anleitung">Anleitung</a></p>',
    )
  })

  it('keeps normal paragraphs, including their inline links', () => {
    const html = render('Für den Chat ist ein **Login** nötig, siehe [Status](status.md).')

    expect(html).toContain('<p>Für den Chat ist ein <strong>Login</strong> nötig')
    expect(html).toContain('<a href="/status">Status</a>')
    expect(html).not.toContain('cards')
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
