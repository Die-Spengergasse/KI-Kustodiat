/**
 * Persistence of the portal-side key extras (`portal.key_meta`, Issue #48).
 *
 * LiteLLM owns keys; this store only keeps what the gateway forgets when a key
 * row is deleted: the label, the origin and the revocation trail. The secret is
 * never part of this table — `tokenHash` is LiteLLM's `token` (a SHA-256).
 *
 * Behind an interface so the key service is unit-testable without PostgreSQL.
 */

import { and, desc, eq } from 'drizzle-orm'
import type { PortalDatabase } from '../db/client'
import { keyMeta } from '../db/schema'

export interface KeyMetaRecord {
  tokenHash: string
  userId: string
  label: string | null
  createdVia: string
  createdAt: Date
  revokedAt: Date | null
  revokeReason: string | null
}

export interface KeyMetaStore {
  insert(input: { tokenHash: string; userId: string; label: string | null }): Promise<void>
  /** Marks the key revoked; only the owning user's row can be touched. */
  markRevoked(input: { tokenHash: string; userId: string; reason: string }): Promise<boolean>
  listByUser(userId: string): Promise<KeyMetaRecord[]>
}

export function createKeyMetaStore(db: PortalDatabase): KeyMetaStore {
  return {
    async insert(input) {
      await db
        .insert(keyMeta)
        .values({
          tokenHash: input.tokenHash,
          userId: input.userId,
          label: input.label,
          createdVia: 'portal',
        })
        .onConflictDoUpdate({
          target: keyMeta.tokenHash,
          set: { userId: input.userId, label: input.label },
        })
    },

    async markRevoked(input) {
      const rows = await db
        .update(keyMeta)
        .set({ revokedAt: new Date(), revokeReason: input.reason })
        .where(and(eq(keyMeta.tokenHash, input.tokenHash), eq(keyMeta.userId, input.userId)))
        .returning({ tokenHash: keyMeta.tokenHash })
      return rows.length > 0
    },

    async listByUser(userId) {
      const rows = await db
        .select()
        .from(keyMeta)
        .where(eq(keyMeta.userId, userId))
        .orderBy(desc(keyMeta.createdAt))
      return rows
    },
  }
}
