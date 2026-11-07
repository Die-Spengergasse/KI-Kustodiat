---
type: Tips
title: "Tips — Tool-Call-Probleme und {} -Bug"
description: "Root Causes, Fix-Reihenfolge und der leere-Antwort-Bug."
tags: [ki-kustodiat, tips, tool-calls-troubleshooting]
generated: { by: opencode/knowledge-persistence, at: 2026-11-07T21:21:36Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:21:36Z }
status: stable
---

## Tool-Call Problems — Root Causes & Fixes

### The `function_calling` parameter is the real lever (not `builtin_tools`)

Open WebUI v0.10.0+ defaults `function_calling` to **`native`**. This sends
the function-calling signal to the model via the Ollama chat template — even
when `builtin_tools: false` and no tools are registered. The model sees the
"you can call functions" instruction and hallucinates tool-call JSON like
`{"name": "write_poem", "arguments": {"content": "..."}}`.

The three modes:
- **`native`** (default since v0.10.0) — uses the model's native tool-calling
  template. Small models hallucinate tool calls even without registered tools.
- **`legacy`** — uses prompt injection instead of native template. Deprecated,
  still works, no new features/fixes.
- **`none`** — disables function calling entirely. No tool-calling signal sent.

**Setting `function_calling: "none"` in model params is the primary fix.**
This stops Open WebUI from signaling the model that it can call functions.

(Source: Open WebUI maintainer Classic298, issue #26823)

### THE Root Cause for SQL-inserted models: `base_model_id` must be NULL

**This is the #1 gotcha.** When inserting model entries into the Open WebUI
`model` table via SQL, `base_model_id` MUST be `NULL` (None), NOT `''` (empty
string).

Open WebUI's model merge logic (`utils/models.py:144-172`):

```python
if custom_model.base_model_id is None:      # ← Only None triggers override!
    model = base_model_lookup.get(custom_model.id)
    model['info'] = custom_model.model_dump()  # ← Capabilities applied HERE

elif custom_model.is_active:
    if custom_model.id in existing_ids:
        continue                              # ← SKIPPED! Base model used as-is!
```

When `base_model_id = ''` (empty string, NOT `None`):
1. First branch skipped (`'' is not None`)
2. Elif checks if model ID exists in LiteLLM catalog → it does
3. **`continue`** → custom model entry **silently ignored**
4. Base model from LiteLLM used **without any capabilities**
5. `function_calling` **defaults to `native`** → model hallucinates tool JSON

**Fix:** `UPDATE model SET base_model_id = NULL WHERE base_model_id = '';`

**How to check:** All models in the `model` table should have
`base_model_id = None` (NULL). If any have `''`, their capabilities are
being silently ignored.

### Secondary defenses (apply AFTER fixing base_model_id)

Once `base_model_id = NULL` is fixed and capabilities are properly loaded,
these settings take effect:

**In Open WebUI DB — model params:**
```python
params['function_calling'] = 'none'  # THE key fix: stop native FC signal
params['tool_choice'] = 'none'       # Belt-and-suspenders: no tools in request
```

**In Open WebUI DB — model capabilities:**
```python
meta['capabilities']['builtin_tools'] = False   # Disable builtin tools
meta['capabilities']['web_search'] = False
meta['capabilities']['code_interpreter'] = False
meta['capabilities']['terminal'] = False
meta['capabilities']['image_generation'] = False
```

**In LiteLLM DB — model_info (prevents function-calling advertisement):**
```sql
UPDATE "LiteLLM_ProxyModelTable"
SET model_info = '{"supports_function_calling": false}'
WHERE model_name IN ('qwen3:1.7b', 'qwen2.5-coder:3b', 'llama3.2:3b');
```

**In Modelfile — system prompt (prevents training artifact):**
```
SYSTEM """...Do NOT use any tools or functions. Respond only in plain text..."""
```

### Summary of required fixes per model

| Model | base_model_id | DB params | Modelfile system prompt |
|-------|---------------|-----------|------------------------|
| qwen3:1.7b | NULL ✅ | `function_calling: "none"`, `tool_choice: "none"`, `reasoning_tags: false`, `think: false` | "Do NOT use any tools or functions" |
| qwen2.5-coder:3b | NULL (fix!) | `function_calling: "none"`, `tool_choice: "none"` | "Do NOT use any tools or functions" |
| llama3.2:3b | NULL (fix!) | `function_calling: "none"`, `tool_choice: "none"` | "Do NOT use any tools or functions" |

**Two layers are critical:**
1. `base_model_id = NULL` — without this, ALL settings are silently ignored
2. `function_calling = "none"` — without this, the model gets the native FC signal and hallucinates tool calls

### Upstream feedback

Filed as issue [#26823](https://github.com/open-webui/open-webui/issues/26823).
Closed by maintainer Classic298 with the explanation that `function_calling:
native` is the intended default (not a bug). The `base_model_id` empty-string
behavior was not addressed. Issue closed — not worth reopening.

## `{}` Empty Response Bug (Qwen3 + LiteLLM + Open WebUI)

**Symptom:** Model returns empty `{}` in the chat instead of text.

**Root cause:** Pipeline bug (Mechanism 1 above) — registered builtin tools
cause dropped stream chunks. Additionally, Qwen3's `reasoning_tags` output
causes Open WebUI's handler to drop subsequent `content` chunks (Open WebUI
issue #24697).

**Fixes applied (both required):**
```python
# In model params:
params['tool_choice'] = 'none'
params['reasoning_tags'] = False
params['think'] = False

# In model capabilities:
meta['capabilities']['builtin_tools'] = False
meta['capabilities']['code_interpreter'] = False
meta['capabilities']['terminal'] = False
meta['capabilities']['web_search'] = False
```
