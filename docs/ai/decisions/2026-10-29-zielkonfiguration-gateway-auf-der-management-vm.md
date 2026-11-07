---
type: Decision
title: "Zielkonfiguration: Gateway auf der Management-VM, gregor nur Whisper + SearXNG (Issue #35)"
description: "Zielkonfiguration: Gateway auf der Management-VM, gregor nur Whisper + SearXNG (Issue #35)"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-10-29T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-35
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/35
    title: Issue #35
---

**Zielkonfiguration: Gateway auf der Management-VM, gregor nur Whisper + SearXNG (Issue #35):** LiteLLM, PostgreSQL und Redis laufen auf `kik` als nativem Dienst (kein Docker für die Portal-Applikation); `gregor` behält ausschließlich Speech-to-Text und die Schul-Suchinstanz. Die LiteLLM/Postgres/ollama-Reste auf gregor sind Altlasten aus der Zeit vor der Management-VM und werden nach erfolgreicher Verifikation auf kik abgebaut. **Frische Datenbank** statt Dump/Restore — die gregor-Keys sind Testartefakte; ein Dump bleibt als Archiv. kik darf bei Bedarf vCPU/RAM nachbekommen. Ein **API-Subdomain-DNS seitens ZID ist kein Blocker**: Portal und Proxy hängen zunächst unter dem bestehenden VHost (`kik.spengergasse.at/portal`, `/api/v1`).
