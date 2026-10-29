/**
 * `npm run db:migrate` — applies pending migrations and prints the journal head.
 *
 * Reads the configuration like the server does: `/etc/portal/portal.env`
 * (override with `PORTAL_ENV_FILE`) or the process environment.
 */

import { migrateAndClose } from '../server/db/migrate'

try {
  const { appliedUntil } = await migrateAndClose()
  console.log(`portal migrations applied (journal head: ${appliedUntil})`)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
