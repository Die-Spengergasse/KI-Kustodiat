# Open WebUI — Chat Frontend

Open WebUI läuft als Docker-Container auf gregor und ist das
user-facing Chat-Interface für Schüler und Lehrer.

## Service

| Eigenschaft | Wert |
|-------------|------|
| Container | `open-webui` (Docker, `ghcr.io/open-webui/open-webui:v0.11.4`, digest-gepinnt) |
| Port | `:3000` (→ Container `:8080`) |
| Auth | **LDAP-only** gegen `ldap.spengergasse.at:636` (Schul-AD, Service-Account-Bind) |
| Backend | Whisper direkt (`http://whisper:9000/v1`); Chat-Modelle per BYOK (Direct Connections, z. B. DeepSeek-Token) — kein lokales LLM (Ollama deaktiviert 2026-10-07) |
| STT | Lokal (whisper `:11437`, `large-v3`, direkt angebunden); GROQ-Rotation als dokumentierte Reserve via LiteLLM (derzeit gestoppt) |
| DB | SQLite: `/opt/litellm/open-webui-data/webui.db` |

## Modellauswahl

Open WebUI zeigt alle Modelle aus LiteLLM `/v1/models`. Aktuell:

| Modell | Quelle | Zweck |
|--------|--------|-------|
| `qwen3:1.7b` | lokal (ollama via LiteLLM) | General Chat |
| `qwen2.5-coder:3b` | lokal | Coding |
| `llama3.2:3b` | lokal | General Chat (Alternative) |
| `whisper-1` | lokal (whisper via LiteLLM) | STT (Speech-to-Text) |

**Geplant:** Cloud-Modelle (OpenCode Zen Big Pickle, Groq Llama 70B, DeepSeek)

## Model-Capabilities konfigurieren

**Kritisch:** Siehe `docs/ai/TIPS.md` für die vollständige Erklärung.

### Pro Modell erforderlich (in Open WebUI SQLite DB):

**1. `base_model_id = NULL` (nicht `''`!)**

```sql
-- Prüfen
SELECT id, base_model_id FROM model;
-- Fixen
UPDATE model SET base_model_id = NULL WHERE base_model_id = '';
```

Ohne `NULL` werden alle Capabilities/Params **silently ignored**.

**2. Params (`model.params` JSON):**

```json
{
  "function_calling": "none",
  "tool_choice": "none",
  "max_tokens": 58579
}
```

Für Qwen3 zusätzlich: `"reasoning_tags": false, "think": false`

**3. Capabilities (`model.meta.capabilities`):**

```json
{
  "builtin_tools": false,
  "web_search": false,
  "code_interpreter": false,
  "terminal": false,
  "image_generation": false,
  "citations": true,
  "vision": true,
  "file_upload": true
}
```

### DB direkt bearbeiten

```bash
sudo python3 -c "
import sqlite3, json
db = sqlite3.connect('/opt/litellm/open-webui-data/webui.db')
# ... queries and updates ...
db.close()
"
```

## Web Search / RAG

**Status:** Nicht funktional mit aktuellen kleinen Modellen.

Open WebUI v0.10.2 implementiert Web Search als **native Function Call**,
nicht als automatische Context-Injection. Kleine Modelle (1.7B-3B) können
das `web_search`-Tool nicht zuverlässig aufrufen.

Mit `function_calling: "none"` (unser aktueller Fix) ist Web Search
komplett deaktiviert.

**SearXNG** ist verfügbar unter `https://searxng.claw.graf.priv.at` —
bereit für Nutzung sobald ein größeres Modell (7B+) läuft.

## Audio / STT

Aktuelle Konfiguration (Stand 2026-10-07, Direkt-Modus ohne LiteLLM):
- STT Engine: `openai`
- API Base: `http://whisper:9000/v1` (direkt auf den Whisper-Container)
- Model: `whisper-1`
- Key: `WHISPER_API_KEY` aus `/opt/litellm/.env`

**Reserve (dokumentiert, derzeit gestoppt):** LiteLLM-Router
(`http://litellm:11434/v1`) mit `whisper-1` + `groq-whisper`-Deployments
(Rotation über Schüler-Keys) — siehe `whisper/README.md`
(LiteLLM-Reaktivierung). Vor 2026-10-07 lief STT über LiteLLM mit
GROQ-Fallback; Details in `docs/ai/HISTORY.md`-würdigen HANDOFF-Einträgen.

## LDAP-Auth

**LDAP ist die einzige Login-Methode** (`ui.enable_login_form=false`) — kein lokales
E-Mail-Formular, kein "Continue with Email/LDAP"-Toggle mehr.

| Einstellung (Open-WebUI-DB `config`) | Wert |
|---|---|
| `ldap.enable` | `true` |
| `ldap.server.host` / `port` / `use_tls` | `ldap.spengergasse.at` / `636` / `true` (LDAPS) |
| `ldap.server.attribute_for_username` | `sAMAccountName` (kurzer Loginname, z. B. `grafg`) |
| `ldap.server.attribute_for_mail` | `mail` |
| `ldap.server.users_dn` (search base) | `OU=Automatisch gewartete Benutzer,OU=Benutzer,OU=SPG,DC=htl-wien5,DC=schule` |
| `ldap.server.search_filter` | `(objectClass=user)` |
| `ldap.server.app_dn` | Service-Account DN (siehe unten) |
| `ldap.server.app_password` | **Secret** — nur in der DB bzw. host-lokal; im Repo nur Platzhalter |
| `ui.default_user_role` | `user` (neue AD-User werden automatisch als `user` angelegt) |

**Bind-Account zwingend:** Open WebUI macht *search-then-bind* (App-Bind → Suche → User-Bind
mit dem eingegebenen Passwort). Dieser AD erlaubt **keinen anonymen Read** (anonymer Bind ok,
Suchen liefern 0 Einträge) — ohne Service-Account findet die Suche keinen User. Einen
Direct-Bind-Modus gibt es nicht (verifiziert am Code).

**Wichtig — `search_filter`:** Open WebUI baut den Filter als
`(&(<attribute_for_username>=<login>)(<search_filter>))`. `search_filter` ist ein
*Zusatzfilter* und darf **kein `{{login}}`** enthalten. Der frühere Wert
`(sAMAccountName={{login}})` war literal und ergab nie einen Treffer.

**Admin:** `grafg@spengergasse.at` ist der einzige Admin. Der bestehende lokale Account wird
per `mail` gematcht (LDAP liefert `grafg@spengergasse.at`), die Rolle bleibt erhalten. Das
lokale Passwort ist **neutralisiert** (zufälliger bcrypt-Hash), damit `POST /auths/signin`
nicht mehr lokal authentifiziert. Kein SMTP/Passwort-Reset konfiguriert → Recovery nur durch
einen Admin.

**Kein Container-Restart für Config-Änderungen:** `Config.get`/`get_many` lesen die DB pro
Request, und `/api/config` baut `features.enable_ldap`/`enable_login_form` daraus — DB-Direct-
Edits wirken sofort.

> **Korrektur (2026-09-24, Issue #22):** Der frühere Eintrag „Erst-Login via Schul-AD = Admin"
> war falsch. LDAP war nie funktional (kein Bind-Account, literaler `{{login}}`-Filter,
> `attribute_for_username=uid`). Der „funktionierende" Login war der **lokale** Account
> (`/auths/signin`), dessen Passwort zufällig dem Schulpasswort entsprach.

## HTTPS

**Offen (Issue #14):** Mic-Zugriff benötigt Secure Context (HTTPS).
Caddy oder nginx als Reverse Proxy vor `:3000` geplant.
