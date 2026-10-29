/**
 * `npm run db:seed` — ensures the portal admin exists.
 *
 * Admin is a database role: the school directory has no group for it (see
 * Issue #47 and the internal host documentation). `portal.users.role` is the
 * source; a later LDAP login refreshes name/mail/DN but never demotes an admin.
 */

import { loadPortalConfig } from '../server/config'
import { closeDatabase, getDatabase } from '../server/db/client'
import { users } from '../server/db/schema'

const ADMIN_SAM = (process.env.PORTAL_ADMIN_SAM ?? 'grafg').toLowerCase()

const result = loadPortalConfig()
if (!result.ok) {
  console.error(`Portal configuration incomplete: ${result.missing.join(', ')}`)
  process.exit(1)
}

const db = getDatabase(result.config.databaseUrl)
try {
  const rows = await db
    .insert(users)
    .values({
      sam: ADMIN_SAM,
      displayName: process.env.PORTAL_ADMIN_NAME ?? 'Georg Graf',
      mail: process.env.PORTAL_ADMIN_MAIL ?? null,
      ldapDn: process.env.PORTAL_ADMIN_DN ?? '(seed)',
      role: 'admin',
    })
    .onConflictDoUpdate({
      target: users.sam,
      set: { role: 'admin', updatedAt: new Date() },
    })
    .returning({ sam: users.sam, role: users.role })
  console.log(`portal admin ensured: ${rows[0]?.sam} (${rows[0]?.role})`)
} finally {
  await closeDatabase()
}
