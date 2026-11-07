---
type: Decision
title: "24K Kontext mit Q8-KV-Cache"
description: "24K Kontext mit Q8-KV-Cache"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-07-05T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
---

**24K Kontext mit Q8-KV-Cache** (Session 4): Binary Search ergab 24K als maximum, das 100% GPU-Layer hält (whisper ~3,9 GB + LLM ~2,8 GB = 6,7 GB von 8 GB). 256K native Context → CPU-Offload (zu langsam). `OLLAMA_KV_CACHE_TYPE=q8_0` halbiert KV-Cache-Speicher vs. fp16. `num_ctx 24576` im Modelfile.
