import { expect, test } from '@playwright/test'

/**
 * Start-page structure (`#44`).
 *
 * The migration from the Pico page to React was accepted with a pixel comparison
 * against screenshots of the old live page. That comparison has served its
 * purpose and was retired (2026-10-29): a frozen snapshot of a retired page
 * blocks every content change. What stays is the part that catches real
 * mistakes — headings, labels, the link set, and no external requests.
 */

/** Live page anchors inside `<main>`, in document order. */
const LIVE_MAIN_LINKS = [
  'https://openwebui.kik.spengergasse.at',
  '/openwebui-anleitung',
  '/anleitung',
  '/status',
  '/milestones',
  '/angebote',
  'https://github.com/Die-Spengergasse/KI-Kustodiat/discussions',
  '/faq',
]

const LIVE_H1 = 'KI-Kustodiat der Spengergasse'

const LIVE_H2 = ['Open WebUI Chat', 'Überblick']

test.describe('start page structure', () => {
  test('renders hero, sections and the same links as the live page', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(LIVE_H1)
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(LIVE_H2)
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

    // Content: the link paragraphs became a card grid, everything else stayed.
    const main = page.getByRole('main')
    await expect(main.locator('a')).toHaveCount(LIVE_MAIN_LINKS.length)
    expect(
      await main.locator('a').evaluateAll((links) => links.map((a) => a.getAttribute('href'))),
    ).toEqual(LIVE_MAIN_LINKS)

    const cards = main.locator('.cards a')
    await expect(cards).toHaveCount(2)
    await expect(cards).toHaveText(['Open WebUI Chat öffnen', 'Anleitung'])
    for (const card of await cards.all()) {
      await expect(card).toHaveClass(/ui-button--outline/)
    }

    // `.md` Markdown links are real routes now, not hash routes.
    await expect(page.locator('a[href$=".md"]')).toHaveCount(0)
    await expect(main.getByRole('link', { name: 'Status' })).toHaveAttribute('href', '/status')

    // Footer of the old page.
    const footer = page.locator('footer')
    await expect(footer).toContainText('Georg Graf')
    await expect(footer.getByRole('link')).toHaveAttribute(
      'href',
      'https://github.com/Die-Spengergasse/KI-Kustodiat',
    )

    // The main links above, plus skip link, header brand and logo link.
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
    expect(html).toContain('es gibt schon ein bisschen was:')
    expect(html).toContain('<h2>Open WebUI Chat</h2>')
    expect(html).toContain('<h2>Überblick</h2>')
    expect(html).toContain('Open WebUI Chat öffnen')
    expect(html).toContain('href="/status"')
    expect(html).toContain('href="/faq"')
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
