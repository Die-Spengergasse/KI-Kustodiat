/**
 * Client side of `/api/usage/summary` (Issue #48).
 *
 * The payload carries USD because the gateway counts in USD; the page shows the
 * percentage of the monthly allowance plus token counts (§ DECISIONS
 * 2026-10-29 — "USD intern, Prozent + Tokens in der Anzeige").
 */

import { JSON_HEADERS, PortalApiError, errorBody, requestPortal } from './portalApi'

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

export interface UsageSummary {
  month: string
  label: string
  from: string
  to: string
  allowance: {
    /** Monthly allowance in USD; `null` when the gateway enforces none. */
    monthlyUsd: number | null
    /** Share of the allowance used this month, `null` without an allowance. */
    percentUsed: number | null
    resetAt: string | null
  }
  totals: UsageTotals
  models: UsageModelRow[]
}

export async function fetchUsageSummary(): Promise<UsageSummary> {
  const { status, body } = await requestPortal('/api/usage/summary', {
    method: 'GET',
    headers: JSON_HEADERS,
  })
  if (status !== 200) throw new PortalApiError(status, errorBody(body))
  return body as UsageSummary
}

/** Token counts with thousands separators (`1.234.567` in German). */
export function formatTokens(value: number): string {
  return new Intl.NumberFormat('de-AT').format(value)
}

/** Percentage with at most two decimals; tiny non-zero usage never reads as 0. */
export function formatPercent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '–'
  if (value > 0 && value < 0.01) return '< 0,01 %'
  const rounded = Math.round(value * 100) / 100
  return `${new Intl.NumberFormat('de-AT', { maximumFractionDigits: 2 }).format(rounded)} %`
}

/** Share of one model's spend in the monthly allowance. */
export function modelPercent(spendUsd: number, monthlyUsd: number | null): number | null {
  if (monthlyUsd === null || monthlyUsd <= 0) return null
  return (spendUsd / monthlyUsd) * 100
}

/** `1. November 2026` for the next budget reset. */
export function formatResetDate(iso: string | null): string {
  if (iso === null || iso === '') return '–'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '–'
  return new Intl.DateTimeFormat('de-AT', { dateStyle: 'long' }).format(date)
}
