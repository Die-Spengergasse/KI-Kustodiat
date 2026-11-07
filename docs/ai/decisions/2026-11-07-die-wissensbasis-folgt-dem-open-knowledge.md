---
type: Decision
title: "Die Wissensbasis folgt dem Open Knowledge Format (OKF) v0.2 (Issues #58, opencode-helpers#127)"
description: "Die Wissensbasis folgt dem Open Knowledge Format (OKF) v0.2 (Issues #58, opencode-helpers#127)"
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

**Die Wissensbasis folgt dem Open Knowledge Format (OKF) v0.2 (Issues #58, opencode-helpers#127):** `docs/ai/` ist ein OKF-Bundle — ein Konzept-File je Wissensdatei, YAML-Frontmatter mit `type` als Pflichtfeld plus Trust-/Lifecycle-Familie (`generated`, `verified`, `status`, optional `stale_after`/`sources`), reservierte Files `index.md` (§8, progressive disclosure) und `log.md` (§9, Per-Run-Log). Reasons: (a) ein leichtgewichtiges, werkzeugneutrales Format ohne Runtime/SDK, lesbar für Menschen und Agenten; (b) `generated`/`verified`/`status` machen Herkunft und Frische maschinell prüfbar, statt sie in Prosa zu verstecken; (c) Pflege wird wie Code im Repo betrieben (Diffs, PRs, Blame). Considered: formale Ontologie-Sprachen (RDF-Schema, OWL, F-Logic, KIF) — verworfen, weil der Formalisierungs- und Kurationsaufwand organisatorisch nicht durchsetzbar ist und Verwaltungswissen narrativ, nicht inferenzierbar ist; Status quo ohne Metadaten — verworfen, weil Herkunft/Frische sonst weiter nur in Fließtext steckt. Tradeoff: OKF ist jung (v0.2, zwei Breaking Changes von v0.1 auf v0.2); deshalb wird nur auf die stabile Kernfamilie gebaut, `Attested Computation` und Konsum-Tooling bleiben zurückgestellt.
