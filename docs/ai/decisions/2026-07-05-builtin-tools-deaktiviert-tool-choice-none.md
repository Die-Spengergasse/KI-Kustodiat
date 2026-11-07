---
type: Decision
title: "Builtin-Tools deaktiviert + tool_choice=none"
description: "Builtin-Tools deaktiviert + tool_choice=none"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-07-05T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
---

**Builtin-Tools deaktiviert + tool_choice=none** (Session 4–5): Qwen3 1.7B ruft builtin-Tools (write_note, list_knowledge_bases, calculate_timestamp, explain_options_trading) auf → LiteLLM/Ollama-Streaming liefert Tool-Call-Deltas → Open WebUI's Stream-Handler produziert leeres `{}`. Fix: `capabilities.builtin_tools=false`, `code_interpreter=false`, `terminal=false`, `image_generation=false` in der Open-WebUI-DB; `params.tool_choice="none"`. Web-Search (via SearXNG) ist in Open WebUI v0.10.2 ausschließlich als Tool-Call implementiert, daher nicht nutzbar mit `tool_choice=none`. Ein größeres Modell mit stabilem Function-Calling wäre nötig. Detail in `docs/ai/TIPS.md`.
