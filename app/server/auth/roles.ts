/**
 * Role derivation from the school directory (Issue #47).
 *
 * The directory is the only truth for membership: there is no portal-side list
 * of people. Users are stored under `OU=Automatisch gewartete Benutzer` and are
 * sorted into role OUs *below* that base — students additionally by department
 * (`OU=HIF`), so the role part is matched anywhere in the DN, not at a fixed
 * position.
 *
 * DNs observed on 2026-10-29 against `ldap.spengergasse.at` (documented in
 * `KI-Kustodiat-intern`: `infra/hosts/kik.md`):
 *
 *   teacher  CN=pranz,OU=Lehrer,OU=Automatisch gewartete Benutzer,OU=Benutzer,OU=SPG,DC=htl-wien5,DC=schule
 *   teacher  CN=grafg,OU=Lehrer,OU=Automatisch gewartete Benutzer,OU=Benutzer,OU=SPG,DC=htl-wien5,DC=schule
 *   student  CN=GEO220154,OU=HIF,OU=Schueler,OU=Automatisch gewartete Benutzer,OU=Benutzer,OU=SPG,DC=htl-wien5,DC=schule
 *
 * Any other OU (service accounts, functional accounts, unknown departments)
 * yields `null` = no portal access.
 */

import type { Role } from '../db/schema'

interface RoleRule {
  /** OU marker as it appears inside the DN, matched case-insensitively. */
  marker: string
  role: Role
}

/**
 * Order matters only for readability — the markers are mutually exclusive.
 * `admin` is intentionally absent: the directory has no admin group, admin is a
 * database role (plus the optional `PORTAL_ADMIN_GROUP` env mapping).
 */
export const DIRECTORY_ROLE_RULES: readonly RoleRule[] = [
  { marker: ',OU=Lehrer,', role: 'teacher' },
  { marker: ',OU=Schueler,', role: 'student' },
  { marker: ',OU=Verwaltung,', role: 'staff' },
]

/** Role derived from a directory DN, or `null` when the DN is not a portal account. */
export function roleFromDn(dn: string | null | undefined): Role | null {
  if (dn === null || dn === undefined || dn.trim() === '') return null
  // AD DNs compare case-insensitively; `OU=schueler` and `OU=Schueler` are the same OU.
  const normalized = `,${dn}`.toLowerCase()
  for (const rule of DIRECTORY_ROLE_RULES) {
    if (normalized.includes(rule.marker.toLowerCase())) return rule.role
  }
  return null
}

/** First RDN of a DN, lower-case (`CN=nvs,OU=…` → `cn=nvs`), for group matching. */
export function firstRdn(dn: string): string {
  const comma = dn.indexOf(',')
  return (comma === -1 ? dn : dn.slice(0, comma)).trim().toLowerCase()
}

/** True when `groupDn` is the group named `name` (CN comparison, case-insensitive). */
export function isGroupDn(groupDn: string, name: string): boolean {
  return firstRdn(groupDn) === `cn=${name.trim().toLowerCase()}`
}

/**
 * Applies the optional admin-group mapping on top of the DN-derived role.
 * `PORTAL_ADMIN_GROUP` is a fallback for the future, not the primary source.
 */
export function applyAdminGroup(
  role: Role,
  groups: readonly string[],
  adminGroup: string | null,
): Role {
  if (adminGroup === null || adminGroup.trim() === '') return role
  return groups.some((group) => isGroupDn(group, adminGroup)) ? 'admin' : role
}
