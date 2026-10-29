import { describe, expect, it } from 'vitest'
import { applyAdminGroup, firstRdn, isGroupDn, roleFromDn } from './roles'

/**
 * DNs copied verbatim from the school directory on 2026-10-29 (service-account
 * search, see `KI-Kustodiat-intern:infra/hosts/kik.md`). They are the contract of
 * the role rule: if the directory ever reorganises, this test fails first.
 */
const TEACHER_DNS = [
  'CN=pranz,OU=Lehrer,OU=Automatisch gewartete Benutzer,OU=Benutzer,OU=SPG,DC=htl-wien5,DC=schule',
  'CN=grafg,OU=Lehrer,OU=Automatisch gewartete Benutzer,OU=Benutzer,OU=SPG,DC=htl-wien5,DC=schule',
]

const STUDENT_DNS = [
  'CN=GEO220154,OU=HIF,OU=Schueler,OU=Automatisch gewartete Benutzer,OU=Benutzer,OU=SPG,DC=htl-wien5,DC=schule',
]

describe('roleFromDn', () => {
  it('maps teacher OUs', () => {
    for (const dn of TEACHER_DNS) expect(roleFromDn(dn)).toBe('teacher')
  })

  it('maps student OUs below a department OU', () => {
    for (const dn of STUDENT_DNS) expect(roleFromDn(dn)).toBe('student')
  })

  it('maps the Verwaltung OU to staff', () => {
    expect(
      roleFromDn(
        'CN=mmuster,OU=Verwaltung,OU=Automatisch gewartete Benutzer,OU=Benutzer,OU=SPG,DC=htl-wien5,DC=schule',
      ),
    ).toBe('staff')
  })

  it('is case-insensitive like the directory itself', () => {
    expect(
      roleFromDn('CN=x,ou=lehrer,ou=automatisch gewartete benutzer,dc=htl-wien5,dc=schule'),
    ).toBe('teacher')
    expect(roleFromDn('CN=x,OU=SCHUELER,OU=Automatisch gewartete Benutzer,DC=x')).toBe('student')
  })

  it('rejects unknown OUs, empty strings and undefined', () => {
    expect(
      roleFromDn(
        'CN=LDAP Test 01 (GRG),OU=LDAP,OU=Service-Accounts,OU=Manuell gewartete Benutzer,OU=Benutzer,OU=SPG,DC=htl-wien5,DC=schule',
      ),
    ).toBeNull()
    expect(roleFromDn('CN=x,OU=Drucker,OU=Automatisch gewartete Benutzer,DC=x')).toBeNull()
    expect(roleFromDn('')).toBeNull()
    expect(roleFromDn(undefined)).toBeNull()
  })

  it('does not accept a role OU that is only part of a CN', () => {
    // `OU=Lehrer` must be a real RDN, not a substring of a name like "CN=OU=Lehrer".
    expect(roleFromDn('CN=foo,OU=Lehrerzusatz,DC=x')).toBeNull()
  })
})

describe('group matching', () => {
  it('extracts the first RDN case-insensitively', () => {
    expect(firstRdn(' CN=NVS ,OU=Dienste,DC=x')).toBe('cn=nvs')
    expect(firstRdn('CN=only')).toBe('cn=only')
  })

  it('matches a group by its CN', () => {
    const dn =
      'CN=nvs,OU=Fachgruppen,OU=Mailaktivierte Sicherheitsgruppen,OU=Gruppen,OU=SPG,DC=htl-wien5,DC=schule'
    expect(isGroupDn(dn, 'NVS')).toBe(true)
    expect(isGroupDn(dn, 'ethik')).toBe(false)
  })

  it('maps to admin only when the configured group is present', () => {
    const groups = ['CN=nvs,OU=Fachgruppen,OU=Gruppen,DC=x']
    expect(applyAdminGroup('teacher', groups, 'nvs')).toBe('admin')
    expect(applyAdminGroup('teacher', groups, null)).toBe('teacher')
    expect(applyAdminGroup('teacher', groups, '')).toBe('teacher')
    expect(applyAdminGroup('student', groups, 'other')).toBe('student')
  })
})
