---
type: Decision
title: "LiteLLM (Docker, bundled Postgres 16, `api_base`=gregors WireGuard-IP `<WG_IP_GR"
description: "LiteLLM (Docker, bundled Postgres 16, `api_base`=gregors WireGuard-IP `<WG_IP_GR"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-07-05T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
---

LiteLLM (Docker, bundled Postgres 16, `api_base`=gregors WireGuard-IP `<WG_IP_GREGOR>`, siehe `KI-Kustodiat-intern:infra/hosts/secrets.local.md`; temporär/DHCP) als zentraler Gateway statt Custom-FastAPI-Proxy — wegen Virtual-Keys/Budgets/Rate-Limits und Skalierung auf hunderte User. `:main-stable` akzeptiert kein SQLite mehr (PITFALLS).
