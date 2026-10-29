/**
 * Spend/token read model for the portal (Issue #48).
 *
 * The data comes from the read-only facade `litellm.*` (see
 * `app/db/litellm-views.sql`), never from `public.*` — LiteLLM's Prisma schema
 * stays untouched. This module is the only place that knows the view's column
 * names, so a later data source (own table, FDW, another database) is a change
 * here and nowhere else.
 *
 * Timestamps in `LiteLLM_SpendLogs` are naive UTC wall-clock values. "This month"
 * means the current month in `Europe/Vienna`, so the range is converted to UTC
 * before it is compared — the same month boundary the gateway's monthly budget
 * uses (LiteLLM 1.101 resets at the UTC month start, 01:00 in Vienna).
 */

import type { Pool } from 'pg'

export interface UsageModelRow {
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  spendUsd: number
  requests: number
}

export interface UsageTotals {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  spendUsd: number
  requests: number
}

export interface MonthlyUsage {
  models: UsageModelRow[]
  totals: UsageTotals
}

export interface UsageRepository {
  /** Per-model tokens and spend of one gateway user inside `[from, to)`. */
  monthlyByModel(input: { userId: string; from: string; to: string }): Promise<MonthlyUsage>
}

export interface MonthRange {
  /** `2026-10` — stable key for caching and display logic. */
  key: string
  /** `Oktober 2026`. */
  label: string
  /** Inclusive lower bound, naive UTC (`2026-09-30 22:00:00`). */
  from: string
  /** Exclusive upper bound, naive UTC. */
  to: string
}

/** Wall-clock parts of `instant` in `timeZone`, as if they were UTC milliseconds. */
function zonedWallClockMs(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(instant))
  const value = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((entry) => entry.type === type)
    return part === undefined ? 0 : Number.parseInt(part.value, 10)
  }
  return Date.UTC(
    value('year'),
    value('month') - 1,
    value('day'),
    value('hour'),
    value('minute'),
    value('second'),
  )
}

/** Offset of `timeZone` at `instant`, in milliseconds (Vienna: +1h or +2h). */
function zoneOffsetMs(instant: number, timeZone: string): number {
  return zonedWallClockMs(instant, timeZone) - instant
}

/** Naive UTC timestamp string Postgres reads for a `timestamp(3) without time zone`. */
function naiveUtc(instant: number): string {
  return new Date(instant).toISOString().slice(0, 19).replace('T', ' ')
}

/**
 * Start (inclusive) and end (exclusive) of the current month in `timeZone`,
 * expressed as naive UTC timestamps.
 */
export function monthRange(now: Date, timeZone = 'Europe/Vienna'): MonthRange {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now)
  const part = (type: Intl.DateTimeFormatPartTypes): number => {
    const entry = parts.find((candidate) => candidate.type === type)
    return entry === undefined ? 0 : Number.parseInt(entry.value, 10)
  }
  const year = part('year')
  const month = part('month')

  // Local midnight on the 1st; the offset at that instant converts it to UTC.
  const startGuess = Date.UTC(year, month - 1, 1, 0, 0, 0)
  const endGuess = Date.UTC(year, month, 1, 0, 0, 0)
  const from = startGuess - zoneOffsetMs(startGuess, timeZone)
  const to = endGuess - zoneOffsetMs(endGuess, timeZone)

  return {
    key: `${year}-${String(month).padStart(2, '0')}`,
    label: new Intl.DateTimeFormat('de-AT', {
      timeZone,
      month: 'long',
      year: 'numeric',
    }).format(now),
    from: naiveUtc(from),
    to: naiveUtc(to),
  }
}

const SCHEMA_PATTERN = /^[a-z_][a-z0-9_]*$/

function requireSchema(schema: string): string {
  if (!SCHEMA_PATTERN.test(schema)) throw new Error(`Invalid schema name: ${schema}`)
  return schema
}

function toNumber(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value ?? '0'), 10)
  return Number.isFinite(parsed) ? parsed : 0
}

function toFloat(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? '0'))
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * SQL implementation over the `litellm` views. `schema` is injectable so the
 * tests can run against a fixture schema instead of the real facade.
 */
export function createUsageRepository(pool: Pool, schema = 'litellm'): UsageRepository {
  const views = requireSchema(schema)

  return {
    async monthlyByModel({ userId, from, to }) {
      const { rows } = await pool.query<{
        model: string
        prompt_tokens: string
        completion_tokens: string
        total_tokens: string
        spend: string
        requests: string
      }>(
        `select
           coalesce(nullif(model_group, ''), nullif(model, ''), 'unbekannt') as model,
           coalesce(sum(prompt_tokens), 0)::bigint as prompt_tokens,
           coalesce(sum(completion_tokens), 0)::bigint as completion_tokens,
           coalesce(sum(total_tokens), 0)::bigint as total_tokens,
           coalesce(sum(spend), 0)::double precision as spend,
           count(*)::bigint as requests
         from "${views}".v_request_log
         where user_id = $1
           and start_time >= $2::timestamp
           and start_time < $3::timestamp
         group by 1
         order by spend desc, model asc`,
        [userId, from, to],
      )

      const models: UsageModelRow[] = rows.map((row) => ({
        model: row.model,
        promptTokens: toNumber(row.prompt_tokens),
        completionTokens: toNumber(row.completion_tokens),
        totalTokens: toNumber(row.total_tokens),
        spendUsd: toFloat(row.spend),
        requests: toNumber(row.requests),
      }))

      const totals = models.reduce<UsageTotals>(
        (sum, row) => ({
          promptTokens: sum.promptTokens + row.promptTokens,
          completionTokens: sum.completionTokens + row.completionTokens,
          totalTokens: sum.totalTokens + row.totalTokens,
          spendUsd: sum.spendUsd + row.spendUsd,
          requests: sum.requests + row.requests,
        }),
        { promptTokens: 0, completionTokens: 0, totalTokens: 0, spendUsd: 0, requests: 0 },
      )

      return { models, totals }
    },
  }
}
