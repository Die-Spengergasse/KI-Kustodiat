---
type: Pitfalls
title: Pitfalls
description: Bekannte Fallstricke, subtile Bugs und nicht-offensichtliche Constraints aus bisherigen Sessions.
tags: [ki-kustodiat, pitfalls]
generated: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
---

# Pitfalls

Things that do not work, subtle bugs, and non-obvious constraints.
Read this file carefully before making changes in affected areas.

Alle Einträge sind nach Themen in [pitfalls/](pitfalls/index.md)
aufgeteilt (OKF-Granularität, #60).

## Themen
- [Recherche, Markt und Preise](pitfalls/research-market.md) — Anbieter-, Preis-, Lizenz- und Datenschutz-Recherche veraltet schnell.
- [Hardware und Stromversorgung](pitfalls/hardware-power.md) — Stromanschlüsse, Adapter und Netzteil-Alterung.
- [LiteLLM-Gateway und Modellkatalog](pitfalls/litellm-gateway.md) — Router, Hooks, Key-Cache, Callbacks und Modell-Registrierung.
- [Ollama und lokale GPU-Modelle](pitfalls/ollama-local.md) — Model-Residency, Blob-Verwaltung und SingleGpuGuard.
- [Open WebUI (Konfiguration, DB, Tool-Calls)](pitfalls/openwebui.md) — Config-Overlays, SQLite-DB und Tool-Call-Verhalten.
- [Portal, LDAP und AD-Authentifizierung](pitfalls/portal-ldap-auth.md) — AD-Verhalten, Login-Defaults und Lockout-Gefahren.
- [Whisper/STT und Abrechnung](pitfalls/whisper-stt.md) — Speech-to-Text-Verträge, Spend-Logs und Dauer-Abrechnung.
- [SearXNG und Web-Suche](pitfalls/searxng-search.md) — Engine-Ketten, Secret-Env und Provider-Suche.
- [Website, Deploy, systemd und nginx](pitfalls/website-deploy-nginx.md) — Release-Wechsel, Dienst-Start, nginx-Routing und CSS.
- [Werkzeuge, Git und Betriebs-Hygiene](pitfalls/tooling-git-ops.md) — CLI-Verhalten, Git-Push, SSH, sudo und Datei-Modi.
