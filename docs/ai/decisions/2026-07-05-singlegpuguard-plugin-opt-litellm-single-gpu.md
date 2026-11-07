---
type: Decision
title: "SingleGpuGuard-Plugin (`/opt/litellm/single_gpu_guard.py`) implementiert Single-"
description: "SingleGpuGuard-Plugin (`/opt/litellm/single_gpu_guard.py`) implementiert Single-"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-07-05T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
---

SingleGpuGuard-Plugin (`/opt/litellm/single_gpu_guard.py`) implementiert Single-GPU-Residency-Regel (busy→HTTP 429, same model OK, idle→atomic swap) per `litellm_call_id`-Matching; ein residentes Modell auf der 8-GB-GPU. Konfig ist per-backend (api_base) keyed → korrekt nach Migration auf mehrere Knoten.
