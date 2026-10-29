/**
 * Usage repository (Issue #48).
 *
 * `monthRange` is pure and always runs. The SQL test runs against a *fixture
 * schema* with the same shape as `litellm.v_request_log`, so the query is proven
 * without depending on the real facade (or on LiteLLM having logged anything):
 *
 *   PORTAL_DB_TEST=1 npm test -- server/usage/repository.test.ts
 */

import { afterAll, describe, expect, it } from 'vitest'
import { loadPortalConfig } from '../config'
import { closeDatabase, getPool } from '../db/client'
import { testConfig } from '../testing/fixtures'
import { createUsageRepository, monthRange } from './repository'

describe('monthRange', () => {
  it('maps the Vienna month to naive UTC bounds in summer time', () => {
    const range = monthRange(new Date('2026-10-15T12:00:00Z'))
    expect(range.key).toBe('2026-10')
    expect(range.label).toBe('Oktober 2026')
    // 1 Oct 00:00 CEST = 30 Sep 22:00 UTC; 1 Nov 00:00 CET = 31 Oct 23:00 UTC.
    expect(range.from).toBe('2026-09-30 22:00:00')
    expect(range.to).toBe('2026-10-31 23:00:00')
  })

  it('handles winter time and the year boundary', () => {
    const range = monthRange(new Date('2026-12-15T12:00:00Z'))
    expect(range.key).toBe('2026-12')
    expect(range.label).toBe('Dezember 2026')
    expect(range.from).toBe('2026-11-30 23:00:00')
    expect(range.to).toBe('2026-12-31 23:00:00')

    const january = monthRange(new Date('2027-01-01T00:30:00Z'))
    expect(january.key).toBe('2027-01')
    expect(january.from).toBe('2026-12-31 23:00:00')
    expect(january.to).toBe('2027-01-31 23:00:00')
  })

  it('treats an instant just after UTC midnight as the same Vienna month', () => {
    // 31 Oct 23:30 UTC is already 1 Nov in Vienna (CET, UTC+1).
    const range = monthRange(new Date('2026-10-31T23:30:00Z'))
    expect(range.key).toBe('2026-11')
  })
})

const configResult = loadPortalConfig()
const enabled = process.env.PORTAL_DB_TEST === '1' && configResult.ok
const persistenceConfig = (configResult.ok ? configResult.config : null) ?? testConfig()
const SCHEMA = `litellm_fixture_${process.pid.toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`

describe.skipIf(!enabled)('usage repository (fixture schema)', () => {
  const pool = getPool(persistenceConfig.databaseUrl)

  afterAll(async () => {
    await pool.query(`drop schema if exists "${SCHEMA}" cascade`)
    await closeDatabase()
  })

  it('aggregates the current month per model for one user only', async () => {
    await pool.query(`create schema "${SCHEMA}"`)
    await pool.query(`create table "${SCHEMA}".v_request_log (
      request_id text primary key,
      user_id text not null,
      api_key text not null default '',
      model text,
      model_group text,
      custom_llm_provider text,
      call_type text,
      status text,
      prompt_tokens integer not null default 0,
      completion_tokens integer not null default 0,
      total_tokens integer not null default 0,
      spend double precision not null default 0,
      cache_hit text,
      start_time timestamp(3) without time zone not null,
      end_time timestamp(3) without time zone,
      created_at timestamp(3) without time zone not null default now()
    )`)

    const insert = `insert into "${SCHEMA}".v_request_log
      (request_id, user_id, model, model_group, prompt_tokens, completion_tokens, total_tokens, spend, start_time)
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`

    // Inside the current month — the aggregates must add both rows.
    await pool.query(insert, [
      'r1',
      'ap48-usage',
      'openai/stub',
      'stub-model',
      11,
      7,
      18,
      0.000025,
      new Date(),
    ])
    await pool.query(insert, [
      'r2',
      'ap48-usage',
      'openai/stub',
      'stub-model',
      3,
      1,
      4,
      0.000005,
      new Date(),
    ])
    // Another user and another month must not leak in.
    await pool.query(insert, [
      'r3',
      'ap48-other',
      'openai/stub',
      'stub-model',
      100,
      100,
      200,
      1,
      new Date(),
    ])
    await pool.query(
      `insert into "${SCHEMA}".v_request_log
         (request_id, user_id, model, model_group, prompt_tokens, completion_tokens, total_tokens, spend, start_time)
       values ('r4', 'ap48-usage', 'openai/stub', 'stub-model', 9, 9, 18, 9, now() - interval '2 months')`,
    )

    const range = monthRange(new Date())
    const repository = createUsageRepository(pool, SCHEMA)
    const usage = await repository.monthlyByModel({
      userId: 'ap48-usage',
      from: range.from,
      to: range.to,
    })

    expect(usage.models).toHaveLength(1)
    expect(usage.models[0]).toMatchObject({
      model: 'stub-model',
      promptTokens: 14,
      completionTokens: 8,
      totalTokens: 22,
      requests: 2,
    })
    expect(usage.models[0]?.spendUsd).toBeCloseTo(0.00003, 10)
    expect(usage.totals).toMatchObject({
      promptTokens: 14,
      completionTokens: 8,
      totalTokens: 22,
      requests: 2,
    })
    expect(usage.totals.spendUsd).toBeCloseTo(0.00003, 10)
  })

  it('rejects a schema name that is not a plain identifier', () => {
    expect(() => createUsageRepository(pool, 'litellm; drop schema public')).toThrow()
  })
})
