---
type: Decision
title: "Implementationsdetails gehören ausschließlich ins private Schwester-Repo, GitHub Pages wird auf einen reinen Website-Verweis reduziert (Issues #37, #38)"
description: "Implementationsdetails gehören ausschließlich ins private Schwester-Repo, GitHub Pages wird auf einen reinen Website-Verweis reduziert (Issues #37, #38)"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-10-19T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-37
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/37
    title: Issue #37
  - id: issue-38
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/38
    title: Issue #38
---

**Implementationsdetails gehören ausschließlich ins private Schwester-Repo, GitHub Pages wird auf einen reinen Website-Verweis reduziert (Issues #37, #38):** Die Ordner `infra/`, `litellm/`, `ollama/`, `openwebui/`, `searxng/`, `whisper/` wanderten komplett nach `KI-Kustodiat-intern` (Vorwärts-Move, **kein** History-Rewrite — es wurden nie Secrets committet). Öffentlich bleiben Konzeptdoku und Wissensbasis (`docs/ai/`); Verweise auf Implementationspfade laufen über die Konvention `KI-Kustodiat-intern:<pfad>`. `pages/index.html` (GitHub Pages) enthält nur noch einen Button »Hier geht's zur offiziellen Website« auf `https://kik.spengergasse.at` plus `<link rel="canonical">` — Discussions-Karte und Footer entfernt.
