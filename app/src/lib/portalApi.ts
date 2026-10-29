/**
 * Client side of `/api/auth/*` (Issue #47).
 *
 * Kept framework-free so it can be unit-tested without a DOM: the portal page
 * only wires these calls to form state.
 */

export type PortalRole = 'student' | 'teacher' | 'staff' | 'admin'

export interface PortalUser {
  sam: string
  displayName: string
  mail: string | null
  role: PortalRole
}

export interface AuthState {
  authenticated: boolean
  user: PortalUser | null
  csrfToken: string | null
  expiresAt: string | null
}

export interface ApiErrorBody {
  error?: string
  message?: string
  reason?: string | null
  retryAfterSeconds?: number
  missing?: string[]
}

export class PortalApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorBody,
  ) {
    super(body.error ?? `HTTP ${status}`)
    this.name = 'PortalApiError'
  }
}

export const JSON_HEADERS = { 'content-type': 'application/json', accept: 'application/json' }

/**
 * One HTTP round-trip against the portal API. Exported for the key/usage clients,
 * so the error and cookie handling stays identical everywhere.
 */
export async function requestPortal(
  path: string,
  init: RequestInit,
): Promise<{ status: number; body: unknown }> {
  const response = await fetch(path, { credentials: 'same-origin', ...init })
  const text = await response.text()
  let body: unknown = null
  if (text !== '') {
    try {
      body = JSON.parse(text)
    } catch {
      body = null
    }
  }
  return { status: response.status, body }
}

export function errorBody(body: unknown): ApiErrorBody {
  return typeof body === 'object' && body !== null ? (body as ApiErrorBody) : {}
}

/** Current session. A `401` is a normal answer (not logged in), not an error. */
export async function fetchMe(): Promise<AuthState> {
  const { status, body } = await requestPortal('/api/auth/me', {
    method: 'GET',
    headers: JSON_HEADERS,
  })
  const payload = (typeof body === 'object' && body !== null ? body : {}) as {
    authenticated?: boolean
    user?: PortalUser
    csrfToken?: string
    expiresAt?: string
  }

  if (status === 401) {
    return {
      authenticated: false,
      user: null,
      csrfToken: payload.csrfToken ?? null,
      expiresAt: null,
    }
  }
  if (status !== 200) {
    throw new PortalApiError(status, errorBody(body))
  }
  return {
    authenticated: payload.authenticated === true,
    user: payload.user ?? null,
    csrfToken: payload.csrfToken ?? null,
    expiresAt: payload.expiresAt ?? null,
  }
}

export async function login(
  username: string,
  password: string,
  csrfToken: string | null,
): Promise<AuthState> {
  const { status, body } = await requestPortal('/api/auth/login', {
    method: 'POST',
    headers: csrfToken === null ? JSON_HEADERS : { ...JSON_HEADERS, 'x-csrf-token': csrfToken },
    body: JSON.stringify({ username, password }),
  })
  if (status !== 200) throw new PortalApiError(status, errorBody(body))
  const payload = body as { user?: PortalUser; csrfToken?: string }
  return {
    authenticated: true,
    user: payload.user ?? null,
    csrfToken: payload.csrfToken ?? null,
    expiresAt: null,
  }
}

export async function logout(csrfToken: string | null): Promise<void> {
  // No body, so no `content-type` either — Fastify rejects an empty JSON body.
  const headers: Record<string, string> = { accept: 'application/json' }
  if (csrfToken !== null) headers['x-csrf-token'] = csrfToken
  const { status, body } = await requestPortal('/api/auth/logout', {
    method: 'POST',
    headers,
  })
  if (status !== 204) throw new PortalApiError(status, errorBody(body))
}
