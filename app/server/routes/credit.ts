/**
 * `/api/credit` — admin credit top-ups (Issue #64, slice of #49).
 *
 *   GET  /api/credit/users              accounts + current allowance/spend; `?q=` filters
 *   POST /api/credit/users/:sam/credit  `{amountUsd, note?}` → raises the allowance
 *
 * Admin-only (role from `portal.users`), CSRF-protected, audited. The path is
 * `/api/credit` and not `/api/admin`: nginx deliberately answers 403 for
 * `/api/admin*` so that the LiteLLM admin API can never be exposed.
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { recordAudit } from '../auth/audit'
import { CreditError, grantCredit, listUsers, type AdminServiceDeps } from '../admin/service'
import { createAdminStore } from '../admin/store'
import { getPool } from '../db/client'
import { LitellmError, createLitellmClient } from '../litellm/client'
import { requireAdmin, requireCsrf, requireSession, type PortalRequestContext } from './session'

/** The account list is a working list, not an export; search narrows it. */
const LIST_LIMIT = 100
const SEARCH_MAX_LENGTH = 100
const NOTE_MAX_LENGTH = 200

/** `sam` values are AD account names; anything else is not worth a query. */
const SAM_PATTERN = /^[A-Za-z0-9._-]{1,64}$/

function depsFor(context: PortalRequestContext, request: FastifyRequest): AdminServiceDeps {
  return {
    client: createLitellmClient(context.config.litellm),
    store: createAdminStore(getPool(context.config.databaseUrl)),
    maxCreditUsd: context.config.admin.maxCreditUsd,
    audit: async (targetSam, detail) => {
      await recordAudit(
        context.db,
        {
          event: 'credit_granted',
          sam: targetSam,
          userId: context.user.id,
          ip: request.ip,
          detail: `von ${context.user.sam}: ${detail}`,
        },
        (error) => request.log.error({ err: error }, 'audit write failed'),
      )
    },
  }
}

function usd(value: number): string {
  return new Intl.NumberFormat('de-AT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function fail(reply: FastifyReply, error: unknown, request: FastifyRequest): FastifyReply {
  if (error instanceof CreditError) {
    switch (error.code) {
      case 'amount_invalid':
        return reply.code(400).send({
          error: error.code,
          message: 'Bitte gib einen Betrag in US-Dollar an, zum Beispiel 2,50.',
        })
      case 'amount_too_large':
        return reply.code(400).send({
          error: error.code,
          limit: error.limit ?? null,
          message: `Pro Aufladung sind höchstens ${usd(error.limit ?? 0)} USD möglich.`,
        })
      case 'note_invalid':
        return reply.code(400).send({
          error: error.code,
          message: 'Die Notiz konnte nicht gelesen werden.',
        })
      case 'note_too_long':
        return reply.code(400).send({
          error: error.code,
          message: `Die Notiz ist zu lang (höchstens ${NOTE_MAX_LENGTH} Zeichen).`,
        })
      case 'user_not_found':
        return reply.code(404).send({
          error: error.code,
          message: 'Dieses Konto gibt es in der Tokenverwaltung nicht.',
        })
      case 'user_not_provisioned':
        return reply.code(409).send({
          error: error.code,
          message:
            'Dieses Konto hat noch keinen Gateway-Zugang. Er entsteht mit der ersten Anmeldung.',
        })
      case 'budget_not_initialized':
        return reply.code(409).send({
          error: error.code,
          message:
            'Für dieses Konto ist noch kein Monatskontingent hinterlegt – es entsteht mit dem ersten API-Key.',
        })
      case 'grant_not_recorded':
        return reply.code(502).send({
          error: error.code,
          message:
            'Die Gutschrift konnte nicht verbucht werden. Bitte prüfe das Kontingent, bevor du es erneut versuchst.',
        })
    }
  }
  if (error instanceof LitellmError) {
    request.log.error({ err: error }, 'credit: gateway call failed')
    return reply.code(502).send({
      error: 'gateway_error',
      message: 'Der Gateway ist gerade nicht erreichbar. Bitte später erneut versuchen.',
    })
  }
  // Database/list failures are not gateway failures; say what is actually down.
  request.log.error({ err: error }, 'credit: request failed')
  return reply.code(502).send({
    error: 'credit_unavailable',
    message: 'Die Guthaben-Verwaltung ist gerade nicht erreichbar. Bitte später erneut versuchen.',
  })
}

function samParam(request: FastifyRequest): string | null {
  const params = request.params as { sam?: string }
  const sam = params.sam
  return sam !== undefined && SAM_PATTERN.test(sam) ? sam.toLowerCase() : null
}

function bodyOf(request: FastifyRequest): Record<string, unknown> {
  return typeof request.body === 'object' && request.body !== null
    ? (request.body as Record<string, unknown>)
    : {}
}

export async function registerCreditRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/credit/users', async (request, reply) => {
    const context = await requireSession(request, reply)
    if (context === null) return reply
    if (!(await requireAdmin(context, reply))) return reply

    const query = request.query as { q?: unknown }
    const rawQuery = typeof query.q === 'string' ? query.q : ''
    const search = rawQuery.slice(0, SEARCH_MAX_LENGTH)

    try {
      const users = await listUsers(depsFor(context, request), {
        query: search,
        limit: LIST_LIMIT,
      })
      return reply.code(200).send({
        users,
        maxCreditUsd: context.config.admin.maxCreditUsd,
        limit: LIST_LIMIT,
      })
    } catch (error) {
      return fail(reply, error, request)
    }
  })

  app.post('/api/credit/users/:sam/credit', async (request, reply) => {
    const context = await requireSession(request, reply)
    if (context === null) return reply
    if (!(await requireAdmin(context, reply))) return reply
    if (!(await requireCsrf(context, request, reply))) return reply

    const sam = samParam(request)
    if (sam === null) {
      return reply.code(404).send({
        error: 'user_not_found',
        message: 'Dieses Konto gibt es in der Tokenverwaltung nicht.',
      })
    }

    const body = bodyOf(request)
    try {
      const user = await grantCredit(
        depsFor(context, request),
        { userId: context.user.id },
        { sam, amountUsd: body.amountUsd, note: body.note },
      )
      return reply.code(200).send({ user })
    } catch (error) {
      return fail(reply, error, request)
    }
  })
}
