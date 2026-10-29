/**
 * Captures the *live* pages as the visual reference for the parity tests
 * (`tests/home.spec.ts`, `tests/pages.spec.ts`). Run `npm run capture:reference`
 * when the live pages change on purpose; the PNGs land in `tests/reference/` and
 * are committed.
 *
 * The live site still routes its subpages through the old hash router
 * (`https://kik.spengergasse.at/#/status`), the app serves them as prerendered
 * documents (`/status`). Both are captured at the same viewports so the tests can
 * compare the app against what visitors see today.
 *
 * The capture settings must stay in sync with the tests: full page, device scale
 * factor 1, reduced motion, and the theme forced through `localStorage`
 * (`kik-theme`), which is how a visitor's choice is stored.
 */

import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

/** Base URL of the live site; the legacy hash routes are appended to it. */
const LIVE_URL = process.env.KIK_REFERENCE_URL ?? 'https://kik.spengergasse.at/'
const OUTPUT_DIR = path.join(process.cwd(), 'tests', 'reference')

interface CaptureCase {
  /** File name inside `tests/reference/` (without `.png`). */
  name: string
  /** Legacy hash route of the live site; `''` for the start page. */
  hash: string
  width: number
  height: number
  theme: string
  /** `<h1>` of the page; used to wait for the hash router to render the content. */
  heading: string
}

const SUBPAGES = [
  { name: 'status', hash: '#/status', heading: 'Status des Projekts' },
  { name: 'milestones', hash: '#/milestones', heading: 'Milestones' },
  { name: 'angebote', hash: '#/angebote', heading: 'Angebote' },
  { name: 'faq', hash: '#/faq', heading: 'FAQ — häufig gestellte Fragen' },
  {
    name: 'openwebui-anleitung',
    hash: '#/openwebui-anleitung',
    heading: 'Open WebUI — Anleitung',
  },
] as const

const VIEWPORTS = [
  { label: 'desktop', width: 1280, height: 900 },
  { label: 'mobile', width: 390, height: 844 },
] as const

const CASES: CaptureCase[] = [
  // Start page: both themes, both viewports (existing baselines).
  ...VIEWPORTS.flatMap((viewport) =>
    ['light', 'dark'].map((theme) => ({
      name: `${viewport.label}-${theme}`,
      hash: '',
      width: viewport.width,
      height: viewport.height,
      theme,
      heading: 'KI-Kustodiat der Spengergasse',
    })),
  ),
  // Subpages: light only — dark is the same CSS and is proven on the start page.
  ...SUBPAGES.flatMap((page) =>
    VIEWPORTS.map((viewport) => ({
      name: `${page.name}-${viewport.label}-light`,
      hash: page.hash,
      width: viewport.width,
      height: viewport.height,
      theme: 'light',
      heading: page.heading,
    })),
  ),
]

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
      await page.goto(`${LIVE_URL}${testCase.hash}`, { waitUntil: 'networkidle' })
      await page.waitForFunction(
        (theme) => document.documentElement.getAttribute('data-theme') === theme,
        testCase.theme,
      )
      // The old hash router fills `#page-content` asynchronously; the home page
      // renders its `<h1>` from `index.md` the same way.
      await page.waitForFunction(
        (heading) =>
          [...document.querySelectorAll('main h1')].some(
            (element) => element.textContent?.trim() === heading,
          ),
        testCase.heading,
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
