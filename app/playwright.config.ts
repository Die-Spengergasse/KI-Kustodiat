import { defineConfig, devices } from '@playwright/test'

// Dedicated port: since #51 the production service owns 127.0.0.1:8080 on kik,
// and reusing it would silently run the suite against the deployed app.
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 8099)
const BASE_URL = `http://127.0.0.1:${PORT}`

/**
 * Browser tests run against the real dev server (`npm run dev`, Vite middleware
 * inside Fastify), not against a mocked DOM: theme boot script, CSS cascade and
 * prerender/hydration are all exercised the way a visitor sees them.
 *
 * Screenshot baselines are generated on Linux/Chromium. They compare with a
 * small tolerance so font rasterisation differences between machines do not
 * produce false failures; regenerate with `npx playwright test --update-snapshots`.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: 'disabled' },
  },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
  ],
  webServer: {
    command: `PORT=${PORT} npm run dev`,
    url: BASE_URL,
    // Never reuse: a stale or production server on the same port must not be
    // mistaken for the one under test.
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
