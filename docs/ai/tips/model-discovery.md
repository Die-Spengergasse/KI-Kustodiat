---
type: Tips
title: "Tips — Model-Discovery und Proxy-Kette"
description: "opencode-Modellpicker, models-proxy, Cache-Refresh und IP-Pflege."
tags: [ki-kustodiat, tips, model-discovery]
generated: { by: opencode/knowledge-persistence, at: 2026-11-07T21:21:36Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:21:36Z }
status: stable
---

## Models-Proxy-Kette & Stale-Modelllisten (opencode-Modellpicker)

Datenfluss für die Modelle im opencode-Picker:

```
Ollama → LiteLLM-DB (LiteLLM_ProxyModelTable, store_model_in_db=true)
       → models-proxy /api.json (:11436, container-intern :8000)
       → OPENCODE_MODELS_URL-Client → Disk-Cache (~/.cache/opencode/models*.json)
```

- **models-proxy ist nur ein Durchstich**: es serviert exakt das, was LiteLLM
  `/v1/models` meldet (per `LITELLM_PROXY_KEY`). Stale Modellliste = fast immer
  EINDRÜCKLICH die LiteLLM-DB (oder der Disk-Cache) — nicht der Proxy.
- Recency: opencode cached die `api.json` und refresht nur ~alle 60 min
  (TTL). Das Cache-File (`~/.cache/opencode/models*.json`) wird unconditional
  vom Disk serviert und bei Fehlschlag still refreshed → nach DB-Änderungen
  Cache löschen: `rm -f ~/.cache/opencode/models*.json` oder
  `opencode models --refresh`.
- `OPENCODE_MODELS_URL` kennt nur `/api.json`; es gibt keinen separaten
  Endpoint. Der Proxy lädt Upstream models.dev + injiziert den `litellm`-Provider.
- Verifikations-Endpoints: `curl -s -H "Authorization: Bearer $LITELLM_PROXY_KEY"
  http://localhost:11434/v1/models` (exakt die 6 gregor-Modelle) und
  `curl -s http://localhost:11436/api.json` (`litellm.api` UND 6 Models prüfen).
- **`<TOTE_VPN_IP_2026-07>` ist eine tote IP** (2026-07; gregor war damals dort). Heute ist
  gregor `<WG_IP_GREGOR>` (VPN). Kein DNS für gregor — IP-Doppel in
  `/opt/litellm/.env` (LITELLM_PUBLIC_URL), opencode.json (baseURL),
  bash_aliases (OPENCODE_MODELS_URL) und LiteLLM-DB api_base beim Wechsel:
  alle synchron pflegen, NIE `<TOTE_VPN_IP_2026-07>` einbauen.
- Suchserver ist Gregor selbst auf Port 80 (keine Secrets nötig): nginx `:80`
  proxyt offen auf SearXNG (`127.0.0.1:8888` bleibt localhost-only). Primär-Ziel
  für Schulklienten ist der **Schulnetz-DNS-Name `http://gregor.kik`** (= `gregor.kik.htl-wien5.schule` → `<LAN_IP_GREGOR>`, nur im Schulnetz auflösbar; Instanz-Trennung
  2026-10-19, #36) — die VPN-IP `<WG_IP_GREGOR>` nur noch für Admin-Zugriff.
  opencode-MCP nutzt `SEARXNG_PRIMARY=http://gregor.kik`,
  `SEARXNG_PRIMARY_AUTH=` (leer), `SEARXNG_CHAIN=strict` (Profil: bing →
  yahoo → braveapi, kein Free-Tier; Legacy-Alias `gregor` vom Skill noch
  akzeptiert). Kein Fallback auf die private Operator-Instanz — keine privaten Credentials auf
  Schul-Hosts. Verifikation: `curl
  "http://gregor.kik/search?q=…&format=json"` → echte Results ohne Auth.
