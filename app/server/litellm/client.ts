/**
 * LiteLLM admin API client (Issue #48).
 *
 * The portal is the *operating surface*, LiteLLM stays the owner of users, keys,
 * budgets and spend. Everything here goes through the dedicated `proxy_admin`
 * key (`/etc/litellm/proxy_admin.key`) — never the master key — and every call is
 * scoped to one gateway `user_id` (`= sam`).
 *
 * Secret handling: `/key/generate` answers the clear-text key exactly once. It is
 * returned to the caller and never stored, logged or put into an error message;
 * only LiteLLM's `token` field (the hash of the key) leaves this module.
 *
 * `fetch` is injectable so the unit tests can drive a local HTTP stub instead of
 * the gateway; production always uses the global fetch.
 */

import type { PortalLitellmConfig } from '../config'

export interface LitellmKey {
  /** LiteLLM `token`: SHA-256 of the key. Not usable as a credential. */
  token: string
  alias: string | null
  userId: string
  spend: number
  createdAt: string | null
  lastActiveAt: string | null
  blocked: boolean
  expiresAt: string | null
}

export interface LitellmUser {
  userId: string
  alias: string | null
  /** Monthly allowance in USD, `null` when the gateway enforces none. */
  maxBudgetUsd: number | null
  budgetDuration: string | null
  budgetResetAt: string | null
  spendUsd: number
}

export interface GeneratedKey {
  /** Clear-text API key — the only time it exists. Never persist this. */
  secret: string
  key: LitellmKey
}

export class LitellmError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
  ) {
    super(message)
    this.name = 'LitellmError'
  }
}

export interface LitellmClient {
  listKeys(userId: string): Promise<LitellmKey[]>
  generateKey(input: { userId: string; alias: string | null }): Promise<GeneratedKey>
  /** `true` when the gateway deleted the key, `false` when it was already gone. */
  deleteKey(token: string): Promise<boolean>
  getUser(userId: string): Promise<LitellmUser | null>
  setUserBudget(input: { userId: string; maxBudgetUsd: number }): Promise<LitellmUser>
}

type FetchLike = (input: string, init: RequestInit) => Promise<Response>

/** `null` for anything that is not a string; keys are not trimmed. */
function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value !== '' ? value : null
}

function numberOrZero(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function objectOf(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

function keyFromPayload(payload: Record<string, unknown>, fallbackToken: string): LitellmKey {
  return {
    token: stringOrNull(payload.token) ?? fallbackToken,
    alias: stringOrNull(payload.key_alias),
    userId: stringOrNull(payload.user_id) ?? '',
    spend: numberOrZero(payload.spend),
    createdAt: stringOrNull(payload.created_at),
    lastActiveAt: stringOrNull(payload.last_active),
    blocked: payload.blocked === true,
    expiresAt: stringOrNull(payload.expires),
  }
}

function userFromPayload(payload: Record<string, unknown>): LitellmUser {
  return {
    userId: stringOrNull(payload.user_id) ?? '',
    alias: stringOrNull(payload.user_alias),
    maxBudgetUsd: numberOrNull(payload.max_budget),
    budgetDuration: stringOrNull(payload.budget_duration),
    budgetResetAt: stringOrNull(payload.budget_reset_at),
    spendUsd: numberOrZero(payload.spend),
  }
}

export function createLitellmClient(
  config: PortalLitellmConfig,
  fetchImpl: FetchLike = fetch,
): LitellmClient {
  async function request(
    path: string,
    init: { method: 'GET' | 'POST'; body?: unknown },
  ): Promise<{ status: number; payload: Record<string, unknown> | null; text: string }> {
    let response: Response
    try {
      response = await fetchImpl(`${config.baseUrl}${path}`, {
        method: init.method,
        headers: {
          authorization: `Bearer ${config.adminKey}`,
          accept: 'application/json',
          ...(init.body === undefined ? {} : { 'content-type': 'application/json' }),
        },
        body: init.body === undefined ? null : JSON.stringify(init.body),
        signal: AbortSignal.timeout(config.timeoutMs),
      })
    } catch (error) {
      throw new LitellmError(
        `LiteLLM ${init.method} ${path} unreachable: ${(error as Error).name}`,
        null,
      )
    }
    const text = await response.text()
    let payload: Record<string, unknown> | null = null
    if (text !== '') {
      try {
        payload = objectOf(JSON.parse(text))
      } catch {
        payload = null
      }
    }
    return { status: response.status, payload, text }
  }

  function fail(what: string, status: number, text: string): LitellmError {
    // Never echo the request; the response body of these endpoints carries no key.
    return new LitellmError(`${what} failed with ${status}: ${text.slice(0, 200)}`, status)
  }

  return {
    async listKeys(userId: string): Promise<LitellmKey[]> {
      const query = new URLSearchParams({ user_id: userId, return_full_object: 'true' })
      const { status, payload, text } = await request(`/key/list?${query.toString()}`, {
        method: 'GET',
      })
      if (status !== 200 || payload === null) throw fail('LiteLLM /key/list', status, text)

      const raw = Array.isArray(payload.keys) ? payload.keys : []
      // Defense in depth: even if the gateway ignored the filter, only this
      // user's keys ever leave this module. Bare hash strings (an older
      // `return_full_object` fallback) carry no owner and are dropped.
      return raw
        .filter(
          (entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null,
        )
        .map((entry) => keyFromPayload(entry, ''))
        .filter((key) => key.userId === userId && key.token !== '')
        .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    },

    async generateKey(input): Promise<GeneratedKey> {
      const body: Record<string, unknown> = { user_id: input.userId }
      if (input.alias !== null) body.key_alias = input.alias
      const { status, payload, text } = await request('/key/generate', { method: 'POST', body })
      if (status < 200 || status >= 300 || payload === null) {
        throw fail('LiteLLM /key/generate', status, text)
      }
      const secret = stringOrNull(payload.key)
      const token = stringOrNull(payload.token)
      if (secret === null || token === null) {
        // A response without both means we cannot show-once *and* cannot revoke.
        throw new LitellmError('LiteLLM /key/generate returned no key/token', status)
      }
      return { secret, key: keyFromPayload(payload, token) }
    },

    async deleteKey(token: string): Promise<boolean> {
      const { status, payload, text } = await request('/key/delete', {
        method: 'POST',
        body: { keys: [token] },
      })
      if (status === 404) return false
      if (status < 200 || status >= 300) throw fail('LiteLLM /key/delete', status, text)
      // Some versions answer `{deleted_keys:[…]}`; an empty list means "gone".
      const deleted = Array.isArray(payload?.deleted_keys) ? payload.deleted_keys : null
      return deleted === null ? true : deleted.includes(token)
    },

    async getUser(userId: string): Promise<LitellmUser | null> {
      const query = new URLSearchParams({ user_id: userId })
      const { status, payload, text } = await request(`/user/info?${query.toString()}`, {
        method: 'GET',
      })
      if (status === 404) return null
      if (status !== 200 || payload === null) throw fail('LiteLLM /user/info', status, text)
      const info = objectOf(payload.user_info)
      if (stringOrNull(info.user_id) === null) return null
      return userFromPayload(info)
    },

    async setUserBudget(input): Promise<LitellmUser> {
      const { status, payload, text } = await request('/user/update', {
        method: 'POST',
        body: {
          user_id: input.userId,
          max_budget: input.maxBudgetUsd,
          budget_duration: '1mo',
        },
      })
      if (status < 200 || status >= 300 || payload === null) {
        throw fail('LiteLLM /user/update', status, text)
      }
      // The endpoint wraps the user in `data`; accept both shapes.
      const data = objectOf(payload.data)
      return userFromPayload(stringOrNull(data.user_id) === null ? payload : data)
    },
  }
}
