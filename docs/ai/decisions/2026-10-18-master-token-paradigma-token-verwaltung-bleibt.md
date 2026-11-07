---
type: Decision
title: "Master-Token-Paradigma: Token-Verwaltung bleibt in der Schule (Issue #34)"
description: "Master-Token-Paradigma: Token-Verwaltung bleibt in der Schule (Issue #34)"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-10-18T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-34
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/34
    title: Issue #34
  - id: issue-35
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/35
    title: Issue #35
---

**Master-Token-Paradigma: Token-Verwaltung bleibt in der Schule (Issue #34):** Von jedem Provider genügt **ein institutioneller Master-Token**; die individuellen Tokens für Schüler:innen und Lehrkräfte samt Budgets und Rate-Limits erzeugt der LiteLLM-Proxy der Schule (`virtual keys`/`budgets`, Issue #35). Die Schule geht mit ihren eigenen Tokens auf den Proxy, der reicht an den Provider weiter. Konsequenzen für alle Provider-Anfragen (`KI-Kustodiat-intern:docs/extern/llm-provider-rundmail-TODO/`): (a) wir fragen keine Per-User-Accounts und keine Per-User-Limits an, sondern Rate-/Volumen-Limits **auf Masterebene** (RPM/TPM, gleichzeitige Requests) plus Verbrauchsauswertung pro Schlüssel; (b) es fließen keine Schüler-Identitäten zum Provider — verkaufbar als Datensparsamkeit im Sinne der DSGVO; (c) als **technische Möglichkeit, nicht als Bedingung** formuliert, damit ein Provider mit Pflicht-zu-User-Accounts nicht ausfällt. Reasons: kein Provisionieren von ~2.600 Accounts beim Provider, Feinsteuerung und Kostenhoheit liegen bei der Schule, Whitelisting/Modellauswahl bleibt lokal beherrschbar.
