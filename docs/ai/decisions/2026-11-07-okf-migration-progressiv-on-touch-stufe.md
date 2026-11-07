---
type: Decision
title: "OKF-Migration progressiv „on touch\", Stufe 2 (Konzept-Granularität) zurückgestellt (Issues #58, opencode-helpers#127)"
description: "OKF-Migration progressiv „on touch\", Stufe 2 (Konzept-Granularität) zurückgestellt (Issues #58, opencode-helpers#127)"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-11-07T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-58
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/58
    title: Issue #58
  - id: issue-127
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/127
    title: Issue #127
---

**OKF-Migration progressiv „on touch", Stufe 2 (Konzept-Granularität) zurückgestellt (Issues #58, opencode-helpers#127):** Bestehende Wissensdateien behalten Geltung und erhalten den Envelope beim nächsten Persistence-Touch; kein Big-Bang-Migrationslauf über alle Repos. Stufe 2 — ein Konzept je Eintrag (`decisions/<slug>.md`, `pitfalls/<slug>.md`, Crosslinks als Graph) — wird erst umgesetzt, wenn konkrete Retrieval-Friction sichtbar wird (z. B. ein RAG-Konsument, der sonst ganze Sammeldateien laden müsste). Reasons: Stufe 1 liefert den Großteil des Nutzens (Herkunft, Frische, maschinelle Prüfbarkeit) für einen Bruchteil des Aufwands; die Einzeleinträge sind teils Ein-Liner, die als Einzelfiles überfragmentieren würden.
