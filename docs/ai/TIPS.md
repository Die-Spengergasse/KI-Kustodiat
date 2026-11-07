---
type: Tips
title: Tips
description: Admin-Tipps zu Open WebUI, LiteLLM-DB-Operationen und bekannten Konfigurationsmustern.
tags: [ki-kustodiat, tips]
generated: { by: opencode/knowledge-persistence, at: 2026-11-07T21:21:36Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:21:36Z }
status: stable
---

# TIPS — KI-Kustodiat

Tips & Tricks for Open WebUI administration, database operations, and
known configuration patterns. Additive knowledge — read before digging
into a new Open WebUI issue.

Alle Themen liegen als eigene Buckets unter [tips/](tips/index.md)
(OKF-Granularität, #61).

## Themen
- [Model-Discovery und Proxy-Kette](tips/model-discovery.md) — opencode-Modellpicker, models-proxy, Cache-Refresh und IP-Pflege.
- [Open WebUI Datenbank](tips/openwebui-db.md) — SQLite-Zugriff, Admin-Konten und Schlüsseltabellen.
- [Modell-Konfiguration (Capabilities und Parameters)](tips/model-config.md) — meta.capabilities, params und bewährte Presets.
- [Web-Suche (Konfiguration und Grenzen)](tips/web-search.md) — config-Keys für web.search und warum automatische Injektion nicht existiert.
- [Tool-Call-Probleme und {} -Bug](tips/tool-calls-troubleshooting.md) — Root Causes, Fix-Reihenfolge und der leere-Antwort-Bug.
- [Native Tool-Call-Mechanik (v0.10.2)](tips/tool-call-mechanics.md) — Wie Open WebUI Builtin-Tools verdrahtet, inkl. e2e-Rezept.
