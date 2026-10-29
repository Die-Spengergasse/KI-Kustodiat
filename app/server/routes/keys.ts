/**
 * `/api/keys` — self-service key management (Issue #48).
 *
 *   GET    /api/keys                 own keys (active + revocation history)
 *   POST   /api/keys                 create; the secret is in the response, once
 *   POST   /api/keys/:token/rotate   new key with the same alias, old one revoked
 *   DELETE /api/keys/:token          revoke (soft-deleted in `portal.key_meta`)
 *
 * Every state-changing call needs the CSRF token, and every call is scoped to the
 * logged-in user's gateway id (`sam`); foreign tokens answer `404`. Secrets are
 * only ever in a `cache-control: no-store` creation/rotation response.
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { recordAudit } from '../auth/audit'
import { provisionLitellmUser } from '../auth/provisioning'
import { LitellmError, createLitellmClient } from '../litellm/client'
import {
  KeyLimitError,
  KeyNotFoundError,
  KeyValidationError,
  createKey,
  listKeys,
  revokeKey,
  rotateKey,
  type KeyOwner,
  type KeyServiceDeps,
  type PortalKey,
} from '../keys/service'
import { createKeyMetaStore } from '../keys/store'
import { requireCsrf, requireSession, type PortalRequestContext } from './session'

/** German wording for the validation cases the UI can actually trigger. */
function validationMessage(error: KeyValidationError): string {
  switch (error.code) {
    case 'label_required':
      return 'Bitte gib eine Bezeichnung an — daran erkennst du den Schlüssel später wieder.'
    case 'label_too_long':
      return 'Die Bezeichnung ist zu lang (höchstens 64 Zeichen).'
    case 'user_not_provisioned':
      return 'Dein Gateway-Zugang konnte nicht angelegt werden. Bitte melde dich neu an; bleibt es dabei, wende dich an die Kustodie.'
  }
}

/** LiteLLM `token` is a SHA-256 hex digest; anything else is not a key id. */
const TOKEN_PATTERN = /^[0-9a-f]{64}$/i

interface LabelBody {
  label?: unknown
}

function ownerOf(context: PortalRequestContext): KeyOwner {
  return {
    userId: context.user.id,
    sam: context.user.sam,
    role: context.user.role,
  }
}

function depsFor(context: PortalRequestContext, request: FastifyRequest): KeyServiceDeps {
  return {
    client: createLitellmClient(context.config.litellm),
    store: createKeyMetaStore(context.db),
    provision: (sam) =>
      provisionLitellmUser(context.config.litellm, {
        userId: sam,
        alias: context.user.displayName,
        mail: context.user.mail,
      }),
    audit: async (event, detail) => {
      await recordAudit(
        context.db,
        { event, userId: context.user.id, sam: context.user.sam, ip: request.ip, detail },
        (error) => request.log.error({ err: error }, 'audit write failed'),
      )
    },
  }
}

function summary(key: PortalKey): PortalKey {
  return {
    token: key.token,
    alias: key.alias,
    label: key.label,
    createdAt: key.createdAt,
    lastUsedAt: key.lastUsedAt,
    status: key.status,
    revokedAt: key.revokedAt,
    revokeReason: key.revokeReason,
  }
}

function keyFromGenerated(
  generated: { key: { token: string; alias: string | null; createdAt: string | null } },
  label: string | null,
): PortalKey {
  return {
    token: generated.key.token,
    alias: generated.key.alias,
    label,
    createdAt: generated.key.createdAt,
    lastUsedAt: null,
    status: 'active',
    revokedAt: null,
    revokeReason: null,
  }
}

function tokenParam(request: FastifyRequest): string | null {
  const params = request.params as { token?: string }
  const token = params.token
  return token !== undefined && TOKEN_PATTERN.test(token) ? token : null
}

function labelFromBody(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) return null
  const { label } = body as LabelBody
  return typeof label === 'string' ? label : null
}

/**
 * Maps service errors to the HTTP contract. Anything unexpected is a gateway
 * problem from the user's point of view; the details go to the log only.
 */
function fail(reply: FastifyReply, error: unknown, request: FastifyRequest): FastifyReply {
  if (error instanceof KeyLimitError) {
    return reply.code(409).send({
      error: 'key_limit_reached',
      limit: error.limit,
      message: `Es sind höchstens ${error.limit} aktive Schlüssel erlaubt. Bitte zuerst einen Schlüssel widerrufen.`,
    })
  }
  if (error instanceof KeyNotFoundError) {
    return reply
      .code(404)
      .send({ error: 'key_not_found', message: 'Dieser Schlüssel existiert nicht.' })
  }
  if (error instanceof KeyValidationError) {
    return reply.code(400).send({
      error: error.code,
      message: validationMessage(error),
    })
  }
  request.log.error({ err: error }, 'key request failed')
  return reply.code(502).send({
    error: 'gateway_error',
    message: 'Der Gateway ist gerade nicht erreichbar. Bitte später erneut versuchen.',
  })
}

export async function registerKeyRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/keys', async (request, reply) => {
    const context = await requireSession(request, reply)
    if (context === null) return reply

    try {
      const keys = await listKeys(depsFor(context, request), ownerOf(context))
      return reply.code(200).send({
        limit: context.config.keys.maxActiveKeys[context.user.role],
        keys: keys.map(summary),
      })
    } catch (error) {
      return fail(reply, error, request)
    }
  })

  app.post('/api/keys', async (request, reply) => {
    const context = await requireSession(request, reply)
    if (context === null) return reply
    if (!(await requireCsrf(context, request, reply))) return reply

    try {
      const generated = await createKey(depsFor(context, request), ownerOf(context), {
        label: labelFromBody(request.body),
        limit: context.config.keys.maxActiveKeys[context.user.role],
        monthlyBudgetUsd: context.config.keys.monthlyBudgetUsd[context.user.role],
      })
      // The only response that ever carries the clear-text key.
      return reply
        .code(201)
        .header('cache-control', 'no-store')
        .send({
          secret: generated.secret,
          key: keyFromGenerated(generated, generated.label),
        })
    } catch (error) {
      return fail(reply, error, request)
    }
  })

  app.post('/api/keys/:token/rotate', async (request, reply) => {
    const context = await requireSession(request, reply)
    if (context === null) return reply
    if (!(await requireCsrf(context, request, reply))) return reply

    const token = tokenParam(request)
    if (token === null) {
      return reply
        .code(404)
        .send({ error: 'key_not_found', message: 'Dieser Schlüssel existiert nicht.' })
    }

    try {
      const result = await rotateKey(depsFor(context, request), ownerOf(context), token)
      return reply
        .code(201)
        .header('cache-control', 'no-store')
        .send({
          secret: result.secret,
          key: keyFromGenerated(result, result.label),
          revokedOld: result.revokedOld,
        })
    } catch (error) {
      return fail(reply, error, request)
    }
  })

  app.delete('/api/keys/:token', async (request, reply) => {
    const context = await requireSession(request, reply)
    if (context === null) return reply
    if (!(await requireCsrf(context, request, reply))) return reply

    const token = tokenParam(request)
    if (token === null) {
      return reply
        .code(404)
        .send({ error: 'key_not_found', message: 'Dieser Schlüssel existiert nicht.' })
    }

    try {
      await revokeKey(depsFor(context, request), ownerOf(context), token)
      return reply.code(200).send({ revoked: token })
    } catch (error) {
      if (error instanceof LitellmError) request.log.error({ err: error }, 'key revoke failed')
      return fail(reply, error, request)
    }
  })
}
