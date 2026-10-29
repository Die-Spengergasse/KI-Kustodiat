/**
 * LiteLLM provisioning integration test (Issue #47).
 *
 * Opt-in — talks to the real gateway on `127.0.0.1:4000` with the proxy-admin key:
 *
 *   PORTAL_LITELLM_TEST=1 npm test -- server/auth/provisioning.integration.test.ts
 *
 * Uses a throw-away `ap5-test` user and deletes it again, so the gateway's user
 * list is left exactly as it was.
 */

import { afterAll, describe, expect, it } from 'vitest'
import { loadPortalConfig } from '../config'
import { testConfig } from '../testing/fixtures'
import { deleteLitellmUser, findLitellmUser, provisionLitellmUser } from './provisioning'

const configResult = loadPortalConfig()
const config = configResult.ok ? configResult.config : null
const enabled =
  process.env.PORTAL_LITELLM_TEST === '1' && config !== null && config.litellm.adminKey !== ''

const TEST_USER_ID = 'ap5-test'

// The block body runs even when skipped, so fall back to the fixture config.
const litellmConfig = (config ?? testConfig()).litellm

describe.skipIf(!enabled)('LiteLLM provisioning', () => {
  const litellm = litellmConfig

  afterAll(async () => {
    await deleteLitellmUser(litellm, TEST_USER_ID).catch(() => undefined)
  })

  it('creates the gateway user once and is idempotent on the second call', async () => {
    await deleteLitellmUser(litellm, TEST_USER_ID).catch(() => undefined)

    const created = await provisionLitellmUser(litellm, {
      userId: TEST_USER_ID,
      alias: 'AP5 Provisioning Test',
      mail: null,
    })
    expect(created).toEqual({ userId: TEST_USER_ID, created: true })
    expect(await findLitellmUser(litellm, TEST_USER_ID)).toEqual({ user_id: TEST_USER_ID })

    const again = await provisionLitellmUser(litellm, {
      userId: TEST_USER_ID,
      alias: 'AP5 Provisioning Test',
      mail: null,
    })
    expect(again).toEqual({ userId: TEST_USER_ID, created: false })
  })

  it('deletes the user again (cleanup path)', async () => {
    expect(await deleteLitellmUser(litellm, TEST_USER_ID)).toBe(true)
    expect(await findLitellmUser(litellm, TEST_USER_ID)).toBeNull()
  })
})
