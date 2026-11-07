---
type: Decision
title: "Modell-Swap: qwen3:4b (4B, 2,5 GB) → qwen3:1.7b (1,7B, 1,4 GB) via Modelfile-Tag-Override"
description: "Modell-Swap: qwen3:4b (4B, 2,5 GB) → qwen3:1.7b (1,7B, 1,4 GB) via Modelfile-Tag-Override"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-07-05T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
---

**Modell-Swap: qwen3:4b (4B, 2,5 GB) → qwen3:1.7b (1,7B, 1,4 GB) via Modelfile-Tag-Override** (Session 4): Realer 4B-Modell lief zu langsam (~59 s, 87% GPU, BW-bound). Stattdessen qwen3:1.7b gepullt, mit `ollama create qwen3:4b -f Modelfile.qwen3` als selber Tag überschrieben — LiteLLM-Config (`config.yaml`) bleibt unverändert. Ergebnis: ~140 tok/s, 100% GPU, ~3 s Antwortzeit. Modelfile in `KI-Kustodiat-intern:ollama/Modelfile.qwen3-1.7b`.
