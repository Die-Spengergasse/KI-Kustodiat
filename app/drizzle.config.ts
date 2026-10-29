import { defineConfig } from 'drizzle-kit'

/**
 * drizzle-kit configuration for the portal schema (`portal.*` in the `litellm`
 * database). `generate` works offline; `push`/`studio` need `PORTAL_DATABASE_URL`
 * — normally supplied by `/etc/portal/portal.env` (see `server/config.ts`).
 *
 * Migrations are applied with `npm run db:migrate` (scripts/db-migrate.ts), not
 * with `drizzle-kit migrate`, so the deployment path is the same code the tests use.
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './server/db/schema.ts',
  out: './drizzle',
  schemaFilter: ['portal'],
  dbCredentials: {
    url: process.env.PORTAL_DATABASE_URL ?? '',
  },
  verbose: true,
  strict: true,
})
