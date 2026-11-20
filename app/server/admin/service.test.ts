/**
 * Admin credit top-ups (Issue #64) — the service against fakes.
 *
 * The core promises these tests pin down:
 *   - a top-up only ever raises `max_budget` and never touches spend or the period
 *   - the grant is written to the ledger, with the period it belongs to
 *   - an invalid amount reaches neither gateway nor ledger
 *   - a failed ledger write reverts the gateway (no untraceable credit)
 */

import { describe, expect, it } from 'vitest'
import type { GeneratedKey, LitellmClient, LitellmKey, LitellmUser } from '../litellm/client'
import {
  CreditError,
  grantCredit,
  listUsers,
  validateAmount,
  type AdminServiceDeps,
} from './service'
import type { AdminStore, AdminUserRow, GrantRecord } from './store'

const ADMIN_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const TARGET_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const RESET_AT = '2026-12-01T00:00:00.000Z'

function targetRow(overrides: Partial<AdminUserRow> = {}): AdminUserRow {
  return {
    userId: TARGET_ID,
    sam: 'geo220154',
    displayName: 'GEO220154 Muster, Max',
    role: 'student',
    maxBudgetUsd: 5,
    spendUsd: 5.0006,
    resetAt: RESET_AT,
    grantedUsd: 0,
    lastLoginAt: null,
    ...overrides,
  }
}

class FakeClient implements LitellmClient {
  user: LitellmUser | null = {
    userId: 'geo220154',
    alias: null,
    maxBudgetUsd: 5,
    budgetDuration: '1mo',
    budgetResetAt: RESET_AT,
    spendUsd: 5.0006,
  }

  readonly updates: Array<{ userId: string; maxBudgetUsd: number }> = []

  async getUser(userId: string): Promise<LitellmUser | null> {
    return this.user === null ? null : { ...this.user, userId }
  }

  async updateUserBudget(input: { userId: string; maxBudgetUsd: number }): Promise<LitellmUser> {
    this.updates.push(input)
    if (this.user === null) throw new Error('not provisioned')
    this.user = { ...this.user, maxBudgetUsd: input.maxBudgetUsd, userId: input.userId }
    return { ...this.user }
  }

  async listKeys(): Promise<LitellmKey[]> {
    throw new Error('not used')
  }

  async generateKey(): Promise<GeneratedKey> {
    throw new Error('not used')
  }

  async deleteKey(): Promise<boolean> {
    throw new Error('not used')
  }

  async setUserBudget(input: { userId: string; maxBudgetUsd: number }): Promise<LitellmUser> {
    return this.updateUserBudget(input)
  }
}

class FakeStore implements AdminStore {
  row: AdminUserRow | null = targetRow()
  readonly grants: GrantRecord[] = []
  failInsert = false

  async listUsers(input: { query: string; limit: number }): Promise<AdminUserRow[]> {
    if (this.row === null) return []
    const haystack = `${this.row.sam} ${this.row.displayName}`.toLowerCase()
    if (input.query !== '' && !haystack.includes(input.query.toLowerCase())) return []
    return [this.row].slice(0, input.limit)
  }

  async findBySam(sam: string): Promise<AdminUserRow | null> {
    return this.row !== null && this.row.sam === sam ? this.row : null
  }

  async insertGrant(record: GrantRecord): Promise<void> {
    if (this.failInsert) throw new Error('ledger down')
    this.grants.push(record)
  }
}

function setup() {
  const client = new FakeClient()
  const store = new FakeStore()
  const audits: Array<{ sam: string; detail: string }> = []
  const deps: AdminServiceDeps = {
    client,
    store,
    maxCreditUsd: 50,
    audit: async (sam, detail) => {
      audits.push({ sam, detail })
    },
  }
  return { deps, client, store, audits }
}

describe('validateAmount', () => {
  it('rounds to cents and accepts the smallest amount', () => {
    expect(validateAmount(2.5, 50)).toBe(2.5)
    expect(validateAmount(2.555, 50)).toBe(2.56)
    expect(validateAmount(0.01, 50)).toBe(0.01)
  })

  it('rejects zero, negatives, non-numbers and values above the cap', () => {
    for (const value of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, '2.50', null, undefined]) {
      expect(() => validateAmount(value, 50)).toThrowError(CreditError)
    }
    try {
      validateAmount(50.01, 50)
      expect.unreachable('amount above the cap must throw')
    } catch (error) {
      expect(error).toMatchObject({ code: 'amount_too_large', limit: 50 })
    }
  })
})

describe('listUsers', () => {
  it('computes the available amount from the gateway counter, rounded down', async () => {
    const { deps } = setup()
    const users = await listUsers(deps, { query: '', limit: 100 })
    expect(users).toHaveLength(1)
    // 5 - 5.0006 is negative → a burned account shows 0, never a negative balance.
    expect(users[0]).toMatchObject({ sam: 'geo220154', maxBudgetUsd: 5, availableUsd: 0 })
  })

  it('shows no balance when the account has no allowance', async () => {
    const { deps, store } = setup()
    store.row = targetRow({ maxBudgetUsd: null, spendUsd: 0 })
    const users = await listUsers(deps, { query: '', limit: 100 })
    expect(users[0]).toMatchObject({ maxBudgetUsd: null, availableUsd: null })
  })
})

describe('grantCredit', () => {
  it('raises max_budget, keeps spend, and records the grant for the current period', async () => {
    const { deps, client, store, audits } = setup()

    const user = await grantCredit(
      deps,
      { userId: ADMIN_ID },
      {
        sam: 'geo220154',
        amountUsd: 2,
        note: 'Diktat-Marathon',
      },
    )

    expect(client.updates).toEqual([{ userId: 'geo220154', maxBudgetUsd: 7 }])
    expect(client.user?.spendUsd).toBe(5.0006)
    expect(store.grants).toHaveLength(1)
    expect(store.grants[0]).toMatchObject({
      userId: TARGET_ID,
      amountUsd: 2,
      maxBudgetAfterUsd: 7,
      note: 'Diktat-Marathon',
      grantedBy: ADMIN_ID,
    })
    expect(store.grants[0]?.resetsAt?.toISOString()).toBe(RESET_AT)
    expect(audits).toEqual([{ sam: 'geo220154', detail: '+2.00 USD (Kontingent 5.00 → 7.00 USD)' }])
    expect(user).toMatchObject({
      maxBudgetUsd: 7,
      spendUsd: 5.0006,
      // 7 - 5.0006 = 1.9994, rounded down so the page never promises a cent too much.
      availableUsd: 1.99,
      grantedUsd: 2,
    })
  })

  it('stores a blank note as null and trims the rest', async () => {
    const { deps, store } = setup()
    await grantCredit(deps, { userId: ADMIN_ID }, { sam: 'geo220154', amountUsd: 1, note: '   ' })
    await grantCredit(
      deps,
      { userId: ADMIN_ID },
      {
        sam: 'geo220154',
        amountUsd: 1,
        note: '  Ausnahme  ',
      },
    )
    expect(store.grants.map((grant) => grant.note)).toEqual([null, 'Ausnahme'])
  })

  it('rejects an unknown account without calling the gateway', async () => {
    const { deps, client } = setup()
    await expect(
      grantCredit(deps, { userId: ADMIN_ID }, { sam: 'nobody', amountUsd: 2 }),
    ).rejects.toMatchObject({ code: 'user_not_found' })
    expect(client.updates).toHaveLength(0)
  })

  it('rejects an amount above the cap before touching anything', async () => {
    const { deps, client, store } = setup()
    await expect(
      grantCredit(deps, { userId: ADMIN_ID }, { sam: 'geo220154', amountUsd: 500 }),
    ).rejects.toMatchObject({ code: 'amount_too_large' })
    expect(client.updates).toHaveLength(0)
    expect(store.grants).toHaveLength(0)
  })

  it('refuses accounts without a gateway user or without an allowance', async () => {
    const missingUser = setup()
    missingUser.client.user = null
    await expect(
      grantCredit(missingUser.deps, { userId: ADMIN_ID }, { sam: 'geo220154', amountUsd: 2 }),
    ).rejects.toMatchObject({ code: 'user_not_provisioned' })

    const missingBudget = setup()
    missingBudget.client.user = {
      userId: 'geo220154',
      alias: null,
      maxBudgetUsd: null,
      budgetDuration: null,
      budgetResetAt: null,
      spendUsd: 0,
    }
    await expect(
      grantCredit(missingBudget.deps, { userId: ADMIN_ID }, { sam: 'geo220154', amountUsd: 2 }),
    ).rejects.toMatchObject({ code: 'budget_not_initialized' })
    expect(missingBudget.client.updates).toHaveLength(0)
  })

  it('reverts the gateway when the ledger write fails', async () => {
    const { deps, client, store } = setup()
    store.failInsert = true

    await expect(
      grantCredit(deps, { userId: ADMIN_ID }, { sam: 'geo220154', amountUsd: 2 }),
    ).rejects.toMatchObject({ code: 'grant_not_recorded' })

    // Raise, then the compensating revert back to the previous allowance.
    expect(client.updates).toEqual([
      { userId: 'geo220154', maxBudgetUsd: 7 },
      { userId: 'geo220154', maxBudgetUsd: 5 },
    ])
    expect(client.user?.maxBudgetUsd).toBe(5)
  })

  it('rejects an over-long note', async () => {
    const { deps, client, store } = setup()
    await expect(
      grantCredit(
        deps,
        { userId: ADMIN_ID },
        {
          sam: 'geo220154',
          amountUsd: 2,
          note: 'x'.repeat(201),
        },
      ),
    ).rejects.toMatchObject({ code: 'note_too_long' })
    expect(client.updates).toHaveLength(0)
    expect(store.grants).toHaveLength(0)
  })
})
