/**
 * Drizzle schema of the portal (Issue #47).
 *
 * The portal owns the PostgreSQL schema `portal` in the `litellm` database: it
 * never writes into `public` (that is LiteLLM's Prisma schema) and later reads
 * spend data only through read-only views in a `litellm` schema. The dedicated
 * `portal` database role owns exactly this schema.
 */

import { sql } from 'drizzle-orm'
import {
  bigserial,
  boolean,
  check,
  index,
  inet,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

export const portalSchema = pgSchema('portal')

/**
 * Roles a portal user can have. `student`/`teacher`/`staff` are derived from the
 * LDAP DN (see `server/auth/roles.ts`), `admin` is a database role only — the
 * directory has no admin group for the portal.
 */
export const ROLES = ['student', 'teacher', 'staff', 'admin'] as const
export type Role = (typeof ROLES)[number]

export const users = portalSchema.table(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** `sAMAccountName`, always stored lower-case — the login identifier. */
    sam: text('sam').notNull(),
    displayName: text('display_name').notNull(),
    mail: text('mail'),
    /** Full DN of the directory entry this account was derived from. */
    ldapDn: text('ldap_dn').notNull(),
    role: text('role').$type<Role>().notNull(),
    /** LiteLLM `user_id` of the auto-provisioned user (equals `sam`). */
    litellmUserId: text('litellm_user_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('users_sam_key').on(table.sam),
    check('users_role_check', sql`${table.role} in ('student', 'teacher', 'staff', 'admin')`),
  ],
)

export const sessions = portalSchema.table(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** SHA-256 of the cookie token; the raw token is never stored. */
    tokenHash: text('token_hash').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ip: inet('ip'),
    userAgent: text('user_agent'),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('sessions_token_hash_key').on(table.tokenHash),
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_expires_at_idx').on(table.expiresAt),
  ],
)

/** Append-only trail. Never contains passwords or tokens — only what happened. */
export const auditLog = portalSchema.table(
  'audit_log',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    /** `login_success`, `login_failure`, `logout`, `provisioning`, … */
    event: text('event').notNull(),
    /** Login identifier when known (unknown user → the attempted one). */
    sam: text('sam'),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    ip: inet('ip'),
    /** Human-readable context; must never carry a secret. */
    detail: text('detail'),
  },
  (table) => [
    index('audit_log_created_at_idx').on(table.createdAt),
    index('audit_log_sam_idx').on(table.sam),
  ],
)

/**
 * Portal-side extras of a gateway key (Issue #48).
 *
 * LiteLLM is the owner of keys: `token_hash` is LiteLLM's `token` field — the
 * SHA-256 of the key, *not* the secret, which is never stored anywhere. LiteLLM
 * deletes the key row on revocation, so this table keeps the label, the origin
 * and the revocation trail for the portal's key list.
 */
export const keyMeta = portalSchema.table(
  'key_meta',
  {
    /** LiteLLM `token` (hashed key id); primary key, never the secret. */
    tokenHash: text('token_hash').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** Label the user gave the key; LiteLLM carries the same value as `key_alias`. */
    label: text('label'),
    /** How the key came into existence: `portal` for self-service, later `admin`. */
    createdVia: text('created_via').notNull().default('portal'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    /** `user`, `rotated`, `limit`, … — free text, no secrets. */
    revokeReason: text('revoke_reason'),
  },
  (table) => [index('key_meta_user_id_idx').on(table.userId)],
)

/**
 * Login attempts — the source of the per-IP and per-account rate limit. Kept
 * separate from `audit_log` because it is queried on every login and pruned.
 */
export const loginAttempts = portalSchema.table(
  'login_attempts',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    ip: inet('ip').notNull(),
    sam: text('sam').notNull(),
    success: boolean('success').notNull(),
    reason: text('reason'),
  },
  (table) => [
    index('login_attempts_created_at_idx').on(table.createdAt),
    index('login_attempts_sam_idx').on(table.sam),
    index('login_attempts_ip_idx').on(table.ip),
  ],
)

export const schema = { users, sessions, auditLog, loginAttempts, keyMeta }
