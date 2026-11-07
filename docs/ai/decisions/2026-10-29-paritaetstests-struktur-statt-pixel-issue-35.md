---
type: Decision
title: "Paritätstests: Struktur statt Pixel (Issue #35/#44/#45)"
description: "Paritätstests: Struktur statt Pixel (Issue #35/#44/#45)"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-10-29T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-35
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/35
    title: Issue #35
  - id: issue-44
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/44
    title: Issue #44
  - id: issue-45
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/45
    title: Issue #45
---

**Paritätstests: Struktur statt Pixel (Issue #35/#44/#45):** Der Pixelvergleich gegen Screenshots der alten Pico-Seite (`tests/reference/`, `tests/png.ts`, `scripts/capture-reference.ts`) ist ausgemustert. Er war Abnahmekriterium des Migrationsschritts (P1) und ist danach zur Bremse geworden: jede gewollte Inhaltsänderung — etwa ein neuer Link auf der Startseite — verlangt eine Neuaufnahme der Baselines gegen die *live* Seite, also Deploy → Aufnahme → zweiter Deploy. Behalten werden die Strukturtests (Überschriften, sichtbare Linktexte, keine externen Requests, Theme, Fokus-Führung) und die Snapshots des **Design-Systems**, die Komponenten und nicht Seiteninhalte prüfen.
