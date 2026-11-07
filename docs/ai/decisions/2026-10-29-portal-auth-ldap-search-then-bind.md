---
type: Decision
title: "Portal-Auth: LDAP search-then-bind, Sessions in Postgres, eigene DB-Rolle `portal` (Issue #47)"
description: "Portal-Auth: LDAP search-then-bind, Sessions in Postgres, eigene DB-Rolle `portal` (Issue #47)"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-10-29T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-47
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/47
    title: Issue #47
---

**Portal-Auth: LDAP search-then-bind, Sessions in Postgres, eigene DB-Rolle `portal` (Issue #47):** Die App bindet zuerst mit dem Service-Account, sucht `sAMAccountName` (Scope `sub`, `objectClass=user`) und bindet dann **als gefundener DN** mit dem Nutzerpasswort; ein leeres Passwort wird vorher abgewiesen (unauthenticated bind). Die Rolle kommt aus dem DN (`,OU=Lehrer,`/`,OU=Schueler,`/`,OU=Verwaltung,`, sonst kein Zugang); **`admin` ist keine Verzeichnisrolle**, sondern `portal.users.role` plus optionales `PORTAL_ADMIN_GROUP`, und ein Login überschreibt eine bestehende Admin-Rolle nicht. Sessions liegen serverseitig in `portal.sessions` (nur der SHA-256 des Tokens, Cookie `HttpOnly`/`Secure`/`SameSite=Lax`, rollierend), CSRF ist ein signiertes Double-Submit-Token mit Pflicht-Header, Fehlversuche zählen in `portal.login_attempts` (Konto 5/15 min, IP 20/15 min). DB: eigene Rolle `portal` + Schema `portal` in der `litellm`-DB — nie in `public` (LiteLLM), Verbrauch später nur über read-only Views; Migrationen per Drizzle mit Journal `portal.__migrations`. Provisioning (`user_id` = `sam`) ist idempotent und **nicht blockierend**: ein Gateway-Ausfall verhindert keinen Login.
