/**
 * Admin credit store (Issue #64) against fixture schemas.
 *
 * The query joins the portal tables with the LiteLLM facade, so the fixture
 * needs both shapes. The test pins down the three traps of that join:
 *   - accounts without a gateway row still appear (no inner join)
 *   - the "granted this period" sum compares against the gateway reset date,
 *     not against the calendar month
 *   - a search never leaks accounts it does not match
 *
 *   PORTAL_DB_TEST=1 npm test -- server/admin/store.test.ts
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { loadPortalConfig } from '../config'
import { closeDatabase, getPool } from '../db/client'
import { testConfig } from '../testing/fixtures'
import { createAdminStore } from './store'

const configResult = loadPortalConfig()
const enabled = process.env.PORTAL_DB_TEST === '1' && configResult.ok
const persistenceConfig = (configResult.ok ? configResult.config : null) ?? testConfig()
const SUFFIX = `${process.pid.toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`
const PORTAL = `portal_fixture_${SUFFIX}`
const LITELLM = `litellm_fixture_${SUFFIX}`

const CURRENT_RESET = '2026-12-01T00:00:00Z'
const PREVIOUS_RESET = '2026-11-01T00:00:00Z'

describe.skipIf(!enabled)('admin credit store (fixture schema)', () => {
  const pool = getPool(persistenceConfig.databaseUrl)
  const store = createAdminStore(pool, { portalSchema: PORTAL, litellmSchema: LITELLM })
  let maxUserId = ''

  beforeAll(async () => {
    await pool.query(`create schema "${PORTAL}"`)
    await pool.query(`create schema "${LITELLM}"`)
    await pool.query(`create table "${PORTAL}".users (
      id uuid primary key default gen_random_uuid(),
      sam text not null unique,
      display_name text not null,
      role text not null,
      last_login_at timestamp with time zone
    )`)
    await pool.query(`create table "${PORTAL}".credit_grant (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null,
      amount_usd numeric(10,2) not null,
      max_budget_after_usd numeric(10,2) not null,
      note text,
      granted_by uuid,
      resets_at timestamp with time zone,
      created_at timestamp with time zone not null default now()
    )`)
    await pool.query(`create table "${LITELLM}".v_user (
      user_id text,
      max_budget double precision,
      spend double precision,
      budget_reset_at timestamp with time zone
    )`)

    const users = await pool.query<{ id: string }>(
      `insert into "${PORTAL}".users (sam, display_name, role, last_login_at)
       values ('geo220154', 'Muster, Max', 'student', now()),
              ('pranz', 'Pranz, Petra', 'teacher', null),
              ('nobudget', 'Ohne Budget', 'student', now())
       returning id`,
    )
    const firstId = users.rows[0]?.id
    if (firstId === undefined) throw new Error('fixture users missing')
    maxUserId = firstId

    await pool.query(
      `insert into "${LITELLM}".v_user (user_id, max_budget, spend, budget_reset_at)
       values ('geo220154', 5, 5.0006, $1),
              ('pranz', null, 0, null)`,
      [CURRENT_RESET],
    )
    // Two grants: one belongs to the current gateway period, one to the previous.
    await pool.query(
      `insert into "${PORTAL}".credit_grant
         (user_id, amount_usd, max_budget_after_usd, resets_at)
       values ($1, 2.00, 7.00, $2), ($1, 3.00, 5.00, $3)`,
      [maxUserId, CURRENT_RESET, PREVIOUS_RESET],
    )
  })

  afterAll(async () => {
    await pool.query(`drop schema if exists "${PORTAL}" cascade`)
    await pool.query(`drop schema if exists "${LITELLM}" cascade`)
    await closeDatabase()
  })

  it('joins portal accounts with the gateway facade and the current-period grants', async () => {
    const rows = await store.listUsers({ query: '', limit: 100 })
    expect(rows.map((row) => row.sam)).toEqual(['geo220154', 'nobudget', 'pranz'])
    expect(rows[0]).toMatchObject({
      sam: 'geo220154',
      displayName: 'Muster, Max',
      role: 'student',
      maxBudgetUsd: 5,
      spendUsd: 5.0006,
      grantedUsd: 2,
    })
    expect(rows[0]?.resetAt).toBe('2026-12-01T00:00:00.000Z')
    // No gateway row → no allowance, but the account is still listed.
    expect(rows[1]).toMatchObject({ sam: 'nobudget', maxBudgetUsd: null, spendUsd: 0 })
    // Gateway row without max_budget.
    expect(rows[2]).toMatchObject({ sam: 'pranz', maxBudgetUsd: null })
  })

  it('filters by sam or display name and respects the limit', async () => {
    const filtered = await store.listUsers({ query: 'muster', limit: 100 })
    expect(filtered.map((row) => row.sam)).toEqual(['geo220154'])
    expect(await store.listUsers({ query: 'zzz', limit: 100 })).toEqual([])
    expect(await store.listUsers({ query: '', limit: 1 })).toHaveLength(1)
  })

  it('finds an account case-insensitively', async () => {
    expect((await store.findBySam('GEO220154'))?.sam).toBe('geo220154')
    expect(await store.findBySam('missing')).toBeNull()
  })

  it('writes a grant with two decimal places', async () => {
    await store.insertGrant({
      userId: maxUserId,
      amountUsd: 1.25,
      maxBudgetAfterUsd: 8.25,
      note: 'Nachtest',
      grantedBy: maxUserId,
      resetsAt: new Date(CURRENT_RESET),
    })

    const { rows } = await pool.query<{ amount_usd: string; note: string }>(
      `select amount_usd, note from "${PORTAL}".credit_grant where note = 'Nachtest'`,
    )
    expect(rows[0]).toMatchObject({ amount_usd: '1.25', note: 'Nachtest' })
    // The new grant belongs to the same period as the existing 2.00 one.
    expect((await store.findBySam('geo220154'))?.grantedUsd).toBe(3.25)
  })

  it('rejects schema names that are not plain identifiers', () => {
    expect(() => createAdminStore(pool, { portalSchema: 'portal; drop schema public' })).toThrow()
    expect(() => createAdminStore(pool, { litellmSchema: 'litellm; select 1' })).toThrow()
  })
})
