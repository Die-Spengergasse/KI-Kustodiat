/**
 * Audit trail (Issue #47).
 *
 * Every authentication-relevant decision lands in `portal.audit_log` — without
 * passwords, tokens or the directory password. A failed audit write must never
 * take the login down, so callers use `recordAudit`, which logs and swallows.
 */

import type { PortalDatabase } from '../db/client'
import { auditLog } from '../db/schema'

export type AuditEvent =
  | 'login_success'
  | 'login_failure'
  | 'login_denied_role'
  | 'login_blocked'
  | 'login_error'
  | 'logout'
  | 'provisioning'
  | 'provisioning_failed'
  /** Key self-service (#48): no label content that is a secret, never a key. */
  | 'key_created'
  | 'key_rotated'
  | 'key_revoked'
  | 'budget_set'

export interface AuditEntry {
  event: AuditEvent
  sam?: string | null
  userId?: string | null
  ip?: string | null
  detail?: string | null
}

export async function writeAudit(db: PortalDatabase, entry: AuditEntry): Promise<void> {
  await db.insert(auditLog).values({
    event: entry.event,
    sam: entry.sam === undefined || entry.sam === null ? null : entry.sam.toLowerCase(),
    userId: entry.userId ?? null,
    ip: entry.ip ?? null,
    detail: entry.detail ?? null,
  })
}

/** Best-effort variant: an audit failure is reported but never blocks the request. */
export async function recordAudit(
  db: PortalDatabase,
  entry: AuditEntry,
  onError: (error: unknown) => void,
): Promise<void> {
  try {
    await writeAudit(db, entry)
  } catch (error) {
    onError(error)
  }
}
