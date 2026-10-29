/**
 * Self-service key management (Issue #48).
 *
 * The gateway is the owner: keys are created, listed and revoked through the
 * LiteLLM admin API; `portal.key_meta` only carries the label and the revocation
 * trail. The clear-text secret leaves this module exactly once, in the return
 * value of `createKey`/`rotateKey` — it is never persisted, never logged and
 * never written to the audit log.
 *
 * Ownership is enforced here, not in the route: every token is resolved against
 * the caller's own key list, so a foreign token behaves like an unknown one
 * (`KeyNotFoundError` → 404, no existence leak).
 */

import { randomBytes } from 'node:crypto'
import type { Role } from '../db/schema'
import type { GeneratedKey, LitellmClient, LitellmKey } from '../litellm/client'
import type { KeyMetaRecord, KeyMetaStore } from './store'

export type KeyStatus = 'active' | 'blocked' | 'expired' | 'revoked'

/** What the browser sees. `token` is LiteLLM's hash — an identifier, not a secret. */
export interface PortalKey {
  token: string
  alias: string | null
  label: string | null
  createdAt: string | null
  lastUsedAt: string | null
  status: KeyStatus
  revokedAt: string | null
  revokeReason: string | null
}

export interface KeyOwner {
  /** `portal.users.id`. */
  userId: string
  /** Gateway `user_id` — the lower-case `sam`. */
  sam: string
  role: Role
}

export type KeyAuditEvent = 'key_created' | 'key_rotated' | 'key_revoked' | 'budget_set'

export interface KeyServiceDeps {
  client: LitellmClient
  store: KeyMetaStore
  /** Creates the gateway user if it is missing (`/user/new`, idempotent). */
  provision: (sam: string) => Promise<unknown>
  /** Writes one audit row; failures must not abort the request (see the route). */
  audit: (event: KeyAuditEvent, detail: string) => Promise<void>
  /** Injectable clock, so the tests can pin "now". */
  now?: () => Date
}

export class KeyNotFoundError extends Error {
  constructor() {
    super('key not found')
    this.name = 'KeyNotFoundError'
  }
}

export class KeyLimitError extends Error {
  constructor(readonly limit: number) {
    super(`key limit of ${limit} reached`)
    this.name = 'KeyLimitError'
  }
}

export class KeyValidationError extends Error {
  constructor(
    message: string,
    /** Stable marker for the route, so the UI can answer in German. */
    readonly code: 'label_required' | 'label_too_long' | 'user_not_provisioned' = 'label_required',
  ) {
    super(message)
    this.name = 'KeyValidationError'
  }
}

/** LiteLLM allows long aliases; the portal keeps them short enough for a table. */
export const KEY_LABEL_MAX_LENGTH = 64

/**
 * The gateway requires key aliases to be unique **across all users** (verified
 * against LiteLLM 1.101: "Key with alias '…' already exists"). A user-facing
 * label such as "Laptop" therefore cannot be the gateway alias — the second
 * person with a laptop would be rejected, and a rotation could not keep its
 * alias. The portal names keys in `key_meta.label`; the gateway carries this
 * namespaced, collision-free alias (`kik/<sam>/<random>`), which also means a
 * rotation gets a *new* alias while the visible label stays the same.
 */
function portalAlias(owner: KeyOwner): string {
  return `kik/${owner.sam}/${randomBytes(4).toString('hex')}`
}

function statusOf(key: LitellmKey, now: Date): KeyStatus {
  if (key.blocked) return 'blocked'
  if (key.expiresAt !== null && new Date(key.expiresAt).getTime() <= now.getTime()) return 'expired'
  return 'active'
}

/**
 * Labels are required: "Ohne Bezeichnung" made the key list unreadable — two
 * keys you cannot tell apart are worse than no label field at all. Rotation
 * keeps the existing label and therefore does not go through here.
 */
function normalizeLabel(raw: string | null | undefined): string {
  const label = typeof raw === 'string' ? raw.trim() : ''
  if (label === '') throw new KeyValidationError('label is required', 'label_required')
  if (label.length > KEY_LABEL_MAX_LENGTH) {
    throw new KeyValidationError(
      `label is longer than ${KEY_LABEL_MAX_LENGTH} characters`,
      'label_too_long',
    )
  }
  return label
}

function metaFor(metas: readonly KeyMetaRecord[], token: string): KeyMetaRecord | undefined {
  return metas.find((meta) => meta.tokenHash === token)
}

/**
 * Active keys from the gateway plus the revocation history from `key_meta`.
 * Revoked keys no longer exist in LiteLLM, which is exactly why the portal keeps
 * them: the user must still be able to see what was revoked when.
 */
export async function listKeys(deps: KeyServiceDeps, owner: KeyOwner): Promise<PortalKey[]> {
  const now = (deps.now ?? (() => new Date()))()
  const [keys, metas] = await Promise.all([
    deps.client.listKeys(owner.sam),
    deps.store.listByUser(owner.userId),
  ])

  const active: PortalKey[] = keys.map((key) => {
    const meta = metaFor(metas, key.token)
    return {
      token: key.token,
      alias: key.alias,
      label: meta?.label ?? null,
      createdAt: key.createdAt,
      lastUsedAt: key.lastActiveAt,
      status: statusOf(key, now),
      revokedAt: null,
      revokeReason: null,
    }
  })

  const known = new Set(keys.map((key) => key.token))
  const revoked: PortalKey[] = metas
    .filter((meta) => meta.revokedAt !== null && !known.has(meta.tokenHash))
    .map((meta) => ({
      token: meta.tokenHash,
      alias: meta.label,
      label: meta.label,
      createdAt: meta.createdAt.toISOString(),
      lastUsedAt: null,
      status: 'revoked' as const,
      revokedAt: meta.revokedAt?.toISOString() ?? null,
      revokeReason: meta.revokeReason,
    }))

  return [...active, ...revoked]
}

/** A key as created, plus the label the portal keeps for it. */
export interface CreatedKey extends GeneratedKey {
  label: string | null
}

export interface CreateKeyInput {
  label?: string | null
  /** Soft limit of active keys for the owner's role. */
  limit: number
  /** Monthly allowance in USD, applied to the gateway user when it has none. */
  monthlyBudgetUsd: number
  /** Requests per minute for the new key, across all models (Issue #55). */
  rpmLimit?: number
}

/**
 * Makes sure the gateway user exists, then applies the role's monthly allowance
 * unless one is already set.
 *
 * Provisioning at login is deliberately non-blocking (#47), so an account can
 * end up without a gateway user — a failed provisioning call, a cleanup that
 * removed it, a restored database. Refusing the key then leaves the user in a
 * dead end with no way out; instead we provision on demand (`/user/new` is
 * idempotent) and only fail if the gateway still does not know the user.
 */
export async function ensureUserBudget(
  deps: KeyServiceDeps,
  owner: KeyOwner,
  monthlyBudgetUsd: number,
): Promise<void> {
  let user = await deps.client.getUser(owner.sam)
  if (user === null) {
    await deps.provision(owner.sam)
    user = await deps.client.getUser(owner.sam)
  }
  if (user === null) {
    throw new KeyValidationError('gateway user is not provisioned', 'user_not_provisioned')
  }
  if (user.maxBudgetUsd !== null) return
  await deps.client.setUserBudget({ userId: owner.sam, maxBudgetUsd: monthlyBudgetUsd })
  await deps.audit('budget_set', `monthly allowance ${monthlyBudgetUsd} USD`)
}

export async function createKey(
  deps: KeyServiceDeps,
  owner: KeyOwner,
  input: CreateKeyInput,
): Promise<CreatedKey> {
  const label = normalizeLabel(input.label)
  const keys = await listKeys(deps, owner)
  const activeCount = keys.filter((key) => key.status === 'active').length
  if (activeCount >= input.limit) {
    throw new KeyLimitError(input.limit)
  }

  await ensureUserBudget(deps, owner, input.monthlyBudgetUsd)
  const generated = await deps.client.generateKey({
    userId: owner.sam,
    alias: portalAlias(owner),
    ...(input.rpmLimit === undefined ? {} : { rpmLimit: input.rpmLimit }),
  })
  await deps.store.insert({
    tokenHash: generated.key.token,
    userId: owner.userId,
    label,
  })
  await deps.audit('key_created', `Bezeichnung ${label}`)
  return { ...generated, label }
}

export interface RotateResult extends CreatedKey {
  /** `false` when the old key could not be revoked (the call still succeeded). */
  revokedOld: boolean
}

/**
 * Rotate = create with the same alias, then revoke the old key. The order matters:
 * the new secret must exist before the old one dies, so a failed generate leaves
 * the user with their working key.
 */
export async function rotateKey(
  deps: KeyServiceDeps,
  owner: KeyOwner,
  token: string,
  /** Requests per minute for the replacement key (Issue #55). */
  rpmLimit?: number,
): Promise<RotateResult> {
  const keys = await listKeys(deps, owner)
  const old = keys.find((key) => key.token === token && key.status === 'active')
  if (old === undefined) throw new KeyNotFoundError()

  const generated = await deps.client.generateKey({
    userId: owner.sam,
    alias: portalAlias(owner),
    ...(rpmLimit === undefined ? {} : { rpmLimit }),
  })
  await deps.store.insert({
    tokenHash: generated.key.token,
    userId: owner.userId,
    label: old.label,
  })

  const revokedOld = await deps.client.deleteKey(token)
  if (revokedOld) {
    await deps.store.markRevoked({ tokenHash: token, userId: owner.userId, reason: 'rotated' })
  }
  await deps.audit(
    'key_rotated',
    `${old.label === null ? 'ohne Bezeichnung' : `Bezeichnung ${old.label}`}${
      revokedOld ? '' : ' — alter Key blieb aktiv'
    }`,
  )
  return { ...generated, label: old.label, revokedOld }
}

export async function revokeKey(
  deps: KeyServiceDeps,
  owner: KeyOwner,
  token: string,
  reason = 'user',
): Promise<void> {
  const keys = await listKeys(deps, owner)
  if (!keys.some((key) => key.token === token)) throw new KeyNotFoundError()

  const deleted = await deps.client.deleteKey(token)
  if (!deleted) throw new KeyNotFoundError()
  await deps.store.markRevoked({ tokenHash: token, userId: owner.userId, reason })
  await deps.audit('key_revoked', `Grund ${reason}`)
}
