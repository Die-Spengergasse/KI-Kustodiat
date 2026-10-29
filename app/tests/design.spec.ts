import { expect, test } from '@playwright/test'

const THEME_CASES = [
  { mode: 'light', label: 'Schema: Hell' },
  { mode: 'dark', label: 'Schema: Dunkel' },
] as const

for (const theme of THEME_CASES) {
  test(`/_design renders all primitives in ${theme.mode}`, async ({ page }) => {
    const externalRequests: string[] = []
    page.on('request', (request) => {
      const url = request.url()
      if (!url.startsWith('http://127.0.0.1:8080') && !url.startsWith('data:')) {
        externalRequests.push(url)
      }
    })

    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text())
      }
    })
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message)
    })

    await page.addInitScript((mode) => {
      window.localStorage.setItem('kik-theme', mode)
    }, theme.mode)

    await page.goto('/_design')

    await expect(page).toHaveTitle('Design-System — KI-Kustodiat')
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme.mode)
    await expect(page.getByRole('heading', { name: 'Design-System', level: 1 })).toBeVisible()

    // Both theme previews are rendered side by side, independent of the page mode.
    await expect(page.getByTestId('preview-light')).toBeVisible()
    await expect(page.getByTestId('preview-dark')).toBeVisible()
    await expect(page.getByRole('heading', { name: theme.label })).toBeVisible()

    // Every primitive is present.
    await expect(page.getByRole('button', { name: 'Primär', exact: true }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Outline als Link' }).first()).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Karte mit Titel' }).first()).toBeVisible()
    await expect(page.getByRole('table').first()).toBeVisible()
    await expect(page.getByRole('blockquote').first()).toBeVisible()

    // The built app must not load anything from the network.
    expect(externalRequests).toEqual([])
    expect(consoleErrors).toEqual([])

    await expect(page).toHaveScreenshot(`design-${theme.mode}.png`, { fullPage: true })
  })
}

test('every keyboard focus stop paints a visible ring', async ({ page }) => {
  await page.goto('/_design')

  for (let stop = 0; stop < 20; stop += 1) {
    await page.keyboard.press('Tab')
    // The ring is a 0.2s box-shadow transition; let it finish.
    await page.waitForTimeout(250)

    const focus = await page.evaluate(() => {
      const element = document.activeElement
      if (!(element instanceof HTMLElement)) {
        return null
      }
      return {
        tag: element.tagName.toLowerCase(),
        text: (element.textContent ?? '').trim().slice(0, 40),
        boxShadow: getComputedStyle(element).boxShadow,
      }
    })

    expect(focus).not.toBeNull()
    expect(focus?.tag, `focus stop ${stop + 1}`).toMatch(/^(a|button)$/)
    expect(focus?.boxShadow, `focus stop ${stop + 1} (${focus?.text})`).not.toBe('none')
  }
})
