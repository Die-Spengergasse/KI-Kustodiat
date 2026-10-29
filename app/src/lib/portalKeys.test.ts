/**
 * Browser-side key client (Issue #48).
 *
 * These assertions pin the HTTP shape, not the UI: a state-changing call without
 * a body must not claim `content-type: application/json` (Fastify answers 400
 * "Body cannot be empty …"), rotation must send `{}`, and every call carries the
 * CSRF header.
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { PortalApiError } from './portalApi'
import { createKey, fetchKeys, revokeKey, rotateKey } from './portalKeys'

interface Captured {
  url: string
  method: string
  headers: Record<string, string>
  body: string | null | undefined
}

let captured: Captured | null = null
let answer: { status: number; body: unknown } = { status: 200, body: {} }

function stubFetch(): void {
  vi.stubGlobal('fetch', async (url: string, init: RequestInit = {}) => {
    captured = {
      url,
      method: init.method ?? 'GET',
      headers: (init.headers ?? {}) as Record<string, string>,
      body: init.body as string | undefined,
    }
    return new Response(JSON.stringify(answer.body), {
      status: answer.status,
      headers: { 'content-type': 'application/json' },
    })
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  captured = null
  answer = { status: 200, body: {} }
})

const TOKEN = 'a'.repeat(64)

describe('portal key client', () => {
  it('lists keys with a plain GET', async () => {
    stubFetch()
    answer = { status: 200, body: { limit: 10, keys: [] } }

    expect(await fetchKeys()).toEqual({ limit: 10, keys: [] })
    expect(captured?.url).toBe('/api/keys')
    expect(captured?.method).toBe('GET')
  })

  it('creates a key with the CSRF header and the label in the body', async () => {
    stubFetch()
    answer = { status: 201, body: { secret: 'sk-x', key: { token: TOKEN } } }

    await createKey('  Laptop  ', 'csrf-value')

    expect(captured?.method).toBe('POST')
    expect(captured?.headers['x-csrf-token']).toBe('csrf-value')
    expect(captured?.headers['content-type']).toBe('application/json')
    expect(JSON.parse(captured?.body ?? '{}')).toEqual({ label: 'Laptop' })
  })

  it('rotates with an empty JSON object (Fastify rejects an empty body)', async () => {
    stubFetch()
    answer = { status: 201, body: { secret: 'sk-y', key: { token: TOKEN }, revokedOld: true } }

    await rotateKey(TOKEN, 'csrf-value')

    expect(captured?.url).toBe(`/api/keys/${TOKEN}/rotate`)
    expect(captured?.headers['content-type']).toBe('application/json')
    expect(captured?.body).toBe('{}')
  })

  it('revokes without content-type and without a body', async () => {
    stubFetch()
    answer = { status: 200, body: { revoked: TOKEN } }

    await revokeKey(TOKEN, 'csrf-value')

    expect(captured?.method).toBe('DELETE')
    expect(captured?.headers['x-csrf-token']).toBe('csrf-value')
    expect(captured?.headers['content-type']).toBeUndefined()
    expect(captured?.body).toBeUndefined()
  })

  it('maps the soft-limit answer to a PortalApiError with its message', async () => {
    stubFetch()
    answer = {
      status: 409,
      body: { error: 'key_limit_reached', limit: 10, message: 'höchstens 10' },
    }

    const error = await createKey('x', 'csrf-value').catch((caught: unknown) => caught)
    expect(error).toBeInstanceOf(PortalApiError)
    expect((error as PortalApiError).status).toBe(409)
    expect((error as PortalApiError).body.message).toBe('höchstens 10')
  })
})
