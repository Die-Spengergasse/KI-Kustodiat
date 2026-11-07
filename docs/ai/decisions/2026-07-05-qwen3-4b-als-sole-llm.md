---
type: Decision
title: "qwen3:4b als sole LLM"
description: "qwen3:4b als sole LLM"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-07-05T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: draft
---

**qwen3:4b als sole LLM** (Session 3 — SUPERSEDED by Session 4, see HISTORY.md): alle bisherigen Modelle (gemma4:e2b/e4b-128k, qwen3:8b) aus ollama entfernt und Blobs inventarisiert (→ `/opt/litellm/blob-inventory/`, Stand: 24 Blobs / 40 GiB). `qwen3:4b` (2,5 GB, 256K native Context) läuft auf ollama. `config.yaml` enthält nur `qwen3:4b` + `whisper-1`. Grund: 256K Context + kleines Weight-Footprint (~3 GB VRAM) erlauben Koexistenz mit whisper (~3,9 GB) auf 8 GB GPU.
