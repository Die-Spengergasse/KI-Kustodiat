# CONVENTIONS — KI-Kustodiat

## Sprache
- README und README-sichtbare Dokumentation: Deutsch
- Code, Konfiguration, Issues, AGENTS.md: Englisch
- docs/ai/ knowledge files: Deutsch

## Website (`website/`)
- **Ansprache: durchgehend informell (Du)** — auf der Startseite *und* allen Unterseiten
  (`website/content/*.md`). Kein „Sie/Ihre/Ihnen".
- Unterseiten sind Markdown und werden im Browser gerendert; **keine externen Ladevorgänge**
  (Pico/marked lokal unter `website/vendor/`, Logo unter `website/assets/`).
- Die Seiten `status.md`, `milestones.md`, `plan.md` (Skill `update-homepage`) und
  `angebote.md` (Skill `update-offers`) sind **generiert** — die Du-Anrede gehört in die
  Skills, sonst geht sie beim nächsten Lauf verloren.

## Kommunikation
- Issues in Englisch (für GitHub-Community)
- Schulintern Deutsch

## Git
- Jeder Commit referenziert ein Issue (#N)
- issue-workflow Skill verwenden
- trunk-based development (main)

## LLM-Stack (gregor — `/opt/litellm/`)
- Containers-Konfiguration lebt unter `/opt/litellm/` (`compose.yaml`, `config.yaml`, `single_gpu_guard.py`, `models_proxy.py`, `.env`, `pgdata/`, `data/`, `cache/`). Repo-Backups unter `KI-Kustodiat-intern:litellm/`, `KI-Kustodiat-intern:ollama/`, `KI-Kustodiat-intern:openwebui/`, `KI-Kustodiat-intern:whisper/`. Migration auf die Management-VM = `rsync -a /opt/litellm <vm>:` + `docker compose up -d` — keine Config-Edits nötig.
- **gregor hat Schulnetz-DNS:** `gregor.kik.htl-wien5.schule` (→ `<LAN_IP_GREGOR>`, Kurzname `gregor.kik` über die Suchdomäne `htl-wien5.schule`) — löst **nur im Schulnetz** (auch in Docker-Containern auf gregor, verifiziert 2026-10-19). Für Schulklienten (Open WebUI, opencode-Overlays) ist der DNS-Name die stabile Adresse (gregors LAN-IP ist DHCP). Im VPN existiert **kein** DNS-Eintrag — die VPN-IP `<WG_IP_GREGOR>` (aus `KI-Kustodiat-intern:infra/hosts/secrets.local.md`, temporär/DHCP) nur für Admin-Zugriff. **NIE `<TOTE_VPN_IP_2026-07>` verwenden** (tote IP von 2026-07). Bei VPN-IP-Wechsel DIESE Stellen synchron pflegen: `/opt/litellm/.env` (`LITELLM_PUBLIC_URL`), `~/.config/opencode/opencode.json` (`provider.litellm.options.baseURL` — Reserve-Provider), `~/.bash_aliases` (`OPENCODE_MODELS_URL`), LiteLLM-DB (`LiteLLM_ProxyModelTable.api_base`), Repo-Vorlagen (`KI-Kustodiat-intern:litellm/.env.example`, `KI-Kustodiat-intern:litellm/opencode.json.example`, `KI-Kustodiat-intern:litellm/opencode-env.sh`, `KI-Kustodiat-intern:litellm/models_proxy.py`, `KI-Kustodiat-intern:litellm/README.md`). **SearXNG gehört NICHT mehr in diese Liste** (seit 2026-10-19, #36): Schulklienten nutzen `http://gregor.kik` (Schulnetz-DNS), nicht die VPN-IP.
- `api_base` in LiteLLM `config.yaml` IMMER als gregors WireGuard-IP `http://<WG_IP_GREGOR>:11435` angeben (IP aus `KI-Kustodiat-intern:infra/hosts/secrets.local.md`; siehe obige Sync-Regel), nie `127.0.0.1`.
- Secrets (Master/Salt/Proxy/Opencode-Keys, Postgres-PW) in `/opt/litellm/.env` — niemals committen.
- opencode.json `provider`-Eintrag für kataloggestützte Provider: nur `{ "options": { "baseURL", "apiKey" } }` — KEIN `models`/`npm`/`name` (der models.dev-Katalog liefert beides). Discovery-Source = `OPENCODE_MODELS_URL=http://<WG_IP_GREGOR>:11436` (IP aus `KI-Kustodiat-intern:infra/hosts/secrets.local.md`) in `~/.bash_aliases` (später shared).
- opencode-Direkt-Provider `ollama-direct` (Stand 2026-09-17, Issue #18): umgeht den LiteLLM-Streaming-Tool-Call-Bug — `npm: @ai-sdk/openai-compatible`, `baseURL=http://<WG_IP_GREGOR>:11435/v1`, Dummy-`apiKey`, manuelle `models`-Map der lokalen Tags (OHNE whisper-1, Ollama kann kein STT), Default-`model: ollama-direct/qwen3:8b`. `KI-Kustodiat-intern:litellm/*` bleibt als Fallback (bewachte Pfade, Whisper/GROQ künftig). Direkt-Map bei Modellwechsel von Hand pflegen. **Direkt-Traffic ist für SingleGpuGuard unsichtbar** — ein Ding zur Zeit, sonst OOM (8B + Whisper schließen sich aus).
- Models-proxy-Kette verstehen: Ollama → LiteLLM-DB (`LiteLLM_ProxyModelTable`) → models-proxy `/api.json` (`:11436`) → OpenCode-Disk-Cache (`~/.cache/opencode/models*.json`, serviert unconditionally, Refresh nur bei Fehlschlag). Stale Modelllist = entweder DB stale ODER Cache stale — beide prüfen (Details in TIPS.md).
- Neues Modell anlegen: `ollama pull`/`create` + Eintrag in LiteLLM-Postgres (`LiteLLM_ProxyModelTable`, `store_model_in_db=true`) + Eintrag in Open WebUI SQLite (`model` table, `base_model_id = NULL`!) + `docker compose restart litellm`. **Achtung:** `base_model_id` MUSS `NULL` sein, nicht `''` — sonst werden Capabilities silently ignored (siehe `docs/ai/TIPS.md`).
- Kontextoverride: dafür einen eigenen ollama-Tag (`ollama create <name>-128k -f Modelfile` mit `PARAMETER num_ctx`) + LiteLLM-Eintrag anlegen. Nicht denselben ollama-Manifest zweimal in LiteLLM listen — `/v1/models` dedupliziert (Alias-Tags sind verwirrend).
- Single-GPU-Residency-Regel wird client-agnostisch in LiteLLM (SingleGpuGuard) durchgesetzt, nicht pro Client. Clients kricken bei Konflikt ein 429 (Retry-After 5).
- **Open WebUI-Auth ist LDAP-only** (Issue #22): `ui.enable_login_form=false`, lokales Admin-Passwort neutralisiert (Zufalls-bcrypt, `auth.active=1`). Nicht reaktivieren. Recovery nur durch einen Admin (kein SMTP/Reset).
- **Open WebUI LDAP = search-then-bind** (kein Direct-Bind): Service-Account `ldap.server.app_dn`/`app_password` ist Pflicht (dieser AD verbietet anonymes Lesen). `attribute_for_username=sAMAccountName`; `search_filter` ist ein **Zusatzfilter** und darf kein `{{login}}` enthalten; search base `OU=Automatisch gewartete Benutzer,OU=Benutzer,OU=SPG,DC=htl-wien5,DC=schule`.
- **Open WebUI-Config lebt in der DB** (`/opt/litellm/open-webui-data/webui.db`, Tabelle `config`, JSON-Werte): `Config.get` liest pro Request → DB-Direct-Edits wirken **ohne Container-Restart**; die `compose.yaml`-env-Vars (`ENABLE_LDAP`, `LDAP_*`, `LDAP_APP_PASSWORD: ${LDAP_APP_PASSWORD}`) seeden nur ein Fresh-Deploy. `WEBUI_AUTH_TYPE`/`LDAP_BASE_DN` sind in v0.11.4 **No-Ops** — nicht verwenden. LDAP-Secret in `/opt/litellm/.env` (chmod 600), nie im Repo. **Ausnahme:** `audio.stt.*` wird beim Start in Memory geladen → nach STT-DB-Edit `restart open-webui`.
- **Stand 2026-10-07 (Ollama aus, LiteLLM gestoppt):** Die Ollama/LiteLLM-Regeln oben (Zeilen `api_base`, opencode-Provider, Models-proxy-Kette, Guard-429) sind suspendiert, nicht gelöscht — sie gelten wieder bei Reaktivierung (`KI-Kustodiat-intern:whisper/README.md`). Solange gilt: STT direkt (`http://whisper:9000/v1` per Container-DNS, `WHISPER_API_KEY`), Chat per BYOK (`direct.enable=true`), `:3000` Klartext (TLS extern).
- **Implementationsdetails immer ins private Repo (#37):** Compose-Files, systemd-Units, nginx-vhosts, Modelfiles, Env-Templates und Host-Inventare leben ausschließlich in `KI-Kustodiat-intern` (`infra/`, `litellm/`, `ollama/`, `openwebui/`, `searxng/`, `whisper/`). Dieses Repo dokumentiert das *Konzept* und verweist mit der Notation `KI-Kustodiat-intern:<pfad>` — nie Dateien duplizieren, nie Configs hier neu anlegen.
- **Private Operator-Hardware bleibt hier namenlos (2026-10-26, #40):** Eigene Rechner des Kustoden (privates VPN, private Suchinstanz, private Clients) werden im öffentlichen Repo weder beim Namen noch per URL/IP geführt — nur neutral als „private Operator-Instanz / private Operator-Hosts (extern)". Hostnamen, IPs und Credentials leben ausschließlich intern (`KI-Kustodiat-intern:infra/hosts/secrets.local.md`) oder im persönlichen SVN. IPs von Schul-Hosts ebenso: hier nur Hostname/Platzhalter (`<WG_IP_GREGOR>`, `<LAN_IP_GREGOR>`), den Wert zur Task-Zeit aus `secrets.local.md` auflösen.
- **Website-Deploy auf kik braucht das sudo-rsync-Rezept (#39/intern #5):** `rsync -az --rsync-path="sudo -n rsync" -e ssh website/ kik:/var/www/kik/`, danach `ssh kik 'sudo -n chown -R www-data:www-data /var/www/kik'`. `vendor/` gehört `www-data`, ohne das Flag bricht rsync bei diesen Dateien ab und lässt den Rest halb ausgerollt. Die Seite ist statisch → Rollout ist sofort live (Browser ggf. Hard-Reload).
- **CSS-Sichtbarkeit von Varianten immer mit gleicher Spezifität setzen:** Bei mehreren Varianten desselben Elements (z. B. Logo hell/dunkel) `display`-Regeln als `<container> <element>.<variante>` schreiben — eine bloße `.variante { display:none }` verliert gegen eine Basisregel wie `.logo img { display:block }`, weil die Basis spezifischer ist.
