/**
 * CSRF protection (Issue #47).
 *
 * Double-submit token: the token lives in a readable (`httpOnly: false`) cookie
 * signed with the session secret, and every state-changing request must repeat it
 * in the `x-csrf-token` header. A cross-site form can send the cookie but cannot
 * set the header; a cross-site script cannot read the cookie. Because the token
 * also covers the pre-login request, the login form is protected too.
 */

import type { PortalConfig } from '../config'
import { CSRF_COOKIE, CSRF_HEADER, CSRF_PURPOSE, serializeCookie } from './sessions'
import { randomToken, safeEqual, signValue, verifySignedValue } from './tokens'

export { CSRF_COOKIE, CSRF_HEADER }

export interface IssuedCsrf {
  /** The value the browser must echo in `x-csrf-token`. */
  token: string
  /** Value for the `kik_csrf` cookie. */
  cookieValue: string
  /** Ready-to-use `Set-Cookie` header value. */
  setCookie: string
}

export function issueCsrf(config: PortalConfig): IssuedCsrf {
  const token = randomToken(32)
  const cookieValue = signValue(config.sessionSecret, CSRF_PURPOSE, token)
  return {
    token,
    cookieValue,
    setCookie: serializeCookie(CSRF_COOKIE, cookieValue, {
      secure: config.cookieSecure,
      httpOnly: false,
      // Long enough to fill out a login form, short enough not to linger.
      maxAgeSeconds: 2 * 60 * 60,
      sameSite: 'Lax',
    }),
  }
}

/** Reads the CSRF cookie value from a raw `Cookie` header. */
export function readCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (cookieHeader === undefined || cookieHeader === '') return undefined
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=')
    if (separator === -1) continue
    if (part.slice(0, separator).trim() !== name) continue
    return part.slice(separator + 1).trim()
  }
  return undefined
}

/**
 * Validates a state-changing request: the header must repeat the token that the
 * signed cookie carries. Returns `false` for anything missing or mismatched.
 */
export function verifyCsrf(
  config: PortalConfig,
  cookieHeader: string | undefined,
  headerToken: string | undefined,
): boolean {
  if (headerToken === undefined || headerToken === '') return false
  const cookieValue = readCookie(cookieHeader, CSRF_COOKIE)
  const token = verifySignedValue(config.sessionSecret, CSRF_PURPOSE, cookieValue)
  if (token === null) return false
  return safeEqual(token, headerToken)
}
