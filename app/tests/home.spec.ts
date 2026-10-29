import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import { decodePng, diffImages } from './png'

/**
 * Start-page parity (`#44`).
 *
 * The reference PNGs in `tests/reference/` are screenshots of the *live* page
 * (`npm run capture:reference` against https://kik.spengergasse.at/), so these
 * tests answer two questions:
 *  - does the app render the same structure and labels as the live page?
 *  - does it look the same, pixel for pixel, in both themes and viewports?
 */

const REFERENCE_DIR = path.join(import.meta.dirname, 'reference')

const CASES = [
  { name: 'desktop-light', width: 1280, height: 900, theme: 'light' },
  { name: 'desktop-dark', width: 1280, height: 900, theme: 'dark' },
  { name: 'mobile-light', width: 390, height: 844, theme: 'light' },
  { name: 'mobile-dark', width: 390, height: 844, theme: 'dark' },
] as const

/** Live page anchors inside `<main>`, in document order. */
const LIVE_MAIN_LINKS = [
  'https://openwebui.kik.spengergasse.at',
  '/openwebui-anleitung',
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

    // 10 anchors like the live page, plus the app's skip link.
    await expect(page.locator('a')).toHaveCount(11)
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

test.describe('start page pixel parity with the live site', () => {
  // Same media emulation as the reference capture: no transitions mid-shot.
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  for (const testCase of CASES) {
    test(`looks like the live page — ${testCase.name}`, async ({ page }) => {
      await page.setViewportSize({ width: testCase.width, height: testCase.height })
      await page.addInitScript(
        (theme) => window.localStorage.setItem('kik-theme', theme),
        testCase.theme,
      )

      await page.goto('/')
      await expect(page.locator('html')).toHaveAttribute('data-theme', testCase.theme)
      await page.waitForLoadState('networkidle')

      const reference = decodePng(readFileSync(path.join(REFERENCE_DIR, `${testCase.name}.png`)))
      const actual = decodePng(await page.screenshot({ fullPage: true }))
      const diff = diffImages(reference, actual)

      console.log(
        `${testCase.name}: ${diff.differingPixels}/${diff.totalPixels} px differ ` +
          `(${(diff.ratio * 100).toFixed(4)} %, max channel delta ${diff.maxChannelDelta})`,
      )

      expect(actual.width, 'viewport width').toBe(reference.width)
      expect(actual.height, 'document height').toBe(reference.height)
      expect(diff.ratio, 'pixel-diff ratio').toBeLessThan(0.002)
    })
  }
})
