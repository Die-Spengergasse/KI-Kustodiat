/**
 * Captures the *live* start page as the visual reference for the parity test
 * (`tests/home.spec.ts`). Run `npm run capture:reference` when the live page
 * changes on purpose; the PNGs land in `tests/reference/` and are committed.
 *
 * The capture settings must stay in sync with the test: full page, device scale
 * factor 1, reduced motion, and the theme forced through `localStorage`
 * (`kik-theme`), which is how a visitor's choice is stored.
 */

import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const LIVE_URL = process.env.KIK_REFERENCE_URL ?? 'https://kik.spengergasse.at/'
const OUTPUT_DIR = path.join(process.cwd(), 'tests', 'reference')

const CASES = [
  { name: 'desktop-light', width: 1280, height: 900, theme: 'light' },
  { name: 'desktop-dark', width: 1280, height: 900, theme: 'dark' },
  { name: 'mobile-light', width: 390, height: 844, theme: 'light' },
  { name: 'mobile-dark', width: 390, height: 844, theme: 'dark' },
] as const

async function main(): Promise<void> {
  await mkdir(OUTPUT_DIR, { recursive: true })

  const browser = await chromium.launch()
  try {
    for (const testCase of CASES) {
      const context = await browser.newContext({
        viewport: { width: testCase.width, height: testCase.height },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      })

      await context.addInitScript((theme) => {
        window.localStorage.setItem('kik-theme', theme)
      }, testCase.theme)

      const page = await context.newPage()
      await page.goto(LIVE_URL, { waitUntil: 'networkidle' })
      await page.waitForFunction(
        (theme) => document.documentElement.getAttribute('data-theme') === theme,
        testCase.theme,
      )

      const file = path.join(OUTPUT_DIR, `${testCase.name}.png`)
      await page.screenshot({ path: file, fullPage: true })
      console.log(`captured ${path.relative(process.cwd(), file)}`)

      await context.close()
    }
  } finally {
    await browser.close()
  }
}

await main()
