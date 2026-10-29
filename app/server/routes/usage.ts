/**
 * `/api/usage/summary` — this month's tokens and spend per model (Issue #48).
 *
 * Reads spend through the repository over the `litellm` views and the monthly
 * allowance from the gateway user (`max_budget`), so the portal never keeps a
 * second budget. USD is part of the payload because it is the gateway's unit;
 * the page shows percentage and token counts (§ "USD intern, Prozent + Tokens
 * in der Anzeige", DECISIONS 2026-10-29).
 */

import type { FastifyInstance } from 'fastify'
import { getPool } from '../db/client'
import { LitellmError, createLitellmClient } from '../litellm/client'
import { createUsageRepository, monthRange } from '../usage/repository'
import { requireSession } from './session'

export async function registerUsageRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/usage/summary', async (request, reply) => {
    const context = await requireSession(request, reply)
    if (context === null) return reply

    const range = monthRange(new Date())
    const repository = createUsageRepository(getPool(context.config.databaseUrl))

    try {
      const [usage, gatewayUser] = await Promise.all([
        repository.monthlyByModel({
          userId: context.user.sam,
          from: range.from,
          to: range.to,
        }),
        createLitellmClient(context.config.litellm).getUser(context.user.sam),
      ])

      const monthlyUsd = gatewayUser?.maxBudgetUsd ?? null
      // Four decimals of a percent: tiny usage must not read as "0 %".
      const percentUsed =
        monthlyUsd !== null && monthlyUsd > 0
          ? Math.round((usage.totals.spendUsd / monthlyUsd) * 1_000_000) / 10_000
          : null

      return reply.code(200).send({
        month: range.key,
        label: range.label,
        from: range.from,
        to: range.to,
        allowance: {
          monthlyUsd,
          percentUsed,
          resetAt: gatewayUser?.budgetResetAt ?? null,
        },
        totals: usage.totals,
        models: usage.models,
      })
    } catch (error) {
      if (error instanceof LitellmError) {
        request.log.error({ err: error }, 'usage: gateway user lookup failed')
      } else {
        request.log.error({ err: error }, 'usage: query failed')
      }
      return reply.code(502).send({
        error: 'usage_unavailable',
        message: 'Der Verbrauch ist gerade nicht abrufbar. Bitte später erneut versuchen.',
      })
    }
  })
}
