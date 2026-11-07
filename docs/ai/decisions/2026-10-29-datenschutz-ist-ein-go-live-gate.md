---
type: Decision
title: "Datenschutz ist ein Go-Live-Gate, kein Bau-Gate (Issue #35)"
description: "Datenschutz ist ein Go-Live-Gate, kein Bau-Gate (Issue #35)"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-10-29T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-35
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/35
    title: Issue #35
---

**Datenschutz ist ein Go-Live-Gate, kein Bau-Gate (Issue #35):** Bau und Test laufen ohne Freigabe; der Rollout an Minderjährige erst nach Art.-30-Eintrag, Elterninformation, Retention-Festlegung (Spend aggregiert, `audit_log` befristet), Lösch-/Auskunftsweg und Freigabe durch Direktion/ZID. `store_prompts_in_spend_logs` bleibt aus; `consent_at` gilt nur für Cloud-Provider-Tiers.
