/**
 * LiteLLM admin client (Issue #48) against a local HTTP stub.
 *
 * The stub speaks the same shapes the gateway answered during the spike
 * (`/key/list`, `/key/generate`, `/key/delete`, `/user/info`, `/user/update`), so
 * the contract — including the "secret only in the generate response" rule — is
 * pinned without needing a running LiteLLM.
 */

import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { LitellmError, createLitellmClient } from './client'

interface Captured {
  method: string | undefined
  url: string | undefined
  body: string
  authorization: string | undefined
}

type Responder = (request: Captured) => { status: number; body: unknown }

let server: Server
let baseUrl = ''
let captured: Captured | null = null
let responder: Responder = () => ({ status: 200, body: {} })

async function readBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString('utf8')
}

beforeAll(async () => {
  server = createServer((request: IncomingMessage, response: ServerResponse) => {
    void readBody(request).then((body) => {
      captured = {
        method: request.method,
        url: request.url,
        body,
        authorization: request.headers.authorization,
      }
      const answer = responder(captured)
      response.writeHead(answer.status, { 'content-type': 'application/json' })
      response.end(JSON.stringify(answer.body))
    })
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (address === null || typeof address === 'string') throw new Error('no server address')
  baseUrl = `http://127.0.0.1:${address.port}`
})

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error === undefined ? resolve() : reject(error))),
  )
})

beforeEach(() => {
  captured = null
  responder = () => ({ status: 200, body: {} })
})

function client() {
  return createLitellmClient({ baseUrl, adminKey: 'sk-admin-test', timeoutMs: 2_000 })
}

const KEY_ROW = {
  token: 'a'.repeat(64),
  key_alias: 'Laptop',
  user_id: 'graf',
  spend: 0.5,
  created_at: '2026-10-20T10:00:00.000000Z',
  last_active: '2026-10-21T11:00:00.000000Z',
  blocked: false,
  expires: null,
}

describe('litellm client', () => {
  it('lists only the requested user’s keys and asks for full objects', async () => {
    responder = () => ({
      status: 200,
      body: { keys: [KEY_ROW, { ...KEY_ROW, token: 'b'.repeat(64), user_id: 'someone-else' }] },
    })

    const keys = await client().listKeys('graf')

    expect(keys).toHaveLength(1)
    expect(keys[0]).toMatchObject({ token: 'a'.repeat(64), alias: 'Laptop', spend: 0.5 })
    expect(captured?.method).toBe('GET')
    const url = new URL(`http://localhost${captured?.url ?? ''}`)
    expect(url.pathname).toBe('/key/list')
    expect(url.searchParams.get('user_id')).toBe('graf')
    expect(url.searchParams.get('return_full_object')).toBe('true')
    expect(captured?.authorization).toBe('Bearer sk-admin-test')
  })

  it('returns the clear-text key and its hashed token from /key/generate', async () => {
    responder = () => ({ status: 200, body: { key: 'sk-cleartext', ...KEY_ROW } })

    const generated = await client().generateKey({ userId: 'graf', alias: 'Laptop' })

    expect(generated.secret).toBe('sk-cleartext')
    expect(generated.key.token).toBe('a'.repeat(64))
    expect(JSON.parse(captured?.body ?? '{}')).toEqual({ user_id: 'graf', key_alias: 'Laptop' })
  })

  it('sends the rpm limit when one is given (Issue #55)', async () => {
    responder = () => ({ status: 200, body: { key: 'sk-cleartext', ...KEY_ROW } })

    await client().generateKey({ userId: 'graf', alias: 'Laptop', rpmLimit: 120 })

    expect(JSON.parse(captured?.body ?? '{}')).toEqual({
      user_id: 'graf',
      key_alias: 'Laptop',
      rpm_limit: 120,
    })
  })

  it('refuses a generate response that has no key or no token', async () => {    responder = () => ({ status: 200, body: { key: 'sk-cleartext' } })
    await expect(client().generateKey({ userId: 'graf', alias: null })).rejects.toBeInstanceOf(
      LitellmError,
    )
  })

  it('maps a gateway error to LitellmError with its status', async () => {
    responder = () => ({ status: 500, body: { error: 'boom' } })
    await expect(client().listKeys('graf')).rejects.toMatchObject({ status: 500 })
  })

  it('deletes by hashed token and reports an already-gone key', async () => {
    responder = () => ({ status: 200, body: { deleted_keys: ['a'.repeat(64)] } })
    expect(await client().deleteKey('a'.repeat(64))).toBe(true)
    expect(JSON.parse(captured?.body ?? '{}')).toEqual({ keys: ['a'.repeat(64)] })

    responder = () => ({ status: 404, body: { error: 'not found' } })
    expect(await client().deleteKey('a'.repeat(64))).toBe(false)
  })

  it('reads the monthly allowance from /user/info', async () => {
    responder = () => ({
      status: 200,
      body: {
        user_info: {
          user_id: 'graf',
          user_alias: 'Georg',
          max_budget: 5,
          budget_duration: '1mo',
          budget_reset_at: '2026-11-01T00:00:00Z',
          spend: 0.25,
        },
      },
    })

    const user = await client().getUser('graf')
    expect(user).toEqual({
      userId: 'graf',
      alias: 'Georg',
      maxBudgetUsd: 5,
      budgetDuration: '1mo',
      budgetResetAt: '2026-11-01T00:00:00Z',
      spendUsd: 0.25,
    })

    responder = () => ({ status: 404, body: { error: 'not found' } })
    expect(await client().getUser('graf')).toBeNull()
  })

  it('sets the monthly allowance with budget_duration 1mo', async () => {
    responder = () => ({
      status: 200,
      body: { user_id: 'graf', data: { user_id: 'graf', max_budget: 5, budget_duration: '1mo' } },
    })

    const user = await client().setUserBudget({ userId: 'graf', maxBudgetUsd: 5 })
    expect(user.maxBudgetUsd).toBe(5)
    expect(JSON.parse(captured?.body ?? '{}')).toEqual({
      user_id: 'graf',
      max_budget: 5,
      budget_duration: '1mo',
    })
  })
})
