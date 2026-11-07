---
type: Decision
title: "opencode-Modell-Discovery über models.dev-Merging-Proxy (`:11436`, `OPENCODE_MOD"
description: "opencode-Modell-Discovery über models.dev-Merging-Proxy (`:11436`, `OPENCODE_MOD"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-07-05T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-6231
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/6231
    title: Issue #6231
---

opencode-Modell-Discovery über models.dev-Merging-Proxy (`:11436`, `OPENCODE_MODELS_URL`) statt Fork-Patch/PR (upstream opencode #6231) — behält npm-binary, macht Sync-Skript obsolet. Provider-Id in opencode = `litellm` (nicht `ollama`), opencode.json enthält nur `{ options }`.
