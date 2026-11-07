---
type: Decision
title: "gregors VPN-IP `<WG_IP_GREGOR>` als canonical URL-Basis"
description: "gregors VPN-IP `<WG_IP_GREGOR>` als canonical URL-Basis"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-09-17T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-16
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/16
    title: Issue #16
---

**gregors VPN-IP `<WG_IP_GREGOR>` als canonical URL-Basis** (Issue #16): alle Konfigurationen, die auf die tote VPN-IP von 2026-07 zeigten (LiteLLM-PUBLIC_URL, opencode baseURL/SEARX_URL, bash_aliases OPENCODE_MODELS_URL, LiteLLM-DB api_base, Repo-Templates) auf die aktuelle tun0-IP umgestellt. Kein DNS für gregor → IP bleibt Wartungspunkt, alle Stellen synchen (CONVENTIONS.md); aktueller Wert nur intern (`KI-Kustodiat-intern:infra/hosts/secrets.local.md`). Reasons: die tote IP hatte keine Route, die aktuelle ist die tun0-Adresse; `host.docker.internal` ist im Container nicht auflösbar.
