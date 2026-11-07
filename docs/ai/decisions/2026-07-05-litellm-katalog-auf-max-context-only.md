---
type: Decision
title: "LiteLLM-Katalog auf Max-Context-only reduziert: nur `gemma4:e2b-128k` + `gemma4:"
description: "LiteLLM-Katalog auf Max-Context-only reduziert: nur `gemma4:e2b-128k` + `gemma4:"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-07-05T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
---

LiteLLM-Katalog auf Max-Context-only reduziert: nur `gemma4:e2b-128k` + `gemma4:e4b-128k` (beide 128K = architektonisches Max der e2b/e4b-Varianten). 4K-Default-Varianten (`e2b`, `e4b`, `e4b-it-qat`, `12b`, `12b-it-qat`) aus `config.yaml` `model_list` entfernt — ein Modell mit nur 4K Kontext ist pädagogisch wertlos. 12B/12b-it-qat NICHT auf 256K (sein Max) gesetzt, weil 6,36 GBWeights + ~4–8 GB KV-Cache @256K >> 1,64 GB freie VRAM auf der 8 GB gregor-GPU (OOM oder CPU-KV-Offload = unbrauchbar langsam).
