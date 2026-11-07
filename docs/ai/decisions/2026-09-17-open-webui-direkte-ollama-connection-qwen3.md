---
type: Decision
title: "Open WebUI: direkte Ollama-Connection + `qwen3:8b-search` für Web Search"
description: "Open WebUI: direkte Ollama-Connection + `qwen3:8b-search` für Web Search"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-09-17T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-21
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/21
    title: Issue #21
---

**Open WebUI: direkte Ollama-Connection + `qwen3:8b-search` für Web Search** (Issue #21): Open WebUI erhält Ollama-Direktverbindung (`<WG_IP_GREGOR>:11435`, natives Protokoll — umgeht den LiteLLM-Streaming-Tool-Call-Bug komplett, konsistent mit ollama-direct für OpenCode). Dediziertes Experiment-Modell `qwen3:8b-search` (Tag + Modelfile im Repo, FC=native, `builtin_tools=true` + `meta.builtinTools` außer web_search alles aus, System-Prompt nennt `search_web`/`fetch_url`) statt Capability-Lockdown der 6 Produktionsmodelle anzufassen. SearXNG für Open WebUI auf gregor:80 (`web.search.searxng_query_url=http://<WG_IP_GREGOR>/search?q=<query>`) — **bewusst ohne Auth, Absicherung über Schulnetz-/VPN-Grenze** (nicht „reparieren"!). e2e verifiziert: native tool_calls → SearXNG-Ergebnisse → Antwort. STT wechselt auf GROQ (Token-Rotation über LiteLLM-Router, Keys von Schülern — whisper/README.md).
