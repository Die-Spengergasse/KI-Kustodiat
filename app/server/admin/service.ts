/**
 * Admin credit top-ups (Issue #64, the admin-UI slice of #49).
 *
 * Semantics, deliberately narrow: the gateway has no credit account, only
 * `max_budget` minus `spend`. A top-up therefore **raises `max_budget`** and
 * nothing else — `spend`, `budget_reset_at` and `budget_duration` stay untouched,
 * so the monthly period keeps running and raising the allowance also clears an
 * `ExceededBudget` lockout (the 2026-11-20 `grafg` case).
 *
 * Every raise is written to `portal.credit_grant` as a one-off grant for the
 * running period. Without that ledger the raise would silently repeat every
 * month; with it, the reconcile job from #49 can revert to the role policy.
 *
 * All writes go through the LiteLLM admin API. Never SQL: the proxy keeps the
 * user in memory and a cross-pod `spend:user:<id>` counter in Redis, and only
 * `/user/update` invalidates both (see `docs/ai/pitfalls/litellm-gateway.md`).
 */

import type { Role } from '../db/schema'
import type { LitellmClient } from '../litellm/client'
import type { AdminStore, AdminUserRow } from './store'

export const ADMIN_NOTE_MAX_LENGTH = 200

/** What the admin page shows per account. USD is fine here (staff, not pupils). */
export interface AdminUser {
  sam: string
  displayName: string
  role: Role
  /** Monthly allowance from the gateway; `null` when none is set. */
  maxBudgetUsd: number | null
  spendUsd: number
  /** `max(0, maxBudget - spend)`; `null` without an allowance. */
  availableUsd: number | null
  resetAt: string | null
  /** Top-ups granted in the running period. */
  grantedUsd: number
  lastLoginAt: string | null
}

export type CreditErrorCode =
  | 'amount_invalid'
  | 'amount_too_large'
  | 'note_invalid'
  | 'note_too_long'
  | 'user_not_found'
  | 'user_not_provisioned'
  | 'budget_not_initialized'
  | 'grant_not_recorded'

export class CreditError extends Error {
  constructor(
    readonly code: CreditErrorCode,
    /** Upper bound in USD for `amount_too_large`. */
    readonly limit?: number,
  ) {
    super(code)
    this.name = 'CreditError'
  }
}

export interface AdminServiceDeps {
  client: LitellmClient
  store: AdminStore
  /**
   * Best-effort audit write; failures are logged, never fatal (see the route).
   * Receives the affected `sam` (the admin is in the route's context).
   */
  audit: (targetSam: string, detail: string) => Promise<void>
  /** Upper bound of one top-up, from `PORTAL_ADMIN_CREDIT_MAX_USD`. */
  maxCreditUsd: number
}

export interface GrantInput {
  /** Target `sam`; matched case-insensitively. */
  sam: string
  amountUsd: unknown
  note?: unknown
}

export function roundUsd(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/**
 * Rounded **down** to cents: showing "2,00 USD verfügbar" for 1.9994 would let
 * the next request fail with 1 cent still shown as free.
 */
function availableOf(maxBudgetUsd: number | null, spendUsd: number): number | null {
  if (maxBudgetUsd === null) return null
  const cents = Math.floor((maxBudgetUsd - spendUsd) * 100 + 1e-9)
  return Math.max(0, cents) / 100
}

function toAdminUser(row: AdminUserRow): AdminUser {
  return {
    sam: row.sam,
    displayName: row.displayName,
    role: row.role,
    maxBudgetUsd: row.maxBudgetUsd,
    spendUsd: row.spendUsd,
    availableUsd: availableOf(row.maxBudgetUsd, row.spendUsd),
    resetAt: row.resetAt,
    grantedUsd: roundUsd(row.grantedUsd),
    lastLoginAt: row.lastLoginAt,
  }
}

/**
 * Amounts are numbers in the API; the browser parses "2,50" before sending.
 * Rounding to cents keeps `max_budget` readable and the ledger check constraint
 * meaningful.
 */
export function validateAmount(raw: unknown, maxCreditUsd: number): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) {
    throw new CreditError('amount_invalid')
  }
  const amount = roundUsd(raw)
  if (amount < 0.01) throw new CreditError('amount_invalid')
  if (amount > maxCreditUsd) throw new CreditError('amount_too_large', maxCreditUsd)
  return amount
}

function validateNote(raw: unknown): string | null {
  if (raw === undefined || raw === null) return null
  if (typeof raw !== 'string') throw new CreditError('note_invalid')
  const note = raw.trim()
  if (note === '') return null
  if (note.length > ADMIN_NOTE_MAX_LENGTH) throw new CreditError('note_too_long')
  return note
}

export async function listUsers(
  deps: AdminServiceDeps,
  input: { query: string; limit: number },
): Promise<AdminUser[]> {
  const rows = await deps.store.listUsers(input)
  return rows.map(toAdminUser)
}

/**
 * Raises one account's monthly allowance by `amountUsd` and records the grant.
 *
 * The gateway is written first because that is the effect the admin asked for.
 * If the ledger write then fails, the allowance is reverted — a credit that
 * nobody can trace is worse than a failed request — and the route answers 502.
 *
 * Admins may top up their own account; the `admin` role is not a budget class.
 */
export async function grantCredit(
  deps: AdminServiceDeps,
  admin: { userId: string },
  input: GrantInput,
): Promise<AdminUser> {
  const amount = validateAmount(input.amountUsd, deps.maxCreditUsd)
  const note = validateNote(input.note)

  const target = await deps.store.findBySam(input.sam)
  if (target === null) throw new CreditError('user_not_found')

  const gatewayUser = await deps.client.getUser(target.sam)
  if (gatewayUser === null) throw new CreditError('user_not_provisioned')
  if (gatewayUser.maxBudgetUsd === null) throw new CreditError('budget_not_initialized')

  const previousMax = gatewayUser.maxBudgetUsd
  const nextMax = roundUsd(previousMax + amount)
  const updated = await deps.client.updateUserBudget({
    userId: target.sam,
    maxBudgetUsd: nextMax,
  })

  const resetsAt = gatewayUser.budgetResetAt === null ? null : new Date(gatewayUser.budgetResetAt)

  try {
    await deps.store.insertGrant({
      userId: target.userId,
      amountUsd: amount,
      maxBudgetAfterUsd: nextMax,
      note,
      grantedBy: admin.userId,
      resetsAt,
    })
  } catch {
    // Compensate, then report. A second failure is logged by the caller and
    // surfaces as the same 502; the admin sees that nothing was booked.
    try {
      await deps.client.updateUserBudget({ userId: target.sam, maxBudgetUsd: previousMax })
    } catch {
      // Best effort only — the route logs the original error.
    }
    throw new CreditError('grant_not_recorded')
  }

  await deps.audit(
    target.sam,
    `+${amount.toFixed(2)} USD (Kontingent ${previousMax.toFixed(2)} → ${nextMax.toFixed(2)} USD)`,
  )

  return {
    ...toAdminUser(target),
    maxBudgetUsd: nextMax,
    spendUsd: updated.spendUsd,
    availableUsd: availableOf(nextMax, updated.spendUsd),
    grantedUsd: roundUsd(target.grantedUsd + amount),
  }
}
