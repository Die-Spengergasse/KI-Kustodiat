import { expect, test, type Page } from '@playwright/test'

/**
 * Structure of the five Markdown subpages (`#45`).
 *
 * The constants below are the document structure of the pages as captured from
 * the old live site (`https://kik.spengergasse.at/#/<slug>`). The pixel
 * comparison against reference screenshots was retired on 2026-10-29 — it
 * blocked content work without catching anything the assertions below would
 * miss.
 */

const PAGES = [
  {
    slug: 'status',
    path: '/status',
    title: 'Status — KI-Kustodiat',
    headings: [
      { level: 1, text: 'Status des Projekts' },
      { level: 2, text: 'Was schon läuft' },
      { level: 2, text: 'Was noch fehlt oder eingeschränkt ist' },
      { level: 2, text: 'Nächste Schritte' },
    ],
    links: [
      '← Zur Startseite',
      'https://openwebui.kik.spengergasse.at',
      'Anleitung',
      'GitHub-Diskussionen',
      'Diskussionen',
      'Startseite',
      'Milestones',
      'Anleitung',
    ],
  },
  {
    slug: 'milestones',
    path: '/milestones',
    title: 'Milestones — KI-Kustodiat',
    headings: [
      { level: 1, text: 'Milestones' },
      { level: 2, text: '✅ M1 — Explorationsphase' },
      { level: 2, text: 'M2 — Beschaffungswünsche abklären' },
      { level: 2, text: 'M3 — Zentrale Modellversorgung' },
    ],
    links: [
      '← Zur Startseite',
      '#3',
      '#19',
      '#21',
      '#22',
      '#24',
      '#29',
      '#30',
      '#31',
      '#14',
      '#32',
      '#2',
      '#6',
      '#7',
      '#15',
      '#17',
      '#18',
      '#20',
      'Startseite',
      'Status',
    ],
  },
  {
    slug: 'angebote',
    path: '/angebote',
    title: 'Angebote — KI-Kustodiat',
    headings: [
      { level: 1, text: 'Angebote' },
      { level: 2, text: 'Token-Preise (API)' },
      { level: 2, text: 'Gratis- und Bildungsangebote' },
      { level: 2, text: 'Hardware für eigene Inferenz' },
      { level: 3, text: 'Kompaktklasse (bis ca. 192 GB Speicher)' },
      { level: 3, text: 'Regal-/Server-Klasse (ab 256 GB Speicher)' },
      { level: 3, text: 'Beschaffungsweg über die BBG' },
    ],
    links: [
      '← Zur Startseite',
      'Preisseite',
      'Preisseite',
      'Preisseite',
      'Preisseite',
      'Modell-/Preisseite',
      'Preisseite',
      'Preisseite',
      'Preisseite',
      'Preisseite',
      'Rate-Limits',
      'Preisseite',
      'Katalog-API',
      'Azure for Students',
      'GitHub Docs',
      'Preisseite',
      'Apple Newsroom',
      'VideoCardz',
      'ComputingForGeeks',
      'ComputingForGeeks',
      'NVIDIA',
      'tech-insider',
      'Apple Specs',
      'ComputingForGeeks',
      'NVIDIA',
      'Spheron',
      'Apple Specs',
      'TechRepublic',
      'UpStation',
      'UpStation',
      'UpStation',
      'UpStation',
      'Aktuelle Verträge',
      'Aktuelle Ausschreibungen',
      'SSN 2026-3 im Vergabeportal',
      'Startseite',
      'Status',
      'Milestones',
    ],
  },
  {
    slug: 'faq',
    path: '/faq',
    title: 'FAQ — KI-Kustodiat',
    headings: [{ level: 1, text: 'FAQ — häufig gestellte Fragen' }],
    links: ['← Zur Startseite', 'Startseite', 'Status', 'Anleitung'],
  },
  {
    slug: 'anleitung/tokens',
    path: '/anleitung/tokens',
    title: 'Anleitung Tokens — KI-Kustodiat',
    headings: [
      { level: 1, text: 'Anleitung Tokens' },
      { level: 2, text: 'Wofür brauchst du einen Token?' },
      { level: 2, text: 'Token erzeugen' },
      { level: 2, text: 'Chat und Coding' },
      { level: 2, text: 'Diktat (Sprache zu Text)' },
      { level: 2, text: 'Grenzen und Kontingent' },
      { level: 2, text: 'Sicherheit' },
      { level: 2, text: 'Wenn etwas nicht geht' },
      { level: 2, text: 'Datenschutz in zwei Sätzen' },
    ],
    links: [
      '← Zur Startseite',
      'https://openwebui.kik.spengergasse.at',
      'https://kik.spengergasse.at/tokens',
      'https://kik.spengergasse.at/tokens',
      'Startseite',
      'Status',
      'FAQ',
    ],
  },
  {
    slug: 'anleitung/openwebui',
    path: '/anleitung/openwebui',
    title: 'Anleitung Open WebUI — KI-Kustodiat',
    headings: [
      { level: 1, text: 'Anleitung Open WebUI' },
      { level: 2, text: 'Anmelden' },
      { level: 2, text: 'Warum Open WebUI?' },
      { level: 2, text: 'Infrastruktur & Modelle' },
      { level: 2, text: 'Eigenes Modell einbinden (Personal Connections / BYOK)' },
      { level: 2, text: 'Hinweis: nicht OpenCode-kompatibel' },
    ],
    links: [
      '← Zur Startseite',
      'https://openwebui.kik.spengergasse.at',
      'https://openwebui.com',
      'platform.openai.com/api-keys',
      'console.anthropic.com',
      'aistudio.google.com/apikey',
      'console.mistral.ai',
      'console.groq.com/keys',
      'openrouter.ai/keys',
      'Modellliste',
      'console.x.ai',
      'https://openrouter.ai/blog/tutorials/free-llm-apis-compared/',
      'Startseite',
      'Status',
    ],
  },
] as const

/** Headings and links a visitor actually sees — the hidden home markup of the
 *  old hash router must not be counted. */
function visibleHeadings(page: Page, selector: string) {
  return page.locator(selector).evaluateAll((elements) =>
    elements
      .filter((element) => {
        const rect = element.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      })
      .map((element) => ({
        level: Number(element.tagName.slice(1)),
        text: (element.textContent ?? '').trim(),
      })),
  )
}

function visibleLinkLabels(page: Page) {
  return page.locator('main a').evaluateAll((elements) =>
    elements
      .filter((element) => {
        const rect = element.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      })
      .map((element) => (element.textContent ?? '').trim().replace(/\s+/g, ' ')),
  )
}

test.describe('markdown pages at real paths', () => {
  for (const pageDef of PAGES) {
    test(`${pageDef.path} matches the live page structure`, async ({ page }) => {
      await page.goto(pageDef.path)

      await expect(page).toHaveTitle(pageDef.title)
      // 200 + prerendered text, not a "Lade …" placeholder.
      await expect(page.locator('main')).not.toContainText('Lade …')

      expect(await visibleHeadings(page, 'main h1, main h2, main h3, main h4')).toEqual(
        pageDef.headings,
      )
      expect(await visibleLinkLabels(page)).toEqual(pageDef.links)

      // The old hash router is gone: no `.md` targets and no `#/…` links left.
      await expect(page.locator('a[href$=".md"]')).toHaveCount(0)
      const hrefs = await page
        .locator('main a')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''))
      expect(hrefs.filter((href) => href.startsWith('#/'))).toEqual([])

      // The one link the layout adds outside the Markdown.
      await expect(page.locator('main a').first()).toHaveAttribute('href', '/')
      await expect(page.locator('main a').first()).toHaveText('← Zur Startseite')
    })

    test(`${pageDef.path} only links to pages that answer 200`, async ({ page, request }) => {
      await page.goto(pageDef.path)

      const internal = await page
        .locator('main a')
        .evaluateAll((links) =>
          links
            .map((link) => link.getAttribute('href') ?? '')
            .filter((href) => href.startsWith('/')),
        )

      expect(internal.length).toBeGreaterThan(0)
      for (const href of [...new Set(internal)]) {
        const response = await request.get(href)
        expect(response.status(), href).toBe(200)
      }
    })
  }

  test('every prerendered document carries its full text without JavaScript', async ({
    request,
  }) => {
    for (const pageDef of PAGES) {
      const response = await request.get(pageDef.path)

      expect(response.status(), pageDef.path).toBe(200)
      expect(response.headers()['content-type']).toContain('text/html')

      const html = (await response.text())
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
      for (const heading of pageDef.headings) {
        expect(html, `${pageDef.path} → ${heading.text}`).toContain(
          `<h${heading.level}>${heading.text}</h${heading.level}>`,
        )
      }
      expect(html).not.toContain('Lade …')
    }
  })
})

test.describe('legacy hash routes', () => {
  for (const pageDef of PAGES) {
    test(`#/${pageDef.slug} redirects to ${pageDef.path}`, async ({ page }) => {
      await page.goto(`/#/${pageDef.slug}`)

      await expect(page).toHaveURL(new RegExp(`${pageDef.path}$`))
      await expect(page).toHaveTitle(pageDef.title)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(pageDef.headings[0].text)
    })
  }
})
