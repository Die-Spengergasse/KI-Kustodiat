---
type: Decision
title: "Open WebUI mit LDAP (Session 3)"
description: "Open WebUI mit LDAP (Session 3)"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-07-05T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-14
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/14
    title: Issue #14
---

**Open WebUI mit LDAP (Session 3):** Open WebUI als user-facing Chat-Frontend deployt (`ghcr.io/open-webui/open-webui:main`), authentifiziert gegen Schul-AD via LDAPS (`ldap.spengergasse.at:636`). LiteLLM bleibt der Backend-Aggregator (`:11434`), Open WebUI verwendet den shared `opencode-gregor`-Key. STT-Engine auf `openai` gestellt, sendet Audio an lokales whisper via LiteLLM. HTTPS/Caddy für Mic-Zugriff ist offen (Issue #14).
