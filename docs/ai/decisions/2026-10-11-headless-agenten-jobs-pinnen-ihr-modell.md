---
type: Decision
title: "Headless-Agenten-Jobs pinnen ihr Modell (Issue #33)"
description: "Headless-Agenten-Jobs pinnen ihr Modell (Issue #33)"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-10-11T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-33
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/33
    title: Issue #33
---

**Headless-Agenten-Jobs pinnen ihr Modell (Issue #33):** opencode V2 fällt ohne konfiguriertes Modell auf das *neueste verfügbare Katalogmodell* zurück (verifiziert: der Angebots-Job lief still auf `opencode-go/claude-haiku-5-5`, dem jüngsten Eintrag — nicht auf dem TUI-zuletzt-gewählten Modell). Fix: `--model opencode-go/deepseek-v4.1-flash#high` im Runner `scripts/run-offers-job.sh` (repo-versioniert; die `#variant` lässt sich nur per CLI setzen, der Root-`model`-Key kann keine halten) + globaler Default `model` in `~/.config/opencode/opencode.json` (host-lokales, nicht versioniertes File) als Sicherheitsnetz für alle Läufe. Konvention in `opencode-helpers/AGENTS.global.md`: headless Jobs pinnen immer `--model`.
