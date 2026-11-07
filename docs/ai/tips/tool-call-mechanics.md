---
type: Tips
title: "Tips — Native Tool-Call-Mechanik (v0.10.2)"
description: "Wie Open WebUI Builtin-Tools verdrahtet, inkl. e2e-Rezept."
tags: [ki-kustodiat, tips, tool-call-mechanics]
generated: { by: opencode/knowledge-persistence, at: 2026-11-07T21:21:36Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:21:36Z }
status: stable
---

## Open WebUI Native Tool-Call Mechanics (Issue #21, verified against v0.10.2 source)

How Open WebUI wires web search as a builtin tool — needed for any future
Open WebUI + tool-call work:

- **Builtin tools are NOT MCP.** Open WebUI injects its own Python functions
  (`search_web`, `fetch_url`, `search_chats`, ...) as OpenAI-style `tools` in
  the request; the model calls them, Open WebUI executes server-side.
- **Injection gate (`use_builtin_tools`, middleware.py ~2518):** requires ALL of
  1. `metadata.session_id` — API callers without a UI session get NO tools
     (by design: "API callers don't expect hidden tools"),
  2. model `params.function_calling != 'legacy'`,
  3. `capabilities.builtin_tools` **true** (default true; our lockdown set
     it false — that alone blocks web search even with web_search=true!).
- **`search_web` tool gate (tools.py ~583):** `meta.builtinTools.web_search`
  (default true) AND config `web.search.enable` AND capability `web_search`
  AND request `features.web_search` AND user permission.
- **Tool-noise control via `meta.builtinTools`:** by default Open WebUI
  injects ~23 builtin tools (KB, notes, automations, tasks, chats, time).
  Small models choke on that. Gate per category on the model row:
  `meta.builtinTools = {"web_search": true, "knowledge": false, "notes": false,
  "automations": false, "tasks": false, "channels": false, "time": false}`.
  (Still leaks `search_chats`/`view_chat` — not gated by any category.)
- **Tool names:** the builtin search tool is `search_web` (NOT `web_search`).
  A system prompt that says "call web_search" confuses the model — name the
  function or keep it generic.
- **Native FC loop is streaming-only:** the tool-call → execute → second
  model call loop lives in the streaming handler (`delta_tool_calls`).
  Non-streaming API requests get the tool_calls response dropped silently.
  The UI always streams; e2e tests must use `stream: true`.
- **Background fan-out requires `id`:** with `session_id`+`chat_id` present
  the endpoint dispatches a background task per model — but only for entries
  with a top-level `id` (assistant message id). Without `id`: response is
  `{"status": true, "task_ids": []}` and NOTHING runs. Also `features` and
  `session_id` must be TOP-LEVEL body fields, not inside `metadata`.
- **Synthetic chat ids crash the loop:** the tool-loop reads the chat row
  (`Chats.get_message_by_id_and_message_id`); a self-invented `chat_id`
  without a matching `chat` table row → `'NoneType' object has no attribute
  'get'` → chat:message:error. Create the chat first (`POST /api/v1/chats/new`)
  and use the server-assigned id.
- **e2e recipe (issue #21):** mint JWT (`{"id": user_id}` HS256 with
  `WEBUI_SECRET_KEY`), create chat via API, POST `/api/chat/completions`
  with top-level `features: {"web_search": true}`, `session_id`, `chat_id`,
  `id`, `stream: true`; listen on socket.io `/ws/socket.io` (auth token=JWT,
  event name `events`, room `user:<user_id>`) for `source` + completion.
- **Tool-call count check:** `journalctl -u ollama | grep 'POST "/api/chat"'`
  — a native loop shows ≥2 POSTs (tool call + final answer). 1 POST +
  plain answer = tools were not honored.
