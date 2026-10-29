import { describe, expect, it } from 'vitest'
import { resolveMarkdownHref, splitMarkdownSections } from './markdown'

describe('resolveMarkdownHref', () => {
  const cases: Array<[string, string]> = [
    ['status.md', '/status'],
    ['./status.md', '/status'],
    ['../status.md', '/status'],
    ['/status.md', '/status'],
    ['anleitung/tokens.md', '/anleitung/tokens'],
    ['./anleitung/openwebui.md', '/anleitung/openwebui'],
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
    ['#/anleitung/openwebui', '/anleitung/openwebui'],
  ]

  it.each(cases)('maps %j to %j', (href, expected) => {
    expect(resolveMarkdownHref(href)).toBe(expected)
  })
})

describe('splitMarkdownSections', () => {
  const markdown = [
    '# Titel',
    '',
    'Einleitung mit **fett**.',
    '',
    '## Erste Gruppe',
    '',
    '- [A](/a)',
    '- [B](/b)',
    '',
    '### Untergruppe',
    '',
    'Text.',
    '',
    '## Zweite Gruppe',
    '',
    '- [C](/c)',
    '',
  ].join('\n')

  it('keeps everything before the first ## heading as the intro', () => {
    expect(splitMarkdownSections(markdown).intro).toBe('# Titel\n\nEinleitung mit **fett**.')
  })

  it('turns every ## heading into a section with its body', () => {
    const { sections } = splitMarkdownSections(markdown)

    expect(sections.map((section) => section.title)).toEqual(['Erste Gruppe', 'Zweite Gruppe'])
    expect(sections[0]?.body).toBe('- [A](/a)\n- [B](/b)\n\n### Untergruppe\n\nText.')
    expect(sections[1]?.body).toBe('- [C](/c)')
  })

  it('returns a single intro when the document has no ## heading', () => {
    const document = splitMarkdownSections('# Nur Titel\n\nText.\n')

    expect(document.sections).toEqual([])
    expect(document.intro).toBe('# Nur Titel\n\nText.')
  })

  it('does not split inside fenced code blocks', () => {
    const document = splitMarkdownSections(
      ['# Titel', '', '## Gruppe', '', '```bash', '## kein Abschnitt', '```', ''].join('\n'),
    )

    expect(document.sections).toHaveLength(1)
    expect(document.sections[0]?.body).toBe('```bash\n## kein Abschnitt\n```')
  })

  it('keeps # and ### lines as content', () => {
    const document = splitMarkdownSections('# Titel\n\n### Unterabschnitt\n')

    expect(document.sections).toEqual([])
    expect(document.intro).toBe('# Titel\n\n### Unterabschnitt')
  })
})
