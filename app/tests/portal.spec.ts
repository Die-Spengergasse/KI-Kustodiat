import { expect, test } from '@playwright/test'

/**
 * `/portal` (Issue #47) is the client-rendered authenticated area. It must stay
 * unindexed in both modes and always offer the LDAP login form — the form is
 * rendered even when the API is not configured (a fresh clone / CI), only the
 * submit then reports the missing deployment.
 */
test.describe('portal', () => {
  test('serves the noindex login page', async ({ page }) => {
    const response = await page.goto('/portal')
    expect(response?.status()).toBe(200)
    expect(response?.headers()['x-robots-tag']).toContain('noindex')

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    await expect(page.locator('h1')).toHaveText('Portal')

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
