/**
 * Shared guard for the portal API (Issue #48).
 *
 * `/api/keys` and `/api/usage/*` need the same three things every request:
 * deployment configuration (`503` with the missing variables), a server-side
 * session (`401`), and — for state-changing calls — the CSRF double-submit token
 * (`403`). Keeping that in one place means a new route cannot forget one of them.
 */

import type { FastifyReply, FastifyRequest } from 'fastify'
import { loadPortalConfig } from '../config'
import type { PortalDatabase } from '../db/client'
import { getDatabase } from '../db/client'
import type { UserRow } from '../auth/users'
import { verifyCsrf, readCookie } from '../auth/csrf'
import { SESSION_COOKIE, loadSession, touchSession } from '../auth/sessions'

export interface PortalRequestContext {
  db: PortalDatabase
  user: UserRow
  config: Extract<ReturnType<typeof loadPortalConfig>, { ok: true }>['config']
}

function headerValue(request: FastifyRequest, name: string): string | undefined {
  const value = request.headers[name]
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0]
  return undefined
}

/**
 * Resolves the session and writes the error response itself. Returns `null` when
 * the caller must stop — the reply is already sent.
 */
export async function requireSession(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<PortalRequestContext | null> {
  reply.header('cache-control', 'no-store')
  const result = loadPortalConfig()
  if (!result.ok) {
    await reply.code(503).send({ error: 'portal_unavailable', missing: result.missing })
    return null
  }
  const config = result.config
  const db = getDatabase(config.databaseUrl)
  const active = await loadSession(db, config, readCookie(request.headers.cookie, SESSION_COOKIE))
  if (active === null) {
    await reply.code(401).send({ error: 'unauthenticated' })
    return null
  }
  await touchSession(db, config, active.session)
  return { db, user: active.user, config }
}

/** `true` when the request carries the CSRF header matching the signed cookie. */
export function hasCsrfToken(context: PortalRequestContext, request: FastifyRequest): boolean {
  return verifyCsrf(context.config, request.headers.cookie, headerValue(request, 'x-csrf-token'))
}

/** Rejects a state-changing request without a valid token (403). */
export async function requireCsrf(
  context: PortalRequestContext,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<boolean> {
  if (hasCsrfToken(context, request)) return true
  await reply.code(403).send({ error: 'invalid_csrf' })
  return false
}
