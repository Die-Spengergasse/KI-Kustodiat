---
type: Decision
title: "Eine App für Website und Token-Portal (`app/` im public Repo) (Issue #35)"
description: "Eine App für Website und Token-Portal (`app/` im public Repo) (Issue #35)"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-10-29T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-35
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/35
    title: Issue #35
---

**Eine App für Website und Token-Portal (`app/` im public Repo) (Issue #35):** Die öffentliche Website und das Token-Portal sind **eine** React-SPA (Node 24, Fastify 5) unter `app/`, versioniert im öffentlichen Repo; Deployment-Configs bleiben in `KI-Kustodiat-intern`. Öffentliche Routen werden **zur Build-Zeit vorgerendert** (SSG, nicht Runtime-SSR): Inhalt steht im initialen HTML, kein Client-Fetch — wegen Suchmaschinen/Bots und `curl`-Tauglichkeit. **Echte Pfade** (`/status`, `/angebote`, …) statt Hash-Routen; alte `#/<slug>`-Links werden umgeleitet. Entwicklung läuft auf `127.0.0.1:8080` (plus Vite auf `:5173`), ohne nginx, kik oder DNS. Reasons: eine Codebasis, ein Deploy, ein Design; die Website ist der erste, nicht der letzte Teil der App.
