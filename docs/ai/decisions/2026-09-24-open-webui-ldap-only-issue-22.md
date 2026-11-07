---
type: Decision
title: "Open WebUI LDAP-only (Issue #22)"
description: "Open WebUI LDAP-only (Issue #22)"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-09-24T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-22
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/22
    title: Issue #22
---

**Open WebUI LDAP-only (Issue #22):** Auth läuft ausschließlich über den Schul-AD via LDAPS mit *search-then-bind* und dediziertem Service-Account (`ldap.server.app_dn`). `attribute_for_username=sAMAccountName`, `search_filter=(objectClass=user)`, search base `OU=Automatisch gewartete Benutzer,OU=Benutzer,OU=SPG,DC=htl-wien5,DC=schule`, `attribute_for_mail=mail`, `validate_cert=true`. Lokales Login-Formular deaktiviert (`ui.enable_login_form=false`) → der „Continue with Email/LDAP"-Toggle verschwindet, das LDAP-Formular ist Default und einzige Methode. Neue AD-User via `ui.default_user_role=user`; `grafg` bleibt einziger Admin (Match per `mail`, Rolle bleibt). Lokales Admin-Passwort durch Zufalls-bcrypt-Hash **neutralisiert**, `auth.active=1` bleibt (Deaktivieren würde den LDAP-Pfad mitbrechen). Konfig lebt in der Open-WebUI-DB (`config`), nicht im compose-env. Reasons: LDAP war davor nie funktional (kein Bind-Account → anonymer Bind liest nichts; literaler `{{login}}`-Filter; `attribute_for_username=uid`); der scheinbar funktionierende Login war der **lokale** Account mit AD-gleichem Passwort. Open WebUI kennt keinen Direct-Bind (immer search-then-bind); dieser AD verbietet anonymes Lesen (verifiziert 636/389/3268).
