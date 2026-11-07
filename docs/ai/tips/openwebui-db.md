---
type: Tips
title: "Tips — Open WebUI Datenbank"
description: "SQLite-Zugriff, Admin-Konten und Schlüsseltabellen."
tags: [ki-kustodiat, tips, openwebui-db]
generated: { by: opencode/knowledge-persistence, at: 2026-11-07T21:21:36Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:21:36Z }
status: stable
---

## Open WebUI Database

### Location
- **Host path:** `/opt/litellm/open-webui-data/webui.db` (SQLite)
- **Container path:** `/app/backend/data/webui.db`

### Access via Python (sudo needed, file is root-owned)
```python
sudo python3 -c "
import sqlite3, json
db = sqlite3.connect('/opt/litellm/open-webui-data/webui.db')
# ... queries ...
db.close()
"
```

### Admin accounts (Issue #21)

Current admin list (SQL, verifiable anytime):
```python
sudo python3 -c "
import sqlite3
db = sqlite3.connect('/opt/litellm/open-webui-data/webui.db')
for r in db.execute(\"SELECT email, name, role FROM user WHERE role='admin'\"):
    print(r)
db.close()"
```

**Promotion workflow (LDAP/AD users):** the `user` row only exists AFTER the
first login (created on signup from the LDAP bind). Pre-creating AD users
via SQL is not feasible (internal ids mismatch). So:

1. New admin logs in once via LDAP (username = part before `@spengergasse.at`).
2. Admin Panel → Users → search by that username → set role `admin`.
   (Or SQL: `UPDATE user SET role='admin' WHERE username='<sname>';`)

Baseline (2026-09-17): exactly one admin — `grafg` (Georg Graf).

### Key Tables

#### `model` — one row per model in the catalog
Columns: `id` (model ID), `params` (JSON), `meta` (JSON), `base_model_id`, `name`, ...

```python
row = db.execute('SELECT params, meta FROM model WHERE id=?', ('qwen3:4b',)).fetchone()
params = json.loads(row[0])  # {"tool_choice": "none", "reasoning_tags": false, ...}
meta = json.loads(row[1])    # {"capabilities": {...}, "profile_image_url": "...", ...}
```

#### `config` — all Open WebUI settings (key-value)
Columns: `key` (str), `value` (JSON string), `updated_at`

```python
rows = db.execute('SELECT key, value FROM config').fetchall()
```

Keys matching `web.search.*` control web search. Keys matching `rag.*` control RAG pipeline.

### Access from Docker (alternative)
```bash
docker exec open-webui sqlite3 /app/backend/data/webui.db "SELECT ..."
```
(Only works if the container has `sqlite3` installed.)
