#!/usr/bin/env node
/**
 * Speech-to-Text API test suite (public Issue #55).
 *
 * Runs against the *live* gateway from kik and checks the contract the clients
 * depend on — not just "it answers 200":
 *
 *   1. surface     only /v1/audio/transcriptions and /v1/models exist
 *   2. auth        401 without/with wrong key, 401 after revocation
 *   3. discovery   the STT models are advertised with mode audio_transcription
 *   4. transcription  json, verbose_json, word timestamps, text format, alias
 *   5. errors      unknown model, missing file, non-audio payload
 *   6. limits      429 from the gateway (per key) and from nginx (per IP)
 *   7. concurrency parallel clips succeed (serialised backend) without 5xx
 *   8. accounting  a spend row exists for the test request
 *
 * The suite creates its own throw-away user and keys and removes them again, so
 * it can run on production without leaving anything behind.
 *
 * Usage (on kik):
 *   node scripts/test-stt-api.mjs                 # full run
 *   node scripts/test-stt-api.mjs --quick         # skip rate-limit/concurrency
 *   STT_BASE=http://127.0.0.1:4000 node … --no-nginx   # bypass the vhost
 *
 * Exit code 0 = all checks passed.
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

// ---------------------------------------------------------------------------
// configuration
// ---------------------------------------------------------------------------

const args = new Set(process.argv.slice(2))
const QUICK = args.has('--quick')
const VIA_NGINX = !args.has('--no-nginx')
const BASE = (process.env.STT_BASE ?? 'https://whisper.kik.spengergasse.at').replace(/\/+$/, '')
const GATEWAY = (process.env.LITELLM_INTERNAL ?? 'http://127.0.0.1:4000').replace(/\/+$/, '')
const ADMIN_KEY_FILE = process.env.PROXY_ADMIN_KEY_FILE ?? '/etc/litellm/proxy_admin.key'
const MODEL = 'whisper-large-v3'
/** Compatibility alias, removed once every client was migrated (2026-10-29). */
const ALIAS = 'large-v3'
const RUN_ID = Date.now().toString(36)

// ---------------------------------------------------------------------------
// tiny harness
// ---------------------------------------------------------------------------

const results = []
let currentGroup = ''

function group(name) {
  currentGroup = name
  console.log(`\n${name}`)
}

async function check(name, fn) {
  const started = Date.now()
  try {
    const detail = await fn()
    results.push({ group: currentGroup, name, ok: true, detail: detail ?? '' })
    console.log(`  \u2705 ${name}${detail ? ` — ${detail}` : ''}`)
  } catch (error) {
    results.push({ group: currentGroup, name, ok: false, detail: error.message })
    console.log(`  \u274c ${name} — ${error.message}`)
  } finally {
    void started
  }
}

/** Waits for the nginx rate bucket to refill — the suite itself is bursty. */
async function settle(seconds, reason) {
  process.stdout.write(`  … warte ${seconds}s (${reason})\n`)
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function expectStatus(response, expected, label) {
  // Clone: the caller usually wants to parse the body afterwards.
  const body = await response.clone().text()
  assert(
    response.status === expected,
    `${label}: expected ${expected}, got ${response.status} (${body.slice(0, 160)})`,
  )
  return body
}

// ---------------------------------------------------------------------------
// fixtures
// ---------------------------------------------------------------------------

/** 16 kHz mono 16-bit PCM WAV with a tone — enough to exercise the whole path. */
function wavFile(seconds, frequency = 220) {
  const rate = 16000
  const samples = rate * seconds
  const data = Buffer.alloc(samples * 2)
  for (let i = 0; i < samples; i += 1) {
    data.writeInt16LE(Math.round(3000 * Math.sin((2 * Math.PI * frequency * i) / rate)), i * 2)
  }
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + data.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22)
  header.writeUInt32LE(rate, 24)
  header.writeUInt32LE(rate * 2, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36)
  header.writeUInt32LE(data.length, 40)
  return Buffer.concat([header, data])
}

// ---------------------------------------------------------------------------
// gateway admin helpers
// ---------------------------------------------------------------------------

function adminKey() {
  if (process.env.PROXY_ADMIN_KEY) return process.env.PROXY_ADMIN_KEY
  try {
    return execFileSync('sudo', ['-n', 'cat', ADMIN_KEY_FILE], { encoding: 'utf8' }).trim()
  } catch {
    throw new Error(
      `cannot read ${ADMIN_KEY_FILE} — run on kik, or set PROXY_ADMIN_KEY / PROXY_ADMIN_KEY_FILE`,
    )
  }
}

async function admin(pathname, body) {
  const response = await fetch(`${GATEWAY}${pathname}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${adminKey()}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`${pathname} → ${response.status} ${text.slice(0, 200)}`)
  return text === '' ? null : JSON.parse(text)
}

async function makeKey({ rpmLimit } = {}) {
  const unique = `${RUN_ID}-${Math.random().toString(36).slice(2, 8)}`
  const userId = `kik-stt-test-${unique}`
  const payload = {
    user_id: userId,
    key_alias: `kik/stt-test/${unique}`,
    ...(rpmLimit === undefined ? {} : { rpm_limit: rpmLimit }),
  }
  const created = await admin('/key/generate', payload)
  return { userId, secret: created.key, token: created.token, alias: created.key_alias }
}

async function dropKey(key) {
  if (key === null) return
  await admin('/key/delete', { keys: [key.token] }).catch(() => {})
  await admin('/user/delete', { user_ids: [key.userId] }).catch(() => {})
}

// ---------------------------------------------------------------------------
// request helpers
// ---------------------------------------------------------------------------

function form(fileBuffer, filename, fields) {
  const boundary = `----kik${RUN_ID}${Math.random().toString(16).slice(2)}`
  const parts = []
  for (const [name, value] of Object.entries(fields)) {
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
      ),
    )
  }
  parts.push(
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
        'Content-Type: audio/wav\r\n\r\n',
    ),
  )
  parts.push(fileBuffer)
  parts.push(Buffer.from(`\r\n--${boundary}--\r\n`))
  return { body: Buffer.concat(parts), contentType: `multipart/form-data; boundary=${boundary}` }
}

async function transcribe(key, { model = MODEL, fields = {}, timeoutMs = 120_000 } = {}) {
  const { body, contentType } = form(AUDIO, 'probe.wav', { model, ...fields })
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(`${BASE}/v1/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': contentType },
      body,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}

async function models(key) {
  return fetch(`${BASE}/v1/models`, { headers: { Authorization: `Bearer ${key}` } })
}

// ---------------------------------------------------------------------------
// the suite
// ---------------------------------------------------------------------------

const AUDIO = wavFile(2)
const tmp = mkdtempSync(path.join(tmpdir(), 'kik-stt-'))
let key = null

try {
  console.log(`STT API tests — base ${BASE}${VIA_NGINX ? ' (via nginx)' : ' (direct)'}`)
  key = await makeKey()

  // -- 1. surface ---------------------------------------------------------
  if (VIA_NGINX) {
    group('1. surface — only the two routes')
    for (const [pathname, method] of [
      ['/docs', 'GET'],
      ['/openapi.json', 'GET'],
      ['/health', 'GET'],
      ['/ui', 'GET'],
      ['/admin', 'GET'],
      ['/v1/chat/completions', 'POST'],
      ['/v1/embeddings', 'POST'],
    ]) {
      await check(`${method} ${pathname} → 404`, async () => {
        const response = await fetch(`${BASE}${pathname}`, {
          method,
          headers: { Authorization: `Bearer ${key.secret}`, 'Content-Type': 'application/json' },
          body: method === 'POST' ? '{}' : undefined,
        })
        await expectStatus(response, 404, pathname)
        return 'closed'
      })
    }
  }

  // -- 2. auth ------------------------------------------------------------
  group('2. auth')
  await check('no key → 401', async () => {
    const response = await fetch(`${BASE}/v1/audio/transcriptions`, { method: 'POST' })
    await expectStatus(response, 401, 'no key')
    return 'rejected'
  })

  await check('wrong key → 401', async () => {
    const response = await transcribe(`sk-not-a-real-key-${RUN_ID}`)
    await expectStatus(response, 401, 'wrong key')
    return 'rejected'
  })

  await check('master-key-shaped secret is not a client credential → 401', async () => {
    const response = await transcribe('whisper-2026')
    await expectStatus(response, 401, 'old master key')
    return 'rejected'
  })

  // -- 3. discovery -------------------------------------------------------
  group('3. discovery')
  await check('/v1/models lists the STT models', async () => {
    const response = await models(key.secret)
    await expectStatus(response, 200, '/v1/models')
    const payload = await response.json()
    const ids = payload.data.map((m) => m.id)
    assert(ids.includes(MODEL), `missing ${MODEL} in ${ids.join(', ')}`)
    assert(
      !ids.includes(ALIAS),
      `alias ${ALIAS} is back — the migration is finished, the alias must stay gone`,
    )
    const modes = payload.data.filter((m) => m.mode === 'audio_transcription').map((m) => m.id)
    assert(modes.includes(MODEL), `${MODEL} has no mode audio_transcription`)
    return ids.join(', ')
  })

  await check('exactly one discovered name contains "whisper"', async () => {
    const payload = await (await models(key.secret)).json()
    const stt = payload.data
      .map((m) => m.id)
      .filter((id) => /whisper|asr/i.test(id))
    assert(
      stt.length === 1,
      `Polished Recognition's filter would offer ${stt.length} entries: ${stt.join(', ')}`,
    )
    return stt[0]
  })

  // -- 4. transcription ---------------------------------------------------
  group('4. transcription')
  await check('json → 200 with text', async () => {
    const response = await transcribe(key.secret)
    await expectStatus(response, 200, 'json')
    const payload = await response.json()
    assert(typeof payload.text === 'string', 'no text field')
    return `text=${JSON.stringify(payload.text.slice(0, 20))}`
  })

  await check('verbose_json → duration matches the upload', async () => {
    const response = await transcribe(key.secret, { fields: { response_format: 'verbose_json' } })
    await expectStatus(response, 200, 'verbose_json')
    const payload = await response.json()
    assert(typeof payload.duration === 'number', 'no numeric duration')
    assert(
      Math.abs(payload.duration - 2) < 0.6,
      `duration ${payload.duration} does not match a 2 s upload`,
    )
    assert(typeof payload.language === 'string', 'no language')
    return `duration=${payload.duration}s language=${payload.language}`
  })

  await check('timestamp_granularities → words[] survives the proxy', async () => {
    const response = await transcribe(key.secret, {
      fields: {
        response_format: 'verbose_json',
        'timestamp_granularities[]': 'word',
      },
    })
    await expectStatus(response, 200, 'word timestamps')
    const payload = await response.json()
    assert(Array.isArray(payload.words), 'response has no words[] array')
    return 'words[] present'
  })

  // Documented deviation from the direct backend: LiteLLM parses the upstream
  // answer and always replies with JSON, including for response_format=text.
  // Both known clients use verbose_json, so this is a contract note, not a bug.
  await check('response_format=text → JSON envelope with text (gateway behaviour)', async () => {
    const response = await transcribe(key.secret, { fields: { response_format: 'text' } })
    await expectStatus(response, 200, 'text format')
    const body = await response.text()
    assert(body.trimStart().startsWith('{'), `expected the JSON envelope, got ${body.slice(0, 60)}`)
    let parsed
    try {
      parsed = JSON.parse(body)
    } catch {
      throw new Error(`body is not JSON: ${body.slice(0, 80)}`)
    }
    assert(typeof parsed.text === 'string', 'JSON envelope has no text field')
    return 'JSON {text} (not plain text)'
  })

  await check(`removed alias ${ALIAS} → 4xx`, async () => {
    const response = await transcribe(key.secret, { model: ALIAS })
    const status = response.status
    await response.text()
    assert(status >= 400 && status < 500, `expected 4xx for the removed alias, got ${status}`)
    return `HTTP ${status}`
  })

  // -- 5. errors ----------------------------------------------------------
  group('5. client errors')
  await check('unknown model → 4xx (not 200)', async () => {
    const response = await transcribe(key.secret, { model: 'does-not-exist' })
    const status = response.status
    await response.text()
    assert(status >= 400 && status < 500, `expected 4xx, got ${status}`)
    return `HTTP ${status}`
  })

  await check('missing file → 4xx', async () => {
    const response = await fetch(`${BASE}/v1/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key.secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL }),
    })
    const status = response.status
    await response.text()
    assert(status >= 400 && status < 500, `expected 4xx, got ${status}`)
    return `HTTP ${status}`
  })

  await check('non-audio payload → 4xx (not 200)', async () => {
    const { body, contentType } = form(
      Buffer.from('this is not audio'),
      'probe.wav',
      { model: MODEL },
    )
    const response = await fetch(`${BASE}/v1/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key.secret}`, 'Content-Type': contentType },
      body,
    })
    const status = response.status
    await response.text()
    assert(status >= 400, `expected an error, got ${status}`)
    return `HTTP ${status}`
  })

  // -- 6. limits ----------------------------------------------------------
  if (!QUICK) {
    group('6. limits')
    await check('revoked key → 401', async () => {
      const throwaway = await makeKey()
      try {
        const before = await transcribe(throwaway.secret)
        await expectStatus(before, 200, 'throwaway key before revocation')
        await admin('/key/delete', { keys: [throwaway.token] })
        const after = await transcribe(throwaway.secret)
        await expectStatus(after, 401, 'throwaway key after revocation')
        return 'revocation is immediate'
      } finally {
        await admin('/user/delete', { user_ids: [throwaway.userId] }).catch(() => {})
      }
    })

    await check('rpm_limit=2 → third request is 429', async () => {
      const limited = await makeKey({ rpmLimit: 2 })
      try {
        const statuses = []
        for (let i = 0; i < 3; i += 1) {
          const response = await transcribe(limited.secret)
          statuses.push(response.status)
          await response.text()
        }
        assert(
          statuses.slice(0, 2).every((s) => s === 200),
          `first two requests should pass, got ${statuses.join(',')}`,
        )
        assert(statuses[2] === 429, `third request should be 429, got ${statuses.join(',')}`)
        return statuses.join(' → ')
      } finally {
        await dropKey(limited)
      }
    })

    // -- 7. concurrency ---------------------------------------------------
    group('7. concurrency')
    await settle(20, 'nginx-Rate-Eimer füllen')
    await check('6 parallel clips → all 200, no 5xx', async () => {
      const started = Date.now()
      const responses = await Promise.all(Array.from({ length: 6 }, () => transcribe(key.secret)))
      const statuses = []
      for (const response of responses) {
        statuses.push(response.status)
        await response.text()
      }
      const wall = Date.now() - started
      assert(
        statuses.every((s) => s === 200),
        `expected all 200, got ${statuses.join(',')}`,
      )
      return `6 clips in ${wall} ms (serialised on one GPU)`
    })

    group('7b. burst (last: drains the nginx bucket)')
    if (VIA_NGINX) {
      await check('nginx burst limit answers 429 with JSON', async () => {
        const responses = await Promise.all(
          Array.from({ length: 24 }, () => transcribe(key.secret).catch((error) => error)),
        )
        const statuses = []
        let jsonBody = false
        for (const response of responses) {
          if (response instanceof Error) continue
          statuses.push(response.status)
          if (response.status === 429) {
            const body = await response.text()
            jsonBody ||= body.trimStart().startsWith('{')
          } else {
            await response.text()
          }
        }
        const limited = statuses.filter((s) => s === 429).length
        assert(limited > 0, `no 429 under a 24-request burst (${statuses.join(',')})`)
        assert(jsonBody, '429 body is not JSON — clients cannot parse it')
        assert(
          !statuses.some((s) => s >= 500),
          `burst produced a server error: ${statuses.join(',')}`,
        )
        return `${limited}/${statuses.length} throttled, JSON body`
      })
    }

    // -- 8. accounting ----------------------------------------------------
    group('8. accounting')
    await check('spend row exists and costs 0', async () => {
      const sql =
        `SELECT count(*) FILTER (WHERE spend = 0) AS zero, count(*) AS total ` +
        `FROM "LiteLLM_SpendLogs" WHERE "call_type" = 'atranscription' ` +
        `AND "startTime" > (now() AT TIME ZONE 'UTC') - interval '10 minutes'`
      let out
      try {
        out = execFileSync('sudo', ['-n', '-u', 'postgres', 'psql', '-d', 'litellm', '-tAc', sql], {
          encoding: 'utf8',
        }).trim()
      } catch {
        throw new Error('cannot read SpendLogs (run on kik with sudo) — skipped')
      }
      const [zero, total] = out.split('|').map((n) => Number.parseInt(n, 10))
      assert(total > 0, 'no atranscription spend rows in the last 10 minutes')
      assert(zero > 0, `no zero-cost row — pricing override missing? (${out})`)
      return `${zero}/${total} rows with spend 0`
    })
  }

  // -- summary ------------------------------------------------------------
  const failed = results.filter((r) => !r.ok)
  const byGroup = new Map()
  for (const result of results) {
    if (!byGroup.has(result.group)) byGroup.set(result.group, { ok: 0, failed: 0 })
    const counts = byGroup.get(result.group)
    if (result.ok) counts.ok += 1
    else counts.failed += 1
  }

  console.log('\n─── summary ───')
  for (const [name, counts] of byGroup) {
    console.log(`${counts.failed === 0 ? '✅' : '❌'} ${name}: ${counts.ok} ok, ${counts.failed} failed`)
  }
  console.log(
    `${failed.length === 0 ? '✅' : '❌'} ${results.length - failed.length}/${results.length} checks passed`,
  )
  if (failed.length > 0) {
    for (const result of failed) console.log(`   ✗ ${result.name}: ${result.detail}`)
    process.exitCode = 1
  }
} catch (error) {
  console.error(`\nfatal: ${error.message}`)
  process.exitCode = 1
} finally {
  await dropKey(key)
  rmSync(tmp, { recursive: true, force: true })
}
