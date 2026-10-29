/**
 * Portal user records (Issue #47).
 *
 * An account is created/refreshed on every successful directory login. The only
 * field the directory must not own is `admin`: it is a database role, so an
 * existing admin keeps it even though the DN maps to `teacher`/`staff`.
 */

import { eq, sql } from 'drizzle-orm'
import type { PortalDatabase } from '../db/client'
import { users, type Role } from '../db/schema'

export type UserRow = typeof users.$inferSelect

export interface DirectoryAccount {
  sam: string
  displayName: string
  mail: string | null
  ldapDn: string
  role: Role
}

/** Case-insensitive lookup; `sam` is stored lower-case. */
export async function findUserBySam(db: PortalDatabase, sam: string): Promise<UserRow | undefined> {
  const rows = await db.select().from(users).where(eq(users.sam, sam.toLowerCase())).limit(1)
  return rows[0]
}

/**
 * Inserts the account or refreshes it from the directory. `admin` survives a
 * login whose DN only justifies `teacher`/`student`/`staff`.
 */
export async function upsertDirectoryUser(
  db: PortalDatabase,
  account: DirectoryAccount,
): Promise<UserRow> {
  const now = new Date()
  const rows = await db
    .insert(users)
    .values({
      sam: account.sam.toLowerCase(),
      displayName: account.displayName,
      mail: account.mail,
      ldapDn: account.ldapDn,
      role: account.role,
      updatedAt: now,
      lastLoginAt: now,
    })
    .onConflictDoUpdate({
      target: users.sam,
      set: {
        displayName: account.displayName,
        mail: account.mail,
        ldapDn: account.ldapDn,
        role: sql`case when ${users.role} = 'admin' then 'admin' else ${account.role} end`,
        updatedAt: now,
        lastLoginAt: now,
      },
    })
    .returning()
  const row = rows[0]
  if (row === undefined) throw new Error('Upsert of portal user returned no row')
  return row
}

export async function setLitellmUserId(
  db: PortalDatabase,
  userId: string,
  litellmUserId: string,
): Promise<void> {
  await db.update(users).set({ litellmUserId, updatedAt: new Date() }).where(eq(users.id, userId))
}

/** Public shape sent to the browser — never the DN, never internal ids. */
export interface SessionUser {
  sam: string
  displayName: string
  mail: string | null
  role: Role
}

export function toSessionUser(user: UserRow): SessionUser {
  return {
    sam: user.sam,
    displayName: user.displayName,
    mail: user.mail,
    role: user.role,
  }
}
