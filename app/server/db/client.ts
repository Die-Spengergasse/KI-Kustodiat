/**
 * Database access for the portal. One lazily created pool per process — importing
 * this module never opens a connection, so the public site, `npm run build` and
 * the unit tests work without a database.
 */

import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { schema } from './schema'

export type PortalDatabase = NodePgDatabase<typeof schema>

interface Connection {
  pool: Pool
  db: PortalDatabase
}

let connection: Connection | undefined

export function getDatabase(databaseUrl: string): PortalDatabase {
  connection ??= createConnection(databaseUrl)
  return connection.db
}

export function getPool(databaseUrl: string): Pool {
  connection ??= createConnection(databaseUrl)
  return connection.pool
}

function createConnection(databaseUrl: string): Connection {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
    // A login must fail fast instead of hanging the request.
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    application_name: 'kik-portal',
  })
  return { pool, db: drizzle(pool, { schema }) }
}

/** Closes the pool; no-op when nothing was opened. Used on shutdown and in tests. */
export async function closeDatabase(): Promise<void> {
  if (connection === undefined) return
  const { pool } = connection
  connection = undefined
  await pool.end()
}
