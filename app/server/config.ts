/**
 * Portal runtime configuration (Issue #47).
 *
 * Everything secret comes from the host, never from the repository:
 * `/etc/portal/portal.env` (mode 600, root) or the process environment, and
 * secrets may additionally be *pointed at* a file (`*_FILE`) or handed over by
 * systemd via `$CREDENTIALS_DIRECTORY` (`LoadCredential=`). Reading a file only
 * when the variable is actually needed keeps `npm test`, `npm run build` and the
 * browser tests green on machines without a portal deployment (CI).
 */

import { existsSync, readFileSync } from 'node:fs'
import { ROLES, type Role } from './db/schema'

/** Where the host keeps the portal environment file (see the internal repo). */
export const DEFAULT_ENV_FILE = '/etc/portal/portal.env'

/** Defaults of the school directory — verified 2026-10-29, overridable via env. */
const DEFAULT_LDAP_URL = 'ldaps://ldap.spengergasse.at:636'
const DEFAULT_LDAP_BASE_DN =
  'OU=Automatisch gewartete Benutzer,OU=Benutzer,OU=SPG,DC=htl-wien5,DC=schule'
const DEFAULT_LDAP_BIND_DN =
  'CN=LDAP Test 01 (GRG),OU=LDAP,OU=Service-Accounts,OU=Manuell gewartete Benutzer,OU=Benutzer,OU=SPG,DC=htl-wien5,DC=schule'

/** Soft limit of active keys per user (Issue #48) — the architecture's default of 10. */
const DEFAULT_KEY_LIMIT = 10

/**
 * Monthly allowance applied to a gateway user that has none yet. Provisional
 * until #49 introduces `portal.quota_policy`; the gateway stays the enforcer.
 */
const DEFAULT_MONTHLY_BUDGET_USD = 5

/**
 * Requests per minute a key may make across all models (Issue #55).
 *
 * Deliberately generous: one key is meant to serve chat *and* dictation, and
 * agentic coding in opencode easily produces dozens of requests per minute. The
 * value bounds a runaway client (a retry loop would otherwise queue the single
 * speech-to-text GPU forever) without throttling normal work; #49 tightens it
 * per role. Speech-to-text costs no money, so this is the only fairness knob
 * for dictation — the monthly budget does not apply there.
 */
const DEFAULT_RPM_LIMIT = 120

export interface PortalRateLimitConfig {
  /** Window the failure counters are counted over, in seconds. */
  windowSeconds: number
  /** Failed logins per account inside the window before the account locks. */
  accountLimit: number
  /** Failed logins per client IP inside the window before the IP locks. */
  ipLimit: number
  /** Seconds the login handler refuses to even try after a lockout. */
  lockoutSeconds: number
}

export interface PortalLdapConfig {
  url: string
  baseDn: string
  bindDn: string
  bindPassword: string
  timeoutMs: number
}

export interface PortalLitellmConfig {
  baseUrl: string
  adminKey: string
  timeoutMs: number
}

/**
 * Key and budget policy (Issue #48). Both are per role so that students and
 * teachers can be treated differently without a schema change; #49 replaces the
 * monthly allowance with `portal.quota_policy`.
 */
export interface PortalKeysConfig {
  /** Soft limit of active keys per user and role. */
  maxActiveKeys: Record<Role, number>
  /** Monthly allowance in USD applied to the gateway user when it has none. */
  monthlyBudgetUsd: Record<Role, number>
  /** Requests per minute a key may make, across all models. */
  rpmLimit: Record<Role, number>
}

export interface PortalConfig {
  databaseUrl: string
  /** HMAC key for the session and CSRF cookies. */
  sessionSecret: string
  sessionTtlSeconds: number
  /** Session dies when it was not used for that long, independent of the TTL. */
  sessionIdleSeconds: number
  /** `Secure` on the cookies; only relaxable outside production. */
  cookieSecure: boolean
  /** Read `X-Forwarded-For` (nginx terminates TLS in front of the app). */
  trustProxy: boolean
  /** Optional AD group (CN) that maps to the `admin` role. */
  adminGroup: string | null
  rateLimit: PortalRateLimitConfig
  ldap: PortalLdapConfig
  litellm: PortalLitellmConfig
  keys: PortalKeysConfig
}

export type PortalConfigResult =
  { ok: true; config: PortalConfig } | { ok: false; missing: string[] }

interface SecretSpec {
  /** Variable holding the secret itself. */
  valueEnv: string
  /** Variable holding a path to a file with the secret. */
  fileEnv: string
  /** Credential name systemd hands over in `$CREDENTIALS_DIRECTORY`. */
  credential: string
}

const SESSION_SECRET: SecretSpec = {
  valueEnv: 'PORTAL_SESSION_SECRET',
  fileEnv: 'PORTAL_SESSION_SECRET_FILE',
  credential: 'portal_session_secret',
}

const LDAP_BIND_PASSWORD: SecretSpec = {
  valueEnv: 'PORTAL_LDAP_BIND_PASSWORD',
  fileEnv: 'PORTAL_LDAP_BIND_PASSWORD_FILE',
  credential: 'ldap_app_password',
}

const LITELLM_ADMIN_KEY: SecretSpec = {
  valueEnv: 'PORTAL_LITELLM_ADMIN_KEY',
  fileEnv: 'PORTAL_LITELLM_ADMIN_KEY_FILE',
  credential: 'litellm_admin_key',
}

const loadedEnvFiles = new Set<string>()

/**
 * Parses a dotenv-style file. Deliberately minimal (no dependency): `KEY=VALUE`
 * per line, `#` comments, blank lines, an optional single pair of quotes.
 */
export function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (line === '' || line.startsWith('#')) continue
    const separator = line.indexOf('=')
    if (separator <= 0) continue
    const key = line.slice(0, separator).trim()
    let value = line.slice(separator + 1).trim()
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1)
    }
    result[key] = value
  }
  return result
}

/**
 * Loads `$PORTAL_ENV_FILE` (default `/etc/portal/portal.env`) into `process.env`
 * **without overriding** variables that are already set — systemd, the shell and
 * the test runner always win. A missing *or unreadable* file is not an error: an
 * unprivileged dev run simply has no portal configuration and `/api/auth/*`
 * answers 503.
 */
export function loadEnvFile(file: string = process.env.PORTAL_ENV_FILE ?? DEFAULT_ENV_FILE): void {
  if (loadedEnvFiles.has(file)) return
  loadedEnvFiles.add(file)
  if (!existsSync(file)) return
  let content: string
  try {
    content = readFileSync(file, 'utf8')
  } catch {
    return
  }
  for (const [key, value] of Object.entries(parseEnvFile(content))) {
    if (process.env[key] === undefined || process.env[key] === '') {
      process.env[key] = value
    }
  }
}

/** Test hook: forget which env files were read (does not unset variables). */
export function resetEnvFileCache(): void {
  loadedEnvFiles.clear()
}

function readSecretFile(path: string): string | undefined {
  if (!existsSync(path)) return undefined
  const value = readFileSync(path, 'utf8').trim()
  return value === '' ? undefined : value
}

/**
 * Resolves a secret in the order file → systemd credential → literal variable.
 * A file wins because a path in the environment is less leaky than the value.
 */
export function readSecret(spec: SecretSpec): string | undefined {
  const filePath = process.env[spec.fileEnv]
  if (filePath !== undefined && filePath !== '') {
    const fromFile = readSecretFile(filePath)
    if (fromFile !== undefined) return fromFile
  }
  const credentialsDirectory = process.env.CREDENTIALS_DIRECTORY
  if (credentialsDirectory !== undefined && credentialsDirectory !== '') {
    const fromCredential = readSecretFile(`${credentialsDirectory}/${spec.credential}`)
    if (fromCredential !== undefined) return fromCredential
  }
  const value = process.env[spec.valueEnv]
  return value === undefined || value === '' ? undefined : value
}

function stringEnv(name: string, fallback: string): string {
  const value = process.env[name]
  return value === undefined || value === '' ? fallback : value
}

function intEnv(name: string, fallback: number, minimum: number, maximum: number): number {
  const raw = process.env[name]
  if (raw === undefined || raw === '') return fallback
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(maximum, Math.max(minimum, parsed))
}

function boolEnv(name: string, fallback: boolean): boolean {
  const raw = process.env[name]?.toLowerCase()
  if (raw === 'true' || raw === '1' || raw === 'yes') return true
  if (raw === 'false' || raw === '0' || raw === 'no') return false
  return fallback
}

/** Non-negative money amount (USD). Rounded to cents, invalid input → fallback. */
function moneyEnv(name: string, fallback: number, maximum: number): number {
  const raw = process.env[name]
  if (raw === undefined || raw === '') return fallback
  const parsed = Number.parseFloat(raw)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return Math.min(maximum, Math.round(parsed * 100) / 100)
}

/** `PORTAL_KEY_LIMIT_<ROLE>` / `PORTAL_MONTHLY_BUDGET_USD_<ROLE>` with a shared default. */
function perRole(
  baseName: string,
  fallbackName: string,
  fallback: number,
  parse: (name: string, fallback: number) => number,
): Record<Role, number> {
  const shared = parse(fallbackName, fallback)
  const result = {} as Record<Role, number>
  for (const role of ROLES) {
    result[role] = parse(`${baseName}_${role.toUpperCase()}`, shared)
  }
  return result
}

/** Cookie `Secure` flag: on in production, off elsewhere unless forced. */
export function resolveCookieSecure(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = env.PORTAL_COOKIE_SECURE?.toLowerCase()
  if (raw === 'true' || raw === 'false') return raw === 'true'
  return env.NODE_ENV === 'production'
}

/** The only variable a migration needs; keeps `db:migrate` usable without LDAP. */
export function loadDatabaseUrl(): string | null {
  loadEnvFile()
  const url = process.env.PORTAL_DATABASE_URL
  return url === undefined || url === '' ? null : url
}

/**
 * Reads the configuration. Returns `{ ok: false, missing }` instead of throwing
 * when the deployment is incomplete, so the site keeps working and the API can
 * answer `503` with a precise message.
 */
export function loadPortalConfig(): PortalConfigResult {
  loadEnvFile()

  const databaseUrl = loadDatabaseUrl()
  const sessionSecret = readSecret(SESSION_SECRET)
  const ldapBindPassword = readSecret(LDAP_BIND_PASSWORD)

  const missing: string[] = []
  if (databaseUrl === null) missing.push('PORTAL_DATABASE_URL')
  if (sessionSecret === undefined) missing.push('PORTAL_SESSION_SECRET')
  if (ldapBindPassword === undefined) missing.push('PORTAL_LDAP_BIND_PASSWORD')

  if (
    missing.length > 0 ||
    databaseUrl === null ||
    sessionSecret === undefined ||
    ldapBindPassword === undefined
  ) {
    return { ok: false, missing }
  }

  const adminGroup = stringEnv('PORTAL_ADMIN_GROUP', '')

  return {
    ok: true,
    config: {
      databaseUrl,
      sessionSecret,
      sessionTtlSeconds: intEnv('PORTAL_SESSION_TTL_SECONDS', 8 * 60 * 60, 60, 30 * 24 * 60 * 60),
      sessionIdleSeconds: intEnv('PORTAL_SESSION_IDLE_SECONDS', 60 * 60, 60, 7 * 24 * 60 * 60),
      cookieSecure: resolveCookieSecure(),
      trustProxy: boolEnv('PORTAL_TRUST_PROXY', true),
      adminGroup: adminGroup === '' ? null : adminGroup,
      rateLimit: {
        windowSeconds: intEnv('PORTAL_LOGIN_WINDOW_SECONDS', 15 * 60, 1, 24 * 60 * 60),
        accountLimit: intEnv('PORTAL_LOGIN_ACCOUNT_LIMIT', 5, 1, 1000),
        ipLimit: intEnv('PORTAL_LOGIN_IP_LIMIT', 20, 1, 10_000),
        lockoutSeconds: intEnv('PORTAL_LOGIN_LOCKOUT_SECONDS', 15 * 60, 1, 24 * 60 * 60),
      },
      ldap: {
        url: stringEnv('PORTAL_LDAP_URL', DEFAULT_LDAP_URL),
        baseDn: stringEnv('PORTAL_LDAP_BASE_DN', DEFAULT_LDAP_BASE_DN),
        bindDn: stringEnv('PORTAL_LDAP_BIND_DN', DEFAULT_LDAP_BIND_DN),
        bindPassword: ldapBindPassword,
        timeoutMs: intEnv('PORTAL_LDAP_TIMEOUT_MS', 10_000, 500, 120_000),
      },
      litellm: {
        baseUrl: stringEnv('PORTAL_LITELLM_URL', 'http://127.0.0.1:4000').replace(/\/+$/, ''),
        adminKey: readSecret(LITELLM_ADMIN_KEY) ?? '',
        timeoutMs: intEnv('PORTAL_LITELLM_TIMEOUT_MS', 10_000, 500, 120_000),
      },
      keys: {
        maxActiveKeys: perRole(
          'PORTAL_KEY_LIMIT',
          'PORTAL_KEY_LIMIT_DEFAULT',
          DEFAULT_KEY_LIMIT,
          (name, fallback) => intEnv(name, fallback, 1, 1000),
        ),
        monthlyBudgetUsd: perRole(
          'PORTAL_MONTHLY_BUDGET_USD',
          'PORTAL_MONTHLY_BUDGET_USD_DEFAULT',
          DEFAULT_MONTHLY_BUDGET_USD,
          (name, fallback) => moneyEnv(name, fallback, 100_000),
        ),
        rpmLimit: perRole('PORTAL_RPM_LIMIT', 'PORTAL_RPM_LIMIT_DEFAULT', DEFAULT_RPM_LIMIT, (name, fallback) =>
          intEnv(name, fallback, 1, 100_000),
        ),
      },
    },
  }
}
