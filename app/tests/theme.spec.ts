import { expect, test } from '@playwright/test'

const STORAGE_KEY = 'kik-theme'

test.describe('theme handling', () => {
  test('toggle cycles auto → light → dark → auto and persists the mode', async ({ page }) => {
    await page.goto('/_design')
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()

    const html = page.locator('html')
    const toggle = page.getByRole('button', { name: 'Farbschema wechseln' })
    const stored = () => page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)

    await expect(html).toHaveAttribute('data-theme', 'auto')
    await expect(toggle).toHaveText('Farbschema: Auto')

    await toggle.click()
    await expect(html).toHaveAttribute('data-theme', 'light')
    await expect(toggle).toHaveText('Farbschema: Hell')
    expect(await stored()).toBe('light')

    await toggle.click()
    await expect(html).toHaveAttribute('data-theme', 'dark')
    await expect(toggle).toHaveText('Farbschema: Dunkel')
    expect(await stored()).toBe('dark')

    await toggle.click()
    await expect(html).toHaveAttribute('data-theme', 'auto')
    await expect(toggle).toHaveText('Farbschema: Auto')
    expect(await stored()).toBe('auto')

    // The choice survives a reload and is applied before the app hydrates.
    await toggle.click()
    await page.reload()
    await expect(html).toHaveAttribute('data-theme', 'light')
    await expect(toggle).toHaveText('Farbschema: Hell')
  })

  test('auto follows prefers-color-scheme, explicit modes pin the palette', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('kik-theme', 'auto'))
    // Reduced motion keeps the 0.2s colour transition out of the measurement.
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
    await page.goto('/_design')

    const canvas = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    const lightCanvas = await canvas()
    expect(lightCanvas).toBe('rgb(255, 255, 255)')

    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
    // `light-dark()` re-resolves on the next style recalc, not synchronously.
    await expect.poll(canvas).not.toBe(lightCanvas)
    const darkCanvas = await canvas()

    // Pinning the mode ignores the OS preference.
    await page.getByRole('button', { name: 'Farbschema wechseln' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await expect.poll(canvas).toBe(lightCanvas)

    await page.getByRole('button', { name: 'Farbschema wechseln' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect.poll(canvas).toBe(darkCanvas)
  })

  test('the served document already carries data-theme and the boot script', async ({
    page,
    request,
  }) => {
    const response = await request.get('/_design')
    const html = await response.text()

    expect(html).toMatch(/<html[^>]*data-theme="auto"/)
    expect(html).toContain(STORAGE_KEY)

    // The boot script has to run before the app entry (first paint). In dev Vite
    // injects its HMR client right at the top of <head>, hence the check against
    // the application entry instead of the first module script.
    const bootScript = html.indexOf('localStorage.getItem')
    const appEntry = html.indexOf('/src/main.tsx')
    expect(bootScript).toBeGreaterThan(-1)
    expect(appEntry).toBeGreaterThan(bootScript)

    await page.goto('/_design')
    await expect(page.locator('html')).toHaveAttribute('data-theme')
  })
})
