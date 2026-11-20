/**
 * Read model and grant ledger for the admin credit page (Issue #64, slice of #49).
 *
 * The list is one query over `portal.users` plus the read-only gateway facade
 * `litellm.v_user` — no gateway round trip per row, and the portal never keeps a
 * second budget. `availableUsd` is computed from the gateway's own enforcement
 * values (`max_budget` minus `spend`), so the page cannot disagree with the 429s
 * the proxy sends.
 *
 * Schema names are injectable so the SQL test runs against fixture schemas
 * instead of the real deployment (same pattern as `usage/repository.ts`).
 */

import type { Pool } from 'pg'
import type { Role } from '../db/schema'

export interface AdminUserRow {
  /** `portal.users.id`, needed for the ledger and for the audit row. */
  userId: string
  sam: string
  displayName: string
  role: Role
  /** Monthly allowance from the gateway; `null` when none is set. */
  maxBudgetUsd: number | null
  /** The gateway's period spend counter — the value it enforces. */
  spendUsd: number
  /** Gateway `budget_reset_at` of the user, ISO string or `null`. */
  resetAt: string | null
  /** Sum of this period's admin top-ups, in USD. */
  grantedUsd: number
  lastLoginAt: string | null
}

export interface GrantRecord {
  userId: string
  amountUsd: number
  maxBudgetAfterUsd: number
  note: string | null
  grantedBy: string
  /** Gateway `budget_reset_at` at grant time; `null` when the user has none. */
  resetsAt: Date | null
}

export interface AdminStore {
  /** All portal accounts matching `query` (empty = all), sorted by name. */
  listUsers(input: { query: string; limit: number }): Promise<AdminUserRow[]>
  /** One account by `sam`, case-insensitively. */
  findBySam(sam: string): Promise<AdminUserRow | null>
  insertGrant(record: GrantRecord): Promise<void>
}

export interface AdminStoreOptions {
  /** Schema of the LiteLLM read-only facade (default `litellm`). */
  litellmSchema?: string
  /** Schema of the portal tables (default `portal`). */
  portalSchema?: string
}

const SCHEMA_PATTERN = /^[a-z_][a-z0-9_]*$/

function requireSchema(schema: string): string {
  if (!SCHEMA_PATTERN.test(schema)) throw new Error(`Invalid schema name: ${schema}`)
  return schema
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : null
}

function toIsoOrNull(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string' && value !== '') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
  }
  return null
}

interface RawRow {
  user_id: string
  sam: string
  display_name: string
  role: Role
  max_budget: unknown
  spend: unknown
  budget_reset_at: unknown
  granted_usd: unknown
  last_login_at: unknown
}

function rowFromRaw(row: RawRow): AdminUserRow {
  return {
    userId: row.user_id,
    sam: row.sam,
    displayName: row.display_name,
    role: row.role,
    maxBudgetUsd: toNumberOrNull(row.max_budget),
    spendUsd: toNumberOrNull(row.spend) ?? 0,
    resetAt: toIsoOrNull(row.budget_reset_at),
    grantedUsd: toNumberOrNull(row.granted_usd) ?? 0,
    lastLoginAt: toIsoOrNull(row.last_login_at),
  }
}

export function createAdminStore(pool: Pool, options: AdminStoreOptions = {}): AdminStore {
  const litellm = requireSchema(options.litellmSchema ?? 'litellm')
  const portal = requireSchema(options.portalSchema ?? 'portal')

  // The grant sum is tied to the *current* gateway period: `resets_at` is what
  // `budget_reset_at` was when the grant was made. `is not distinct from` makes
  // the comparison hold for users without a budget duration (both sides null).
  //
  // `LiteLLM_UserTable.budget_reset_at` is `timestamp(3) without time zone`
  // holding naive UTC (like the spend logs, see PITFALLS). Comparing it to the
  // grant's `timestamptz` would make Postgres interpret it in the server zone and
  // shift the period by the UTC offset — hence the explicit `at time zone 'UTC'`.
  const select = `
    select
      u.id as user_id,
      u.sam,
      u.display_name,
      u.role,
      u.last_login_at,
      v.max_budget,
      v.spend,
      -- Naive UTC in the source column: label it as UTC so the API value does
      -- not depend on the host's timezone.
      (v.budget_reset_at at time zone 'UTC') as budget_reset_at,
      coalesce(g.granted_usd, 0) as granted_usd
    from "${portal}".users u
    left join "${litellm}".v_user v on v.user_id = u.sam
    left join lateral (
      select sum(c.amount_usd) as granted_usd
      from "${portal}".credit_grant c
      where c.user_id = u.id
        and c.resets_at is not distinct from (v.budget_reset_at at time zone 'UTC')
    ) g on true`

  return {
    async listUsers({ query, limit }) {
      const { rows } = await pool.query<RawRow>(
        `${select}
         where $1 = ''
            or position(lower($1) in lower(u.sam)) > 0
            or position(lower($1) in lower(u.display_name)) > 0
         order by u.display_name asc, u.sam asc
         limit $2`,
        [query.trim().toLowerCase(), limit],
      )
      return rows.map(rowFromRaw)
    },

    async findBySam(sam) {
      const { rows } = await pool.query<RawRow>(`${select} where u.sam = lower($1) limit 1`, [sam])
      const row = rows[0]
      return row === undefined ? null : rowFromRaw(row)
    },

    async insertGrant(record) {
      await pool.query(
        `insert into "${portal}".credit_grant
           (user_id, amount_usd, max_budget_after_usd, note, granted_by, resets_at)
         values ($1, $2, $3, $4, $5, $6)`,
        [
          record.userId,
          record.amountUsd.toFixed(2),
          record.maxBudgetAfterUsd.toFixed(2),
          record.note,
          record.grantedBy,
          record.resetsAt,
        ],
      )
    },
  }
}
