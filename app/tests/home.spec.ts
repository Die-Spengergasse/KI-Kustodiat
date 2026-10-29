import { expect, test } from '@playwright/test'

/**
 * Start-page structure (`#44`, reworked in `#57`).
 *
 * The start page is a lead paragraph plus one tile per `##` group of
 * `website/content/index.md`. What this suite protects: the four groups and
 * their order, that the links inside them are ordinary links (the oversized
 * button cards are gone on purpose), and no external requests.
 */

/** Live page anchors inside `<main>`, in document order. */
const LIVE_MAIN_LINKS = [
  // Dienste
  'https://openwebui.kik.spengergasse.at',
  '/anleitung/tokens',
  '/anleitung/tokens',
  // Tokens
  '/tokens',
  '/anleitung/tokens',
  // Dokumentation
  '/anleitung/openwebui',
  '/status',
  '/milestones',
  '/angebote',
  '/faq',
  // Diskussion
  'https://github.com/Die-Spengergasse/KI-Kustodiat/discussions',
  'https://github.com/Die-Spengergasse/KI-Kustodiat',
]

const LIVE_H1 = 'KI-Kustodiat der Spengergasse'

const LIVE_GROUPS = ['Dienste', 'Tokens', 'Dokumentation', 'Diskussion']

test.describe('start page structure', () => {
  test('renders the four tile groups and the same links as the live page', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(LIVE_H1)
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(LIVE_GROUPS)
    await expect(page.getByRole('heading', { level: 3 })).toHaveCount(0)

    // Header: brand link, theme toggle, light/dark logo — nothing else.
    const header = page.locator('header')
    await expect(header.getByRole('link', { name: 'KI-Kustodiat' })).toHaveAttribute('href', '/')
    await expect(header.getByRole('button')).toHaveCount(1)
    await expect(header.getByRole('button')).toHaveAccessibleName('Farbschema wechseln')
    await expect(header.getByRole('button')).toHaveText(/^Farbschema: (Auto|Hell|Dunkel)$/)
    await expect(
      header.getByRole('link', { name: 'HTL Spengergasse — Startseite' }),
    ).toHaveAttribute('href', '/')

    // Content: one tile per group, ordinary links inside.
    const main = page.getByRole('main')
    const tiles = main.locator('.tiles article.ui-card')
    await expect(tiles).toHaveCount(LIVE_GROUPS.length)
    await expect(tiles.locator('.ui-card__title')).toHaveText(LIVE_GROUPS)

    await expect(main.locator('a')).toHaveCount(LIVE_MAIN_LINKS.length)
    expect(
      await main.locator('a').evaluateAll((links) => links.map((a) => a.getAttribute('href'))),
    ).toEqual(LIVE_MAIN_LINKS)

    // No button markup in the content area any more (#57).
    await expect(main.locator('.ui-button')).toHaveCount(0)

    // `.md` Markdown links are real routes now, not hash routes.
    await expect(page.locator('a[href$=".md"]')).toHaveCount(0)
    await expect(main.getByRole('link', { name: 'Anleitung Tokens' })).toHaveAttribute(
      'href',
      '/anleitung/tokens',
    )
    await expect(main.getByRole('link', { name: 'Tokenverwaltung' })).toHaveAttribute(
      'href',
      '/tokens',
    )

    // Footer of the old page.
    const footer = page.locator('footer')
    await expect(footer).toContainText('Georg Graf')
    await expect(footer.getByRole('link')).toHaveAttribute(
      'href',
      'https://github.com/Die-Spengergasse/KI-Kustodiat',
    )

    // The main links above, plus skip link, header brand and logo link, footer.
    await expect(page.locator('a')).toHaveCount(LIVE_MAIN_LINKS.length + 4)
    await expect(page.locator('a.skip-link')).toHaveAttribute('href', '#main')
  })

  test('shows the theme-specific logo', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('kik-theme', 'dark'))
    await page.goto('/')

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.locator('.logo img.logo-dark')).toBeVisible()
    await expect(page.locator('.logo img.logo-light')).toBeHidden()

    await page.getByRole('button', { name: 'Farbschema wechseln' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'auto')
    await expect(page.locator('.logo img.logo-light')).toBeVisible()
  })

  test('serves the full start page text without JavaScript', async ({ request }) => {
    const response = await request.get('/')
    expect(response.status()).toBe(200)
    const html = await response.text()

    expect(response.headers()['content-type']).toContain('text/html')
    expect(html).toContain('<h1>KI-Kustodiat der Spengergasse</h1>')
    expect(html).toContain('Es gibt schon ein bisschen was:')
    for (const group of LIVE_GROUPS) {
      expect(html).toContain(`<h2 class="ui-card__title">${group}</h2>`)
    }
    expect(html).toContain('Open WebUI Chat')
    expect(html).toContain('href="/status"')
    expect(html).toContain('href="/faq"')
    expect(html).toContain('href="/tokens"')
    expect(html).not.toContain('Lade …')
  })

  test('hydrates without console errors or external requests', async ({ page, baseURL }) => {
    const externalRequests: string[] = []
    const consoleErrors: string[] = []

    page.on('request', (request) => {
      const url = request.url()
      // Compare against the origin under test, not a hardcoded port: the suite
      // runs on its own port so it never talks to a deployed instance.
      if (!url.startsWith(new URL(baseURL ?? 'http://127.0.0.1').origin) && !url.startsWith('data:')) {
        externalRequests.push(url)
      }
    })
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text())
      }
    })
    page.on('pageerror', (error) => consoleErrors.push(error.message))

    await page.goto('/')
    // A hydration mismatch would show up as a console error during this idle wait.
    await page.waitForLoadState('networkidle')

    expect(externalRequests).toEqual([])
    expect(consoleErrors).toEqual([])
  })
})
