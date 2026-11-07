---
type: Decision
title: "Rollen werden aus den LDAP-CNs abgeleitet (Issue #35)"
description: "Rollen werden aus den LDAP-CNs abgeleitet (Issue #35)"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-10-29T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-35
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/35
    title: Issue #35
---

**Rollen werden aus den LDAP-CNs abgeleitet (Issue #35):** Schüler:innen/Lehrkräfte/Admin ergeben sich aus den CN-Strukturen des Schul-AD (verifiziert an der Umsetzung, nicht geraten) — keine hartcodierten Gruppen in der Anwendung, keine Env-Variable als Primärquelle. Die beobachtete Ableitungsregel wird im internen Repo dokumentiert. Grund: das Verzeichnis ist die einzige Wahrheit für Zugehörigkeit; jede Zweitliste driftet.
