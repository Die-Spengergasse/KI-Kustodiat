/**
 * Client side of `/api/keys` (Issue #48).
 *
 * Framework-free, like `portalApi.ts`, so the pages only wire state and the API
 * contract (including the show-once rule) is testable without a DOM.
 */

import { JSON_HEADERS, PortalApiError, errorBody, requestPortal } from './portalApi'

export type KeyStatus = 'active' | 'blocked' | 'expired' | 'revoked'

export interface PortalKey {
  /** LiteLLM's hashed key id — an identifier, not a credential. */
  token: string
  alias: string | null
  label: string | null
  createdAt: string | null
  lastUsedAt: string | null
  status: KeyStatus
  revokedAt: string | null
  revokeReason: string | null
}

export interface KeyList {
  limit: number
  keys: PortalKey[]
}

/** Response of a creation/rotation — the only place a secret ever appears. */
export interface CreatedKey {
  secret: string
  key: PortalKey
  revokedOld?: boolean
}

function csrfHeaders(csrfToken: string | null): Record<string, string> {
  return csrfToken === null ? JSON_HEADERS : { ...JSON_HEADERS, 'x-csrf-token': csrfToken }
}

/**
 * Headers for a state-changing call without a body. Deliberately without
 * `content-type`: Fastify rejects an empty body that claims to be JSON
 * ("Body cannot be empty when content-type is set to 'application/json'").
 */
function csrfHeadersNoBody(csrfToken: string | null): Record<string, string> {
  const headers: Record<string, string> = { accept: 'application/json' }
  if (csrfToken !== null) headers['x-csrf-token'] = csrfToken
  return headers
}

function failure(status: number, body: unknown): PortalApiError {
  return new PortalApiError(status, errorBody(body))
}

export async function fetchKeys(): Promise<KeyList> {
  const { status, body } = await requestPortal('/api/keys', {
    method: 'GET',
    headers: JSON_HEADERS,
  })
  if (status !== 200) throw failure(status, body)
  return body as KeyList
}

export async function createKey(label: string, csrfToken: string | null): Promise<CreatedKey> {
  const trimmed = label.trim()
  const { status, body } = await requestPortal('/api/keys', {
    method: 'POST',
    headers: csrfHeaders(csrfToken),
    body: JSON.stringify(trimmed === '' ? {} : { label: trimmed }),
  })
  if (status !== 201) throw failure(status, body)
  return body as CreatedKey
}

export async function rotateKey(token: string, csrfToken: string | null): Promise<CreatedKey> {
  const { status, body } = await requestPortal(`/api/keys/${encodeURIComponent(token)}/rotate`, {
    method: 'POST',
    headers: csrfHeaders(csrfToken),
    body: '{}',
  })
  if (status !== 201) throw failure(status, body)
  return body as CreatedKey
}

export async function revokeKey(token: string, csrfToken: string | null): Promise<void> {
  const { status, body } = await requestPortal(`/api/keys/${encodeURIComponent(token)}`, {
    method: 'DELETE',
    headers: csrfHeadersNoBody(csrfToken),
  })
  if (status !== 200) throw failure(status, body)
}

const STATUS_LABELS: Record<KeyStatus, string> = {
  active: 'aktiv',
  blocked: 'gesperrt',
  expired: 'abgelaufen',
  revoked: 'widerrufen',
}

export function keyStatusLabel(status: KeyStatus): string {
  return STATUS_LABELS[status] ?? status
}

/** `17.10.2026, 14:05` — empty values read as a dash, never as a fake date. */
export function formatTimestamp(iso: string | null): string {
  if (iso === null || iso === '') return '–'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '–'
  return new Intl.DateTimeFormat('de-AT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

/** Human-readable name of a key: the portal label, else a neutral placeholder. */
export function keyTitle(key: PortalKey): string {
  const candidate =
    key.label ?? (key.alias === null || key.alias.startsWith('kik/') ? null : key.alias)
  return candidate === null || candidate.trim() === '' ? 'Ohne Bezeichnung' : candidate
}
