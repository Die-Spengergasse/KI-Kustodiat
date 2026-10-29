/**
 * LDAP authentication against the school directory (Issue #47).
 *
 * Search-then-bind, exactly like Open WebUI does it (Issue #22): the service
 * account finds the user, then the *user* binds with their own password — the
 * portal never sees a password hash and never reuses the service account for the
 * password check.
 *
 * Two deliberate security details:
 *  - an empty password is rejected before the bind, because LDAP treats it as an
 *    "unauthenticated bind" that many servers accept as success,
 *  - the login name is escaped per RFC 4515 before it is put into the filter.
 */

import { Client, InvalidCredentialsError } from 'ldapts'
import type { PortalLdapConfig } from '../config'

export interface DirectoryUser {
  dn: string
  sam: string
  displayName: string
  mail: string | null
  groups: string[]
}

export type DirectoryLookup =
  | { status: 'ok'; user: DirectoryUser }
  /** No entry with that `sAMAccountName` below the search base. */
  | { status: 'unknown_user' }
  /** Entry found, password rejected (LDAP result code 49). */
  | { status: 'invalid_credentials' }
  /** Directory unreachable / service bind failed / unexpected result. */
  | { status: 'directory_error'; message: string }

const LDAP_INVALID_CREDENTIALS = 49

/** RFC 4515 escaping of a value that goes into a search filter. */
export function escapeFilterValue(value: string): string {
  return value.replace(/[\\*()\0]/g, (character) => {
    switch (character) {
      case '\\':
        return '\\5c'
      case '*':
        return '\\2a'
      case '(':
        return '\\28'
      case ')':
        return '\\29'
      default:
        return '\\00'
    }
  })
}

/** Attribute lookup that ignores the server's attribute-name casing. */
function attribute(entry: Record<string, unknown>, name: string): unknown {
  const wanted = name.toLowerCase()
  for (const [key, value] of Object.entries(entry)) {
    if (key.toLowerCase() === wanted) return value
  }
  return undefined
}

function firstString(entry: Record<string, unknown>, name: string): string | null {
  const value = attribute(entry, name)
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return null
}

function allStrings(entry: Record<string, unknown>, name: string): string[] {
  const value = attribute(entry, name)
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')
  return []
}

function createClient(config: PortalLdapConfig): Client {
  return new Client({
    url: config.url,
    timeout: config.timeoutMs,
    connectTimeout: config.timeoutMs,
    // Certificate validation stays on: the directory presents a certificate the
    // host trusts (verified 2026-10-29). `ciphers: ALL` mirrors Open WebUI's
    // setting so AD's cipher list is not narrowed by Node's defaults.
    tlsOptions: { rejectUnauthorized: true, minVersion: 'TLSv1.2', ciphers: 'ALL' },
  })
}

async function dispose(client: Client): Promise<void> {
  try {
    await client.unbind()
  } catch {
    // A failed bind leaves nothing to unbind; the connection is closed anyway.
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

function isInvalidCredentials(error: unknown): boolean {
  return (
    error instanceof InvalidCredentialsError ||
    (typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === LDAP_INVALID_CREDENTIALS)
  )
}

/**
 * Finds an entry by `sAMAccountName` using the service account. Exported for the
 * integration test that proves the search path independently of a password.
 */
export async function findDirectoryUser(
  config: PortalLdapConfig,
  sam: string,
): Promise<DirectoryUser | null> {
  const client = createClient(config)
  try {
    await client.bind(config.bindDn, config.bindPassword)
    const { searchEntries } = await client.search(config.baseDn, {
      scope: 'sub',
      filter: `(&(objectClass=user)(sAMAccountName=${escapeFilterValue(sam)}))`,
      attributes: ['sAMAccountName', 'displayName', 'mail', 'memberOf'],
      sizeLimit: 2,
    })
    const entry = searchEntries[0]
    if (entry === undefined) return null
    const record = entry as unknown as Record<string, unknown>
    return {
      dn: entry.dn,
      sam: firstString(record, 'sAMAccountName') ?? sam,
      displayName: firstString(record, 'displayName') ?? sam,
      mail: firstString(record, 'mail'),
      groups: allStrings(record, 'memberOf'),
    }
  } finally {
    await dispose(client)
  }
}

/** Binds as the entry itself — this call is the password check. */
export async function verifyDirectoryPassword(
  config: PortalLdapConfig,
  dn: string,
  password: string,
): Promise<boolean> {
  if (password === '') return false
  const client = createClient(config)
  try {
    await client.bind(dn, password)
    return true
  } catch (error) {
    if (isInvalidCredentials(error)) return false
    throw error
  } finally {
    await dispose(client)
  }
}

/** Full login path: look the account up, then prove the password by binding as it. */
export async function authenticateAgainstDirectory(
  config: PortalLdapConfig,
  sam: string,
  password: string,
): Promise<DirectoryLookup> {
  // Guard first: an empty password would be an unauthenticated (successful) bind.
  if (sam.trim() === '' || password === '') return { status: 'invalid_credentials' }

  let user: DirectoryUser | null
  try {
    user = await findDirectoryUser(config, sam.trim())
  } catch (error) {
    return { status: 'directory_error', message: errorMessage(error) }
  }
  if (user === null) return { status: 'unknown_user' }

  try {
    const valid = await verifyDirectoryPassword(config, user.dn, password)
    return valid ? { status: 'ok', user } : { status: 'invalid_credentials' }
  } catch (error) {
    return { status: 'directory_error', message: errorMessage(error) }
  }
}
