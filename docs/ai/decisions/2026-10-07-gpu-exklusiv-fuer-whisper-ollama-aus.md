---
type: Decision
title: "GPU exklusiv für Whisper, Ollama aus, LiteLLM-Reserve"
description: "GPU exklusiv für Whisper, Ollama aus, LiteLLM-Reserve"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-10-07T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
---

**GPU exklusiv für Whisper, Ollama aus, LiteLLM-Reserve:** RTX 2070 SUPER gehört allein Whisper `large-v3` (dauerhaft, `restart: unless-stopped`, ~3,9 GB VRAM, Open WebUI direkt auf `http://whisper:9000/v1`). Ollama gestoppt + `disable` (kein lokales LLM mehr); LiteLLM + Postgres + models-proxy nur gestoppt (`stop`, nicht `down`), GROQ-Rotation als dokumentierte Reserve (`KI-Kustodiat-intern:whisper/README.md`). Chat-LLM per BYOK (`direct.enable=true`, z. B. DeepSeek-Token des Users — Key liegt am Server, DSGVO-Eigenverantwortung, Tier-4-Hinweis in PITFALLS). SearXNG `:80` bleibt Search-Backend (Tool-Calls brauchen FC-fähiges BYOK-Modell). ZID-nginx redet Klartext auf `:3000` (kein TLS in Open WebUI nötig).
