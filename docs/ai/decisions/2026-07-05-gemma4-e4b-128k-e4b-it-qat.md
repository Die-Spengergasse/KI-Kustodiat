---
type: Decision
title: "`gemma4:e4b-128k` (e4b-it-qat @128K) als Sweet-Spot für die 8-GB-Mappe; die ~1,4"
description: "`gemma4:e4b-128k` (e4b-it-qat @128K) als Sweet-Spot für die 8-GB-Mappe; die ~1,4"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-07-05T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
---

`gemma4:e4b-128k` (e4b-it-qat @128K) als Sweet-Spot für die 8-GB-Mappe; die ~1,4 GB VRAM-Headroom bleiben bewusst als KV-Cache-Puffer für lange Sessions, nicht "verschenkt". 192K/256K abgelehnt — e4b hat 128K nativ (12B/26B/31B haben 256K).
