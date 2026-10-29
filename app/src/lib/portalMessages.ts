/**
 * German wording of the Tokenverwaltung's auth states (Issue #47).
 *
 * Pure functions, unit-tested: the page must stay readable and the wording must
 * not drift between the login form, the lockout notice and the role badge.
 */

import type { PortalRole } from './portalApi'

const ROLE_LABELS: Record<PortalRole, string> = {
  student: 'Schüler:in',
  teacher: 'Lehrkraft',
  staff: 'Verwaltung',
  admin: 'Administrator:in',
}

export function roleLabel(role: PortalRole): string {
  return ROLE_LABELS[role] ?? role
}

export interface LoginFailureInput {
  status: number
  error?: string
  message?: string
  retryAfterSeconds?: number
}

/** One sentence for the login form's error slot — never leaks whether a user exists. */
export function loginFailureMessage(input: LoginFailureInput): string {
  if (input.status === 429) {
    const seconds = input.retryAfterSeconds ?? 0
    const minutes = Math.max(1, Math.ceil(seconds / 60))
    return `Zu viele Fehlversuche. Neuer Versuch in etwa ${minutes} Minute${minutes === 1 ? '' : 'n'}.`
  }
  if (input.status === 401) {
    return 'Benutzername oder Passwort ist falsch.'
  }
  if (input.status === 403 && input.error === 'no_access') {
    return input.message ?? 'Für dieses Konto ist kein Zugang zur Tokenverwaltung vorgesehen.'
  }
  if (input.status === 403) {
    return 'Die Anfrage konnte nicht geprüft werden. Bitte die Seite neu laden.'
  }
  if (input.status === 502) {
    return 'Das Schulverzeichnis ist gerade nicht erreichbar. Bitte später erneut versuchen.'
  }
  if (input.status === 503) {
    return 'Die Tokenverwaltung ist noch nicht fertig eingerichtet.'
  }
  return 'Anmeldung fehlgeschlagen. Bitte später erneut versuchen.'
}
