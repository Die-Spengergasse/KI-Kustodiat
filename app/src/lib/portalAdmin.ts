/**
 * Client side of `/api/credit` (Issue #64, admin-UI slice of #49).
 *
 * The admin page shows USD because an admin has to *type* an amount; the
 * "percent + tokens, no currency" rule of the 2026-10-29 decision applies to
 * pupils and teachers, not to the operating surface.
 *
 * Amount parsing is deliberately strict instead of `Number(...)`: a mistyped
 * "2.5.0" or "1e3" must not turn into a credit.
 */

import { JSON_HEADERS, PortalApiError, errorBody, requestPortal } from './portalApi'

export type PortalRole = 'student' | 'teacher' | 'staff' | 'admin'

export interface AdminUser {
  sam: string
  displayName: string
  role: PortalRole
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

export interface AdminUserList {
  users: AdminUser[]
  /** Largest amount one top-up may add (`PORTAL_ADMIN_CREDIT_MAX_USD`). */
  maxCreditUsd: number
  limit: number
}

function csrfHeaders(csrfToken: string | null): Record<string, string> {
  return csrfToken === null ? JSON_HEADERS : { ...JSON_HEADERS, 'x-csrf-token': csrfToken }
}

function failure(status: number, body: unknown): PortalApiError {
  return new PortalApiError(status, errorBody(body))
}

export async function fetchAdminUsers(query = ''): Promise<AdminUserList> {
  const search = query.trim()
  const path =
    search === '' ? '/api/credit/users' : `/api/credit/users?q=${encodeURIComponent(search)}`
  const { status, body } = await requestPortal(path, { method: 'GET', headers: JSON_HEADERS })
  if (status !== 200) throw failure(status, body)
  return body as AdminUserList
}

export async function grantCredit(input: {
  sam: string
  amountUsd: number
  note: string
  csrfToken: string | null
}): Promise<AdminUser> {
  const note = input.note.trim()
  const { status, body } = await requestPortal(
    `/api/credit/users/${encodeURIComponent(input.sam)}/credit`,
    {
      method: 'POST',
      headers: csrfHeaders(input.csrfToken),
      body: JSON.stringify({
        amountUsd: input.amountUsd,
        ...(note === '' ? {} : { note }),
      }),
    },
  )
  if (status !== 200) throw failure(status, body)
  return (body as { user: AdminUser }).user
}

/** Only digits with one optional comma/point and at most two decimals. */
const AMOUNT_PATTERN = /^(\d{1,4})(?:[.,](\d{1,2}))?$/

/**
 * `"2,50"` → `2.5`; `""`, `"0"`, `"2,555"`, `"1e3"` → `null`.
 * The cap is checked server-side; the page checks it too for an immediate hint.
 */
export function parseAmountUsd(raw: string): number | null {
  const match = AMOUNT_PATTERN.exec(raw.trim())
  if (match === null) return null
  const whole = Number.parseInt(match[1] ?? '0', 10)
  const fraction = Number.parseInt((match[2] ?? '').padEnd(2, '0'), 10)
  const amount = Math.round((whole + fraction / 100) * 100) / 100
  return amount >= 0.01 ? amount : null
}

/** `5,00 USD`; `null` reads as a dash, never as a zero balance. */
export function formatUsd(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '–'
  return `${new Intl.NumberFormat('de-AT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} USD`
}

const ROLE_LABELS: Record<PortalRole, string> = {
  student: 'Schüler:in',
  teacher: 'Lehrkraft',
  staff: 'Verwaltung',
  admin: 'Administrator:in',
}

export function roleLabelOf(role: PortalRole): string {
  return ROLE_LABELS[role] ?? role
}

/** `1. Dezember 2026` for the next budget reset. */
export function formatResetDate(iso: string | null): string {
  if (iso === null || iso === '') return '–'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '–'
  return new Intl.DateTimeFormat('de-AT', { dateStyle: 'long' }).format(date)
}
