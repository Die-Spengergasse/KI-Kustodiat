---
type: Tips
title: "Tips — Web-Suche (Konfiguration und Grenzen)"
description: "config-Keys für web.search und warum automatische Injektion nicht existiert."
tags: [ki-kustodiat, tips, web-search]
generated: { by: opencode/knowledge-persistence, at: 2026-11-07T21:21:36Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:21:36Z }
status: stable
---

## Web Search Configuration (config table)

Key config values (set via compose.yaml env OR Admin Panel; ConfigVars persist in DB):

| DB key | Meaning |
|--------|---------|
| `web.search.enable` | Enable web search |
| `web.search.engine` | `"searxng"`, `"google_pse"`, etc. |
| `web.search.searxng_query_url` | `"http://gregor.kik/search?q=<query>"` (Issue #21 erstmals, Issue #36 neu angelegt auf Schulnetz-DNS; ohne Auth) |
| `web.search.result_count` | Results to fetch (default 3) |
| `web.search.concurrent_requests` | Parallel search requests (0=unlimited) |
| `web.search.confirmation.enable` | Show "Search the web?" dialog before each search |
| `web.search.bypass_embedding_and_retrieval` | Skip embedding, use raw snippets |
| `web.search.bypass_web_loader` | Don't scrape result pages, use only snippets |
| `web.loader.engine` | Content extraction engine (empty=default, `playwright`, etc.) |
| `web.loader.ssl_verification` | SSL verify for page fetches (set `false` for self-signed) |

Quick-check via:
```python
rows = db.execute("SELECT key, value FROM config WHERE key LIKE 'web.search.%'").fetchall()
```

### ConfigVar caveat
Web search and many other settings are `ConfigVar` — once saved in the DB (Admin UI
or first startup), the DB value takes **permanent precedence** over compose.yaml env
vars on subsequent restarts. To force env vars:
1. Set `ENABLE_PERSISTENT_CONFIG: "false"` in compose.yaml temporarily
2. Or update directly in the DB (see above)
3. Or set via Admin Panel (which writes to DB)

## Web Search Does NOT Work via Automatic Injection

Open WebUI v0.10.2 (current) implements web search exclusively as a **tool call**,
not as server-side automatic injection. The model MUST:
- Have `function_calling` enabled (either `"native"` or default)
- Have `web_search: true` in capabilities
- Actually call the `web_search` function

There is no "auto-inject search results into the prompt" fallback. If the model
doesn't call the tool, no search happens.

**Qwen3 1.7B** can receive the `web_search` tool but is too small to reliably
decide when to call it. Enabling both `builtin_tools` and `web_search` triggers
the `{}` bug (model calls wrong tools). Keeping `tool_choice=none` prevents
all tool use including web_search.

**Bottom line (Issue #21, supersedes the 1.7B verdict):** With the **direct
Ollama connection** (no LiteLLM in the chat path) and a dedicated
**qwen3:8b-search** model (FC=native, search-friendly system prompt), native
web search works end-to-end: model calls `search_web` → Open WebUI queries
SearXNG (<LAN_IP_GREGOR>:80) → results injected → final answer. Verified e2e 2026-09-17.
The 1.7B verdict below remains true for small models.
