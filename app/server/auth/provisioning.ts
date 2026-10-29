/**
 * LiteLLM auto-provisioning (Issue #47).
 *
 * Every portal account gets the matching gateway user, created through the
 * proxy-admin key: `user_id` is the lower-case `sAMAccountName`, so the portal,
 * LiteLLM key management and spend logs all agree on one identifier.
 *
 * Idempotent by construction: LiteLLM answers `400 … already exists` for a known
 * `user_id`, which is treated as "provisioned". Any other failure is surfaced to
 * the caller, which decides whether a login may continue.
 */

import type { PortalLitellmConfig } from '../config'

export class ProvisioningError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
  ) {
    super(message)
    this.name = 'ProvisioningError'
  }
}

export interface ProvisioningInput {
  /** LiteLLM `user_id`; equals the portal's `sam`. */
  userId: string
  /** Human-readable name shown in the LiteLLM admin UI. */
  alias: string
  mail: string | null
}

export interface ProvisioningResult {
  userId: string
  /** `false` when the user already existed — still a success. */
  created: boolean
}

function adminHeaders(config: PortalLitellmConfig): Record<string, string> {
  return {
    authorization: `Bearer ${config.adminKey}`,
    'content-type': 'application/json',
  }
}

async function request(
  config: PortalLitellmConfig,
  path: string,
  init: { method: string; body?: unknown },
): Promise<{ status: number; text: string }> {
  const response = await fetch(`${config.baseUrl}${path}`, {
    method: init.method,
    headers: adminHeaders(config),
    body: init.body === undefined ? null : JSON.stringify(init.body),
    signal: AbortSignal.timeout(config.timeoutMs),
  })
  return { status: response.status, text: await response.text() }
}

function alreadyExists(status: number, body: string): boolean {
  if (status !== 400 && status !== 409) return false
  return /already exists|duplicate key|already_exists/i.test(body)
}

/** Creates the LiteLLM user for a portal account (idempotent). */
export async function provisionLitellmUser(
  config: PortalLitellmConfig,
  input: ProvisioningInput,
): Promise<ProvisioningResult> {
  if (config.adminKey === '') {
    throw new ProvisioningError('PORTAL_LITELLM_ADMIN_KEY is not configured', null)
  }

  const body: Record<string, unknown> = {
    user_id: input.userId,
    user_alias: input.alias,
    metadata: { source: 'kik-portal' },
  }
  if (input.mail !== null && input.mail !== '') body.user_email = input.mail

  const response = await request(config, '/user/new', { method: 'POST', body })
  if (response.status >= 200 && response.status < 300) {
    return { userId: input.userId, created: true }
  }
  if (alreadyExists(response.status, response.text)) {
    return { userId: input.userId, created: false }
  }
  throw new ProvisioningError(
    `LiteLLM /user/new failed with ${response.status}: ${response.text.slice(0, 200)}`,
    response.status,
  )
}

/** Looks up a LiteLLM user by id; used by verification and reconciliation. */
export async function findLitellmUser(
  config: PortalLitellmConfig,
  userId: string,
): Promise<{ user_id: string } | null> {
  const pageSize = 100
  for (let page = 1; page <= 50; page += 1) {
    const response = await request(config, `/user/list?page=${page}&page_size=${pageSize}`, {
      method: 'GET',
    })
    if (response.status !== 200) {
      throw new ProvisioningError(
        `LiteLLM /user/list failed with ${response.status}`,
        response.status,
      )
    }
    const payload = JSON.parse(response.text) as {
      users?: Array<Record<string, unknown>>
      total_pages?: number
    }
    const users = payload.users ?? []
    const match = users.find((user) => user.user_id === userId)
    if (match !== undefined) return { user_id: userId }
    const totalPages = payload.total_pages ?? 1
    if (page >= totalPages || users.length === 0) return null
  }
  return null
}

/** Removes a LiteLLM user — used by the provisioning test and by admins later. */
export async function deleteLitellmUser(
  config: PortalLitellmConfig,
  userId: string,
): Promise<boolean> {
  const response = await request(config, '/user/delete', {
    method: 'POST',
    body: { user_ids: [userId] },
  })
  if (response.status >= 200 && response.status < 300) return true
  if (response.status === 404) return false
  throw new ProvisioningError(
    `LiteLLM /user/delete failed with ${response.status}: ${response.text.slice(0, 200)}`,
    response.status,
  )
}
