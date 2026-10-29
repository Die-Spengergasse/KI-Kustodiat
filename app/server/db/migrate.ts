/**
 * Applies the Drizzle migrations to the portal schema (Issue #47).
 *
 * The migration journal lives in `portal.__migrations`, so the portal role needs
 * no rights outside its own schema. Running the migrator twice is a no-op, which
 * is exactly what the deployment (and the verification) relies on.
 *
 * Only `PORTAL_DATABASE_URL` is required — a migration must also run on a host
 * whose LDAP/service credentials are not set up yet.
 */

import path from 'node:path'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { loadDatabaseUrl } from '../config'
import { closeDatabase, getDatabase } from './client'

/** `server/db/` → repository folder `app/drizzle/`. */
export const MIGRATIONS_FOLDER = path.resolve(import.meta.dirname, '../../drizzle')
export const MIGRATIONS_SCHEMA = 'portal'
export const MIGRATIONS_TABLE = '__migrations'

export async function runMigrations(): Promise<{ appliedUntil: number }> {
  const databaseUrl = loadDatabaseUrl()
  if (databaseUrl === null) {
    throw new Error('PORTAL_DATABASE_URL is not configured')
  }

  const db = getDatabase(databaseUrl)
  await db.execute('create schema if not exists "portal"')
  await migrate(db, {
    migrationsFolder: MIGRATIONS_FOLDER,
    migrationsSchema: MIGRATIONS_SCHEMA,
    migrationsTable: MIGRATIONS_TABLE,
  })

  const journal = await db.execute<{ created_at: string }>(
    'select created_at from portal.__migrations order by created_at desc limit 1',
  )
  const last = Number(journal.rows[0]?.created_at ?? 0)
  return { appliedUntil: last }
}

export async function migrateAndClose(): Promise<{ appliedUntil: number }> {
  try {
    return await runMigrations()
  } finally {
    await closeDatabase()
  }
}
