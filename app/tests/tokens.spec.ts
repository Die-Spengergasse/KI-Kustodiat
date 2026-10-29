import { expect, test } from '@playwright/test'

/**
 * `/tokens` (Issues #47/#57) is the client-rendered authenticated area. It must
 * stay unindexed in both modes and always offer the LDAP login form — the form
 * is rendered even when the API is not configured (a fresh clone / CI), only
 * the submit then reports the missing deployment.
 */
test.describe('token management', () => {
  test('serves the noindex login page', async ({ page }) => {
    const response = await page.goto('/tokens')
    expect(response?.status()).toBe(200)
    expect(response?.headers()['x-robots-tag']).toContain('noindex')

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    await expect(page.locator('h1')).toHaveText('Tokenverwaltung')

    await expect(page.getByLabel('Benutzername')).toBeVisible()
    await expect(page.getByLabel('Passwort')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Anmelden' })).toBeVisible()
  })

  test('never shows a session without logging in', async ({ page }) => {
    const response = await page.request.get('/api/auth/me')
    // 401 = configured portal without a session, 503 = deployment not configured.
    expect([401, 503]).toContain(response.status())
    expect(response.headers()['cache-control']).toBe('no-store')
  })

  test('the login API rejects a POST without a CSRF token', async ({ page }) => {
    const response = await page.request.post('/api/auth/login', {
      data: { username: 'nobody', password: 'nothing' },
      failOnStatusCode: false,
    })
    expect([403, 503]).toContain(response.status())
  })
})

/**
 * `/tokens/keys` and `/tokens/usage` (Issue #48) are pages of the same noindex
 * shell: without a session they must still render the login form, never a key or
 * a number, and the API must answer without leaking anything.
 */
test.describe('token management pages', () => {
  for (const path of ['/tokens/keys', '/tokens/usage'] as const) {
    test(`${path} serves the noindex login shell`, async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      expect(response?.headers()['x-robots-tag']).toContain('noindex')

      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
      await expect(page.locator('h1')).toHaveText('Tokenverwaltung')
      await expect(page.getByLabel('Benutzername')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Anmelden' })).toBeVisible()
      // No secret and no usage number before login.
      await expect(page.locator('.key-secret')).toHaveCount(0)
      await expect(page.locator('.usage-meter')).toHaveCount(0)
    })
  }

  test('the key and usage APIs answer 401 without a session', async ({ page }) => {
    for (const path of ['/api/keys', '/api/usage/summary']) {
      const response = await page.request.get(path)
      // 401 = configured portal, 503 = deployment not configured (CI/fresh clone).
      expect([401, 503]).toContain(response.status())
      expect(response.headers()['cache-control']).toBe('no-store')
    }
  })

  test('creating a key via the API needs a session and a CSRF token', async ({ page }) => {
    const response = await page.request.post('/api/keys', {
      data: { label: 'playwright' },
      failOnStatusCode: false,
    })
    expect([401, 403, 503]).toContain(response.status())
  })
})
