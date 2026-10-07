# Whisper — Speech-to-Text (STT)

Whisper läuft als Docker-Container auf gregor und transkribiert
Sprachnachrichten für Open WebUI.

> **Stand 2026-10-07: Whisper ist der einzige GPU-Dienst auf gregor**
> (`large-v3`, dauerhaft, `restart: unless-stopped`). Ollama ist
> deaktiviert (`systemctl disable ollama`), LiteLLM + Postgres +
> models-proxy sind gestoppt (Reserve, siehe unten). Open WebUI spricht
> Whisper **direkt** an (`http://whisper:9000/v1`), ohne LiteLLM-Hop.
> GROQ-Rotation bleibt als dokumentierte Reserve erhalten.

## Service

| Eigenschaft | Wert |
|-------------|------|
| Container | `whisper` (Docker, `hwdsl2/whisper-server:cuda`) |
| Port | `:11437` (→ Container `:9000`) |
| Model | `large-v3` |
| Device | CUDA (GPU) |
| Compute Type | `float16` |
| Language | `auto` (Autodetect pro Request; `verbose_json` liefert `language` + `language_probability`; per-Request-`language` gewinnt immer) |
| VRAM | ~3.9 GB |

## Konfiguration (compose.yaml)

```yaml
whisper:
  image: hwdsl2/whisper-server:cuda
  environment:
    WHISPER_MODEL: large-v3
    WHISPER_DEVICE: cuda
    WHISPER_COMPUTE_TYPE: float16
    WHISPER_LANGUAGE: de
    WHISPER_BEAM: 5
    WHISPER_API_KEY: ${WHISPER_API_KEY}
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: all
            capabilities: [gpu]
```

## VRAM-Impact

Whisper belegt **~3.9 GB** der 8 GB GPU. Das limitiert die Größe des
parallel laufbaren LLM-Modells deutlich:

```
8 GB GPU
├── whisper:  3.9 GB
├── LLM:      ~2.8 GB (max 1.7-3B Modell mit 24K Kontext)
├── Overhead: 0.5 GB
└── Frei:     ~0.8 GB
```

SingleGpuGuard in LiteLLM stellt sicher, dass whisper und LLM nicht
gleichzeitig geladen werden (OOM-Schutz).

## Migration zu Groq Cloud mit Token-Rotation (Issue #21, Stand 2026-09-17)

GROQ bietet `whisper-large-v3` kostenlos (Free-Tier). Schüler generieren
einzeln ihre GROQ-API-Keys; der LiteLLM-Router rotiert/last-balanciert über
alle Keys (Cooldown bei 429). Open WebUI sieht nur EINEN Key (den
LiteLLM-Key) — Rotation ist für den Client unsichtbar.

### Status

- **2026-09-17: erster Key aktiv** — Deployment-Row `groq-stt-georg`
  (Georgs GROQ-Key, gleicher Key wie STT im OpenCode-Telegram-Pod
  `oc-tg-bot-gregor` — bewusst geteilt, solange Free-Tier-Ratelimit reicht).
  Open WebUI `audio.stt.model=groq-whisper` gesetzt (Config-DB), e2e via
  `POST /v1/audio/transcriptions` verifiziert.
- **Georgs Key entfernen, sobald ~2 Dutzend Schüler-Keys rotieren** (Free-Tier
  teilt sich sonst Telegram-Bot-STT + WebUI-STT): `DELETE FROM
  "LiteLLM_ProxyModelTable" WHERE model_id='groq-stt-georg';` + `docker
  compose restart litellm`.

### Setup (ein Deployment pro Key)

1. **LiteLLM-DB: ein Deployment pro Key** (`/opt/litellm`-Postgres, Tabelle
   `LiteLLM_ProxyModelTable`; via LiteLLM-UI oder SQL). Tabelle hat
   `created_at/updated_at` als TIMESTAMP (Default CURRENT_TIMESTAMP) und
   `created_by/updated_by` als NOT NULL — v1.101.0:

   ```sql
   INSERT INTO "LiteLLM_ProxyModelTable"
     (model_id, model_name, litellm_params, model_info, created_by, updated_by)
   VALUES
     ('groq-stt-<schueler-n>', 'groq-whisper',
      '{"model": "groq/whisper-large-v3", "api_key": "<GROQ_KEY_SCHUELER_N>"}',
      '{}', 'admin', 'admin');
   ```

   Der Router load-balanced automatisch über alle Deployments mit demselben
   `model_name` und Cooldown'ed Keys mit 429s. Danach `docker compose restart
   litellm` (DB-Mode: Restart füllt den Key-Cache).

2. **Open WebUI umstellen** (Admin Panel → Settings → Audio oder direkt
   config-DB, ConfigVar-Präzedenz beachten):
   - `audio.stt.engine` = `openai` (bleibt)
   - `audio.stt.openai.api_base_url` = `http://litellm:11434/v1` (bleibt)
   - `audio.stt.model` = `groq-whisper`
   - Key: bestehender `LITELLM_PROXY_KEY` (bleibt)

3. **Verifikation**: Mikrofon-Button in Open WebUI → Sprachnachricht →
   Transkript; LiteLLM-Logs zeigen das rotierende Deployment.

### Rollout / Rückbau

- Keys nachliefern: nur Schritt 1 wiederholen (Neue Deployment-Rows), kein
  Open-WebUI-Eingriff, kein Restart nötig.
- Key-Tausch (Schüler widerruft): Deployment-Row löschen.
- **Rückweg zu lokalem Whisper** (DSGVO-Fallback): `docker compose up -d
  whisper` + DB-INSERT laut PITFALLS.md (Whisper-Restore-Anleitung) +
  `audio.stt.model` = `whisper-1`.

### Direkt-Modus ohne LiteLLM (Stand 2026-10-07, aktiv)

Open WebUI spricht Whisper direkt an — kein LiteLLM-Hop:

- `audio.stt.openai.api_base_url` = `http://whisper:9000/v1` (Container-DNS)
- `audio.stt.model` = `whisper-1`
- Key: `WHISPER_API_KEY` aus `/opt/litellm/.env`
- Nach DB-Edit `docker compose restart open-webui`
  (`audio.stt.*` wird beim Start in Memory geladen).

### LiteLLM-Reaktivierung (Reserve, gestoppt 2026-10-07)

`litellm`, `db`, `models-proxy` sind nur gestoppt (`stop`, nicht `down`):

```bash
cd /opt/litellm
sudo docker compose up -d litellm db models-proxy
# whisper-1-Row + groq-stt-*-Rows laut PITFALLS.md prüfen/neu anlegen
sudo docker compose restart litellm
```

Danach Open-WebUI-Base zurück auf `http://litellm:11434/v1` mit
`LITELLM_PROXY_KEY` + `restart open-webui`. Dieser Pfad ist nötig, sobald
GROQ-Fallback oder Key-Rotation wieder gebraucht werden (direkt angebundenes
Whisper kennt nur einen Key und kein Failover).

### DSGVO

Schüler-Stimmdaten gehen über GROQ in die USA (Free-Tier, Zero-Retention
klären). Bewusste Entscheidung (Issue #21): STT ist freiwilliges Feature;
lokales Whisper bleibt Restore-Option. Für DSGVO-kritische Last bleibt
On-Prem das Ziel (Issue #2/#5/#7).
