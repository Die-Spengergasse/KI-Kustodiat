/**
 * `/api/auth/*` — login, logout, session introspection (Issue #47).
 *
 * The routes are registered unconditionally, but every handler first checks the
 * deployment configuration: without `/etc/portal/portal.env` (CI, a fresh clone)
 * they answer `503` with the missing variable names instead of crashing the site.
 *
 * Response contract used by the portal page:
 *   GET  /api/auth/me     200 { authenticated: true, user, csrfToken, expiresAt }
 *                         401 { authenticated: false, csrfToken }
 *   POST /api/auth/login  200 { authenticated: true, user, csrfToken }
 *   POST /api/auth/logout 204
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { loadPortalConfig, type PortalConfig, type PortalConfigResult } from '../config'
import { getDatabase } from '../db/client'
import { recordAudit, type AuditEvent } from '../auth/audit'
import { issueCsrf, readCookie, verifyCsrf } from '../auth/csrf'
import { authenticateAgainstDirectory } from '../auth/ldap'
import { provisionLitellmUser } from '../auth/provisioning'
import {
  accountFailureWindow,
  evaluateRateLimit,
  ipFailureWindow,
  recordAttempt,
} from '../auth/ratelimit'
import { applyAdminGroup, roleFromDn } from '../auth/roles'
import {
  CSRF_COOKIE,
  SESSION_COOKIE,
  clearCookie,
  createSession,
  loadSession,
  revokeSession,
  serializeCookie,
  touchSession,
} from '../auth/sessions'
import { setLitellmUserId, toSessionUser, upsertDirectoryUser } from '../auth/users'

const USERNAME_MAX_LENGTH = 64
const PASSWORD_MAX_LENGTH = 256

interface LoginBody {
  username?: unknown
  password?: unknown
}

function noStore(reply: FastifyReply): FastifyReply {
  return reply.header('cache-control', 'no-store')
}

function unavailable(reply: FastifyReply, result: PortalConfigResult): FastifyReply {
  const missing = result.ok ? [] : result.missing
  return noStore(reply).code(503).send({ error: 'portal_unavailable', missing })
}

function parseLoginBody(body: unknown): { username: string; password: string } | null {
  if (typeof body !== 'object' || body === null) return null
  const { username, password } = body as LoginBody
  if (typeof username !== 'string' || typeof password !== 'string') return null
  const trimmed = username.trim()
  if (trimmed === '' || trimmed.length > USERNAME_MAX_LENGTH) return null
  if (password === '' || password.length > PASSWORD_MAX_LENGTH) return null
  return { username: trimmed, password }
}

function sessionCookies(
  config: PortalConfig,
  sessionCookie: string,
  csrf: ReturnType<typeof issueCsrf>,
): string[] {
  return [
    serializeCookie(SESSION_COOKIE, sessionCookie, {
      secure: config.cookieSecure,
      httpOnly: true,
      sameSite: 'Lax',
      maxAgeSeconds: config.sessionTtlSeconds,
    }),
    csrf.setCookie,
  ]
}

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/auth/me', async (request, reply) => {
    noStore(reply)
    const result = loadPortalConfig()
    if (!result.ok) return unavailable(reply, result)
    const config = result.config

    const db = getDatabase(config.databaseUrl)
    const active = await loadSession(db, config, readCookie(request.headers.cookie, SESSION_COOKIE))

    // Fresh CSRF token for every page load; the portal echoes it in the header.
    const csrf = issueCsrf(config)

    if (active === null) {
      reply.header('set-cookie', [csrf.setCookie, clearCookie(SESSION_COOKIE, config.cookieSecure)])
      return reply.code(401).send({ authenticated: false, csrfToken: csrf.token })
    }

    reply.header('set-cookie', csrf.setCookie)
    await touchSession(db, config, active.session)
    return reply.code(200).send({
      authenticated: true,
      user: toSessionUser(active.user),
      csrfToken: csrf.token,
      expiresAt: active.session.expiresAt.toISOString(),
    })
  })

  app.post('/api/auth/login', async (request, reply) => {
    noStore(reply)
    const result = loadPortalConfig()
    if (!result.ok) return unavailable(reply, result)
    const config = result.config

    if (!verifyCsrf(config, request.headers.cookie, headerValue(request, 'x-csrf-token'))) {
      return reply.code(403).send({ error: 'invalid_csrf' })
    }

    const body = parseLoginBody(request.body)
    if (body === null) {
      return reply.code(400).send({ error: 'invalid_request' })
    }

    const sam = body.username.toLowerCase()
    const ip = request.ip
    const db = getDatabase(config.databaseUrl)

    // 1. Lockout check before the directory is contacted at all.
    const decision = evaluateRateLimit({
      account: await accountFailureWindow(db, config.rateLimit, sam),
      ip: await ipFailureWindow(db, config.rateLimit, ip),
      config: config.rateLimit,
    })
    if (decision.blocked) {
      reply.header('retry-after', String(decision.retryAfterSeconds))
      await recordAudit(
        db,
        { event: 'login_blocked', sam, ip, detail: `rate limit (${decision.reason})` },
        (error) => request.log.error({ err: error }, 'audit write failed'),
      )
      return reply.code(429).send({
        error: 'rate_limited',
        reason: decision.reason,
        retryAfterSeconds: decision.retryAfterSeconds,
      })
    }

    const attempt = async (success: boolean, reason: string | null): Promise<void> => {
      await recordAttempt(db, { ip, sam, success, reason })
    }
    const audit = async (
      event: AuditEvent,
      detail: string,
      userId: string | null = null,
    ): Promise<void> => {
      await recordAudit(db, { event, sam, ip, detail, userId }, (error) =>
        request.log.error({ err: error }, 'audit write failed'),
      )
    }

    // 2. Search-then-bind against the directory.
    const lookup = await authenticateAgainstDirectory(config.ldap, sam, body.password)
    if (lookup.status === 'directory_error') {
      request.log.error({ message: lookup.message }, 'directory lookup failed')
      await attempt(false, 'directory_error')
      await audit('login_error', 'directory unavailable')
      return reply.code(502).send({ error: 'directory_unavailable' })
    }
    if (lookup.status === 'unknown_user') {
      await attempt(false, 'unknown_user')
      await audit('login_failure', 'unknown user')
      return reply.code(401).send({ error: 'invalid_credentials' })
    }
    if (lookup.status === 'invalid_credentials') {
      await attempt(false, 'invalid_credentials')
      await audit('login_failure', 'wrong password')
      return reply.code(401).send({ error: 'invalid_credentials' })
    }

    // 3. Roles come from the DN; unknown OUs get no portal access.
    const directoryRole = roleFromDn(lookup.user.dn)
    if (directoryRole === null) {
      await attempt(false, 'no_role')
      await audit('login_denied_role', 'DN does not map to a portal role')
      return reply.code(403).send({
        error: 'no_access',
        message: 'Für dieses Konto ist kein Zugang zum Portal vorgesehen.',
      })
    }
    const role = applyAdminGroup(directoryRole, lookup.user.groups, config.adminGroup)

    // 4. Upsert the account, then provision the gateway user on first login.
    let user = await upsertDirectoryUser(db, {
      sam,
      displayName: lookup.user.displayName,
      mail: lookup.user.mail,
      ldapDn: lookup.user.dn,
      role,
    })

    if (user.litellmUserId === null) {
      try {
        const provisioned = await provisionLitellmUser(config.litellm, {
          userId: user.sam,
          alias: user.displayName,
          mail: user.mail,
        })
        await setLitellmUserId(db, user.id, provisioned.userId)
        user = { ...user, litellmUserId: provisioned.userId }
        await audit('provisioning', provisioned.created ? 'created' : 'already existed', user.id)
      } catch (error) {
        // A gateway hiccup must not lock people out of the portal.
        request.log.error({ err: error }, 'litellm provisioning failed')
        await audit('provisioning_failed', 'litellm /user/new failed', user.id)
      }
    }

    // 5. New session, new CSRF token (no fixation across the login boundary).
    const session = await createSession(db, config, {
      userId: user.id,
      ip,
      userAgent: request.headers['user-agent'] ?? null,
    })
    const csrf = issueCsrf(config)
    reply.header('set-cookie', sessionCookies(config, session.signedCookie, csrf))

    await attempt(true, null)
    await audit('login_success', `role ${user.role}`, user.id)

    return reply.code(200).send({
      authenticated: true,
      user: toSessionUser(user),
      csrfToken: csrf.token,
    })
  })

  app.post('/api/auth/logout', async (request, reply) => {
    noStore(reply)
    const result = loadPortalConfig()
    if (!result.ok) return unavailable(reply, result)
    const config = result.config

    if (!verifyCsrf(config, request.headers.cookie, headerValue(request, 'x-csrf-token'))) {
      return reply.code(403).send({ error: 'invalid_csrf' })
    }

    const db = getDatabase(config.databaseUrl)
    const userId = await revokeSession(
      db,
      config,
      readCookie(request.headers.cookie, SESSION_COOKIE),
    )
    if (userId !== null) {
      await recordAudit(db, { event: 'logout', userId, ip: request.ip }, (error) =>
        request.log.error({ err: error }, 'audit write failed'),
      )
    }

    reply.header('set-cookie', [
      clearCookie(SESSION_COOKIE, config.cookieSecure),
      csrfCookieClobber(config),
    ])
    return reply.code(204).send()
  })
}

/** `Set-Cookie` value that drops the CSRF cookie (readable, so no HttpOnly). */
function csrfCookieClobber(config: PortalConfig): string {
  return serializeCookie(CSRF_COOKIE, '', {
    secure: config.cookieSecure,
    httpOnly: false,
    maxAgeSeconds: 0,
  })
}

function headerValue(request: FastifyRequest, name: string): string | undefined {
  const value = request.headers[name]
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0]
  return undefined
}
