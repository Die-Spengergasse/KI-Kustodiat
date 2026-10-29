/**
 * Key service (Issue #48) with an in-memory store and a fake gateway.
 *
 * The unit under test is the portal's policy: show-once metadata, the per-role
 * soft limit, the user-level budget, ownership and the revocation trail. The
 * HTTP contract is covered by `server/routes/keys.integration.test.ts`.
 */

import { describe, expect, it } from 'vitest'
import type { GeneratedKey, LitellmClient, LitellmKey, LitellmUser } from '../litellm/client'
import {
  KeyLimitError,
  KeyNotFoundError,
  KeyValidationError,
  createKey,
  listKeys,
  revokeKey,
  rotateKey,
  type KeyAuditEvent,
  type KeyOwner,
  type KeyServiceDeps,
} from './service'
import type { KeyMetaRecord, KeyMetaStore } from './store'

const OWNER: KeyOwner = {
  userId: '11111111-1111-4111-8111-111111111111',
  sam: 'graf',
  role: 'teacher',
}
const OTHER: KeyOwner = {
  userId: '22222222-2222-4222-8222-222222222222',
  sam: 'other',
  role: 'student',
}
const CREATED_AT = '2026-10-20T10:00:00.000000Z'

class FakeClient implements LitellmClient {
  readonly keys = new Map<string, LitellmKey>()
  readonly generateCalls: Array<{ userId: string; alias: string | null }> = []
  monthlyBudgetUsd: number | null = null
  private counter = 0

  async listKeys(userId: string): Promise<LitellmKey[]> {
    return [...this.keys.values()].filter((key) => key.userId === userId)
  }

  async generateKey(input: { userId: string; alias: string | null }): Promise<GeneratedKey> {
    this.generateCalls.push(input)
    this.counter += 1
    const token = this.counter.toString(16).padStart(64, '0')
    const key: LitellmKey = {
      token,
      alias: input.alias,
      userId: input.userId,
      spend: 0,
      createdAt: CREATED_AT,
      lastActiveAt: null,
      blocked: false,
      expiresAt: null,
    }
    this.keys.set(token, key)
    return { secret: `sk-secret-${this.counter}`, key }
  }

  async deleteKey(token: string): Promise<boolean> {
    return this.keys.delete(token)
  }

  /** Simulates a gateway user that was never provisioned. */
  readonly missingUsers = new Set<string>()

  async getUser(userId: string): Promise<LitellmUser | null> {
    if (this.missingUsers.has(userId)) return null
    return {
      userId,
      alias: null,
      maxBudgetUsd: this.monthlyBudgetUsd,
      budgetDuration: this.monthlyBudgetUsd === null ? null : '1mo',
      budgetResetAt: null,
      spendUsd: 0,
    }
  }

  async setUserBudget(input: { userId: string; maxBudgetUsd: number }): Promise<LitellmUser> {
    this.monthlyBudgetUsd = input.maxBudgetUsd
    return (await this.getUser(input.userId)) as LitellmUser
  }
}

interface MemoryStore extends KeyMetaStore {
  rows: KeyMetaRecord[]
}

function memoryStore(): MemoryStore {
  const rows: KeyMetaRecord[] = []
  return {
    rows,
    async insert(input) {
      rows.push({
        tokenHash: input.tokenHash,
        userId: input.userId,
        label: input.label,
        createdVia: 'portal',
        createdAt: new Date('2026-10-20T10:00:00Z'),
        revokedAt: null,
        revokeReason: null,
      })
    },
    async markRevoked(input) {
      const row = rows.find((entry) => entry.tokenHash === input.tokenHash)
      if (row === undefined || row.userId !== input.userId) return false
      row.revokedAt = new Date('2026-10-22T09:00:00Z')
      row.revokeReason = input.reason
      return true
    },
    async listByUser(userId) {
      return rows.filter((row) => row.userId === userId)
    },
  }
}

function setup() {
  const client = new FakeClient()
  const store = memoryStore()
  const events: Array<{ event: KeyAuditEvent; detail: string }> = []
  const provisions: string[] = []
  const deps: KeyServiceDeps = {
    client,
    store,
    provision: async (sam) => {
      provisions.push(sam)
      client.missingUsers.delete(sam)
    },
    audit: async (event, detail) => {
      events.push({ event, detail })
    },
  }
  return { client, store, deps, events, provisions }
}

describe('createKey', () => {
  it('rejects an empty label — "Ohne Bezeichnung" is not a key name', async () => {
    const { deps } = setup()
    await expect(createKey(deps, OWNER, { limit: 10, monthlyBudgetUsd: 5 })).rejects.toEqual(
      new KeyValidationError('label is required', 'label_required'),
    )
    await expect(
      createKey(deps, OWNER, { label: '   ', limit: 10, monthlyBudgetUsd: 5 }),
    ).rejects.toEqual(new KeyValidationError('label is required', 'label_required'))
  })

  it('provisions a missing gateway user instead of failing', async () => {
    const { client, deps, provisions } = setup()
    client.missingUsers.add(OWNER.sam)

    const created = await createKey(deps, OWNER, { label: 'Test', limit: 10, monthlyBudgetUsd: 5 })

    expect(provisions).toEqual([OWNER.sam])
    expect(created.key.userId).toBe(OWNER.sam)
    expect(client.monthlyBudgetUsd).toBe(5)
  })

  it('still refuses when the gateway stays unknown after provisioning', async () => {
    const { client, deps } = setup()
    client.missingUsers.add(OWNER.sam)
    deps.provision = async () => undefined

    await expect(
      createKey(deps, OWNER, { label: 'Test', limit: 10, monthlyBudgetUsd: 5 }),
    ).rejects.toEqual(
      new KeyValidationError('gateway user is not provisioned', 'user_not_provisioned'),
    )
  })

  it('creates a key, stores metadata but no secret, and audits it', async () => {
    const { client, store, deps, events } = setup()

    const generated = await createKey(deps, OWNER, {
      label: '  Laptop  ',
      limit: 10,
      monthlyBudgetUsd: 5,
    })

    expect(generated.secret.startsWith('sk-secret-')).toBe(true)
    expect(generated.label).toBe('Laptop')
    // The gateway alias is namespaced (unique across all users), not the label.
    expect(client.generateCalls).toHaveLength(1)
    expect(client.generateCalls[0]?.userId).toBe('graf')
    expect(client.generateCalls[0]?.alias).toMatch(/^kik\/graf\/[0-9a-f]{8}$/)
    // Only the hashed token is persisted; the secret is nowhere in the store.
    expect(store.rows).toHaveLength(1)
    expect(store.rows[0]?.tokenHash).toBe(generated.key.token)
    expect(JSON.stringify(store.rows)).not.toContain(generated.secret)
    expect(events.map((entry) => entry.event)).toEqual(['budget_set', 'key_created'])
  })

  it('applies the monthly allowance to the user once, never to the key', async () => {
    const { client, deps } = setup()

    await createKey(deps, OWNER, { label: 'Test', limit: 10, monthlyBudgetUsd: 5 })
    await createKey(deps, OWNER, { label: 'Test', limit: 10, monthlyBudgetUsd: 5 })

    // One user-level allowance; the key count does not multiply it.
    expect(client.monthlyBudgetUsd).toBe(5)
    expect(client.generateCalls).toHaveLength(2)
  })

  it('keeps an allowance that is already set (no fighting admins)', async () => {
    const { client, deps } = setup()
    client.monthlyBudgetUsd = 42

    await createKey(deps, OWNER, { label: 'Test', limit: 10, monthlyBudgetUsd: 5 })
    expect(client.monthlyBudgetUsd).toBe(42)
  })

  it('rejects the 11th active key with the configured limit', async () => {
    const { deps } = setup()
    for (let index = 0; index < 10; index += 1) {
      await createKey(deps, OWNER, { label: 'Test', limit: 10, monthlyBudgetUsd: 5 })
    }

    await expect(
      createKey(deps, OWNER, { label: 'Test', limit: 10, monthlyBudgetUsd: 5 }),
    ).rejects.toEqual(new KeyLimitError(10))
  })

  it('rejects a label longer than 64 characters', async () => {
    const { deps } = setup()
    await expect(
      createKey(deps, OWNER, { label: 'x'.repeat(65), limit: 10, monthlyBudgetUsd: 5 }),
    ).rejects.toBeInstanceOf(KeyValidationError)
  })
})

describe('rotateKey', () => {
  it('creates a replacement with the same alias and revokes the old key', async () => {
    const { client, store, deps, events } = setup()
    const first = await createKey(deps, OWNER, { label: 'Laptop', limit: 10, monthlyBudgetUsd: 5 })

    const rotated = await rotateKey(deps, OWNER, first.key.token)

    expect(rotated.secret).not.toBe(first.secret)
    expect(rotated.revokedOld).toBe(true)
    expect(rotated.label).toBe('Laptop')
    expect(client.generateCalls.at(-1)?.alias).toMatch(/^kik\/graf\/[0-9a-f]{8}$/)
    expect(client.generateCalls.at(-1)?.alias).not.toBe(client.generateCalls[0]?.alias)
    expect(client.keys.has(first.key.token)).toBe(false)
    expect(client.keys.has(rotated.key.token)).toBe(true)
    expect(store.rows.map((row) => row.revokeReason)).toEqual(['rotated', null])
    expect(events.at(-1)?.event).toBe('key_rotated')
  })

  it('still works at the soft limit — rotating is how you replace a key', async () => {
    const { deps } = setup()
    const keys = []
    for (let index = 0; index < 2; index += 1) {
      keys.push(await createKey(deps, OWNER, { label: 'Test', limit: 2, monthlyBudgetUsd: 5 }))
    }

    await expect(rotateKey(deps, OWNER, keys[0]!.key.token)).resolves.toMatchObject({
      revokedOld: true,
    })
  })

  it('refuses a key of another user', async () => {
    const { deps } = setup()
    const foreign = await createKey(deps, OTHER, { label: 'Test', limit: 10, monthlyBudgetUsd: 5 })

    await expect(rotateKey(deps, OWNER, foreign.key.token)).rejects.toBeInstanceOf(KeyNotFoundError)
  })
})

describe('revokeKey', () => {
  it('deletes the key, keeps the portal trail and audits the action', async () => {
    const { client, store, deps, events } = setup()
    const created = await createKey(deps, OWNER, {
      label: 'Laptop',
      limit: 10,
      monthlyBudgetUsd: 5,
    })

    await revokeKey(deps, OWNER, created.key.token)

    expect(client.keys.has(created.key.token)).toBe(false)
    expect(store.rows[0]?.revokeReason).toBe('user')
    expect(store.rows[0]?.revokedAt).not.toBeNull()
    expect(events.at(-1)).toEqual({ event: 'key_revoked', detail: 'Grund user' })

    const keys = await listKeys(deps, OWNER)
    expect(keys).toHaveLength(1)
    expect(keys[0]).toMatchObject({ status: 'revoked', label: 'Laptop' })
  })

  it('refuses a key of another user (no existence leak)', async () => {
    const { deps } = setup()
    const foreign = await createKey(deps, OTHER, { label: 'Test', limit: 10, monthlyBudgetUsd: 5 })

    await expect(revokeKey(deps, OWNER, foreign.key.token)).rejects.toBeInstanceOf(KeyNotFoundError)
  })

  it('answers not-found for an unknown token', async () => {
    const { deps } = setup()
    await expect(revokeKey(deps, OWNER, 'f'.repeat(64))).rejects.toBeInstanceOf(KeyNotFoundError)
  })
})

describe('listKeys', () => {
  it('merges active keys with the revoked history and reports status', async () => {
    const { client, deps } = setup()
    const active = await createKey(deps, OWNER, { label: 'Aktiv', limit: 10, monthlyBudgetUsd: 5 })
    const revoked = await createKey(deps, OWNER, { label: 'Alt', limit: 10, monthlyBudgetUsd: 5 })
    await revokeKey(deps, OWNER, revoked.key.token)

    // A key the gateway reports as blocked must not count as active.
    const blocked = await createKey(deps, OWNER, {
      label: 'Gesperrt',
      limit: 10,
      monthlyBudgetUsd: 5,
    })
    const stored = client.keys.get(blocked.key.token)
    if (stored !== undefined) stored.blocked = true

    const keys = await listKeys(deps, OWNER)
    expect(keys.map((key) => [key.label, key.status])).toEqual([
      ['Aktiv', 'active'],
      ['Gesperrt', 'blocked'],
      ['Alt', 'revoked'],
    ])
    expect(keys.find((key) => key.label === 'Aktiv')?.token).toBe(active.key.token)
  })
})
