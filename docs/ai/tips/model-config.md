---
type: Tips
title: "Tips — Modell-Konfiguration (Capabilities und Parameters)"
description: "meta.capabilities, params und bewährte Presets."
tags: [ki-kustodiat, tips, model-config]
generated: { by: opencode/knowledge-persistence, at: 2026-11-07T21:21:36Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:21:36Z }
status: stable
---

## Model Capabilities (meta.capabilities)

Edit the `meta` JSON column on the `model` table:

```python
meta = json.loads(row[1])
meta['capabilities']['web_search'] = True         # show/hide globe icon
meta['capabilities']['builtin_tools'] = False      # internal tools (write_note, etc.)
meta['capabilities']['code_interpreter'] = False
meta['capabilities']['terminal'] = False
meta['capabilities']['image_generation'] = False
meta['capabilities']['citations'] = True
meta['capabilities']['vision'] = True
meta['capabilities']['file_upload'] = True
db.execute('UPDATE model SET meta=? WHERE id=?', (json.dumps(meta), 'qwen3:4b'))
db.commit()
```

Changes take effect after restarting the container:
```bash
sudo docker compose -f /opt/litellm/compose.yaml restart open-webui
```

## Model Parameters (params)

Edit the `params` JSON column on the `model` table:

```python
params = json.loads(row[0])
params['tool_choice'] = 'none'              # prevent model from calling ANY tool
params['function_calling'] = 'none'         # tell Open WebUI the model cannot do FC
params['function_calling'] = 'native'       # enable native FC (let model call tools)
params['reasoning_tags'] = False            # hide thinking/section tags
params['think'] = False                     # disable Qwen3 thinking blocks
params['max_tokens'] = 58579                # token limit
db.execute('UPDATE model SET params=? WHERE id=?', (json.dumps(params), 'qwen3:4b'))
db.commit()
```

### Common param presets

**Locked-down mode (text only, no tools, no thinking):**
```json
{"function_calling": "none", "tool_choice": "none", "reasoning_tags": false, "max_tokens": 58579, "think": false}
```

**FC enabled, only web_search available (Thinking + Search, verifiziert 2026-09-17):**
```json
{"function_calling": "native", "think": true, "reasoning_tags": false, "max_tokens": 38912}
```
(Also requires `capabilities.web_search=true`, `capabilities.builtin_tools=true` + `meta.builtinTools`-Gating. ACHTUNG: `reasoning_tags=true` killt die Tool-Injektion — siehe PITFALLS.)

**Legacy FC mode (prompt injection instead of native template):**
```json
{"function_calling": "legacy", "max_tokens": 58579}
```
(Deprecated since v0.10.0, no new features/fixes — but useful for models that hallucinate with native FC)
