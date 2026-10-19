# Architecture

Living structural map of the system as of 2026-10-07.

## Overview

On-premise Infrastruktur für die Spengergasse. Single-GPU-Host **gregor**
(RTX 2070 SUPER, 8 GB VRAM) — Stand 2026-10-07: **GPU exklusiv für Whisper**
(`large-v3`, ~3,9 GB VRAM, dauerhaft). **Ollama deaktiviert** (`systemctl
disable ollama`, kein lokales LLM); **LiteLLM + Postgres + models-proxy
gestoppt** (Reserve, Reaktivierung in `KI-Kustodiat-intern:whisper/README.md` dokumentiert).
Open WebUI (`:3000`, Klartext hinter ZID-SSL-nginx) spricht Whisper **direkt**
an (`http://whisper:9000/v1`); Chat-LLM kommt per BYOK vom User
(`direct.enable=true`, z. B. DeepSeek-Token). SearXNG (`:80`, Schulnetz-DNS
`gregor.kik` → `10.50.11.10`) bleibt Search-Backend für Tool-Calls FC-fähiger BYOK-Modelle.
**Instanz-Trennung (2026-10-19, #36):** dies ist die *Schul*-Instanz; die
private Instanz des Operators (claw) ist ein getrenntes System (kein
Cross-Fallback). SingleGpuGuard ist mit
gestopptem LiteLLM inaktiv (ohnehin STT-inkompatibel — gated nur
completion/embeddings, keine Transkription).

## Why LiteLLM?

Auf gregor (Single-GPU Dev-Box) ist LiteLLM streng genommen Overhead —
Open WebUI könnte direkt auf ollama zugreifen. Zwei Gründe rechtfertigen
den Proxy heute:

1. **SingleGpuGuard** — erzwingt Single-Model-Residency auf der 8 GB GPU.
   Ohne den Guard könnten whisper + LLM gleichzeitig laden → OOM. Das ist
   der Killer-Faktor für die aktuelle Hardware.
2. **models.dev-Proxy** — speist die LiteLLM-Modelle in den opencode-Picker
   ein (`OPENCODE_MODELS_URL`). Ohne LiteLLM kein opencode-Discovery.

Für die Produktions-Deployment (2600 Schüler, mehrere Backends) wird
LiteLLM unverzichtbar: Virtual Keys + Budgets (Issue #6), Rate Limiting,
Multi-Backend-Routing, Audit Logging, Model-Access-Groups.

Ohne LiteLLM: Ollama → Open WebUI (1 Hop, einfacher).
Mit LiteLLM: Ollama → LiteLLM → Open WebUI (3 Hops, aber Guard + Auth + Routing).

```
                  ┌─────────────────────────────────────────────┐
   Clients        │  opencode (TUI) / Open WebUI / API-Clients   │
   (Schulnetz     │  OPENCODE_MODELS_URL=<WG_IP_GREGOR>:11436     │
    + VPN)        └──────────────────┬──────────────────────────┘
                                          │  :11434  Bearer <virtual-key>
         ┌────────────────────────────────┴───────────────────────────┐
         │  gregor (<WG_IP_GREGOR>)                                      │
         │                                                              │
         │  ┌─────────────────┐  /v1/chat/completions  ┌──────────────┐ │
         │  │ LiteLLM :11434  │ ───────────────────►  │ ollama :11435│ │
         │  │ + Postgres 16   │   SingleGpuGuard:      │ MAX_LOADED=  │ │
         │  │ + catalog-proxy │   busy→429/ idle→swap   │ 1            │ │
         │  │   Key :11436    │                        │ KEEP_ALIVE=  │ │
         │  │ + Open WebUI    │                        │ -1           │ │
         │  │   :3000         │                        └──────────────┘ │
         │  │ + whisper :11437│                                         │
         │  └────────▲────────┘                                         │
         │           │ /v1/models                                       │
         │           └──────► models-proxy injiziert litellm-Provider   │
         │                    in upstream models.dev-Katalog           │
         └──────────────────────────────────────────────────────────────┘
```

## Komponenten auf gregor (`/opt/litellm/`)

| Datei/Dienst | Zweck | Repo-Pfad |
|---|---|---|
| `compose.yaml` | docker-compose: services litellm + db (Postgres 16) + models-proxy + open-webui + whisper | `KI-Kustodiat-intern:litellm/compose.yaml` |
| `config.yaml` | LiteLLM Framework-Settings (callbacks, request_timeout, master_key/db_url via env). `model_list` leer — Modelle in Postgres DB (`store_model_in_db=true`) | `KI-Kustodiat-intern:litellm/config.yaml` |
| `single_gpu_guard.py` | Custom CustomLogger-Plugin: per-backend (api_base) Single-Residency-Regel, litellm_call_id-Matching | `KI-Kustodiat-intern:litellm/single_gpu_guard.py` |
| `models_proxy.py` | HTTP-Server :8000: GET /api.json = upstream models.dev + litellm-Provider (Modelle aus LiteLLM /v1/models); UA-Fix wg. Cloudflare 403 | `KI-Kustodiat-intern:litellm/models_proxy.py` |
| `open-webui-data/` | Open WebUI SQLite DB (`webui.db`), vector_db, uploads, cache | — (nicht im Repo) |
| `.env` | LITELLM_MASTER_KEY / SALT_KEY / POSTGRES_PASSWORD / DATABASE_URL / LITELLM_PROXY_KEY / LITELLM_PUBLIC_URL | `KI-Kustodiat-intern:litellm/.env.example` (Template) |
| `pgdata/` | bind-mount Postgres-Daten (portabel) | — (nicht im Repo) |
| `data/` | LiteLLM guard.log etc. | — (nicht im Repo) |
| `cache/` | Proxy-Disk-Cache — Resilienz bei Proxy/Upstream-Ausfall | — (nicht im Repo) |
| Modelfiles | Tuned Modelfiles: qwen3:1.7b, qwen2.5-coder:3b, llama3.2:3b (24K ctx, "Do NOT use tools") | `KI-Kustodiat-intern:ollama/Modelfile.*` |
| `ollama.service` | systemd unit: `OLLAMA_KV_CACHE_TYPE=q8_0`, `MAX_LOADED_MODELS=1`, `KEEP_ALIVE=-1`, `FLASH_ATTENTION=1` | `KI-Kustodiat-intern:ollama/ollama.service` |
| Service-Handbücher | README.md pro Service mit Konfiguration, Kommandos, Troubleshooting | `KI-Kustodiat-intern:ollama/`, `KI-Kustodiat-intern:litellm/`, `KI-Kustodiat-intern:openwebui/`, `KI-Kustodiat-intern:whisper/` |

## Directory-Struktur (Repository)

```
KI-Kustodiat/  (public — Konzeptdoku & Wissensbasis)
├── docs/ai/                    # Wissensbasis (TIPS, DECISIONS, PITFALLS, etc.)
├── docs/Recherche/             # Recherche-Referenzen (Provider-Anfragen, Cortecs-Evaluation, Kalkulation)
├── docs/extern/                # Außenkommunikation
│   ├── llm-provider-rundmail-TODO/   # offene Provider-Drafts (01→06, Sende-Reihenfolge)
│   ├── mail-archiv-sent/             # gesendete Mails + Archiv-Konvention (README)
│   ├── bbg-hardware-anfrage-email-draft.md
│   └── pup-priglinger/               # KI-Kursangebot-Anfrage
├── docs/praesentation/         # Slides; archiv/<YYYY-MM-DD>-<anlass>/ je Vortrag
├── website/, pages/      # öffentliche Homepage
├── scripts/              # Job-Runner für die Website
└── .github/workflows/    # GitHub Pages deploy

KI-Kustodiat-intern/  (private — alle Implementationsdetails)
├── infra/hosts/          # <hostname>.md per host + secrets.local.md (git-ignored)
├── infra/nginx/          # vhost-Configs
├── infra/opencode/       # opencode-Provider-Overlay
├── infra/systemd/        # systemd-Units + Timer
├── litellm/              # LiteLLM Handbuch + compose.yaml + config.yaml + plugins
├── ollama/               # Ollama Handbuch + Modelfiles + systemd unit
├── openwebui/            # Open WebUI Handbuch
├── searxng/              # SearXNG compose + settings.yml + limiter.toml
└── whisper/              # Whisper Handbuch
```

> **Migration 2026-10-19 (public #37 / intern #4):** die Ordner `infra/`,
> `litellm/`, `ollama/`, `openwebui/`, `searxng/`, `whisper/` wurden ins
> private Schwester-Repo verschoben. Implementationsdetails gehören ab jetzt
> **immer** dorthin; dieses Repo verweist nur noch (Syntax:
> `KI-Kustodiat-intern:<pfad>`).

## Website & Veröffentlichung

| Artefakt | Quelle | Auslieferung |
|---|---|---|
| Offizielle Website `https://kik.spengergasse.at` | `website/` (Shell + `content/*.md` via Hash-Router, Pico/marked lokal vendored) | `rsync` auf kik → `/var/www/kik` (nginx, statisch) |
| GitHub Pages | `pages/index.html` — **nur** ein Button »Hier geht's zur offiziellen Website« + `<link rel="canonical">` (#38) | `.github/workflows/deploy-pages.yml` |
| Angebots-Job | `scripts/run-offers-job.sh` + Skill `update-offers` | systemd-Timer auf kik, Mo 06:00 |

Deploy-Rezept und kik-Zugang (SSH nur über den gregor-Jump-Host):
`KI-Kustodiat-intern:infra/hosts/kik.md`.

## Knowledge Files (`docs/ai/`)

| File | Purpose | Update mode |
|------|---------|-------------|
| HANDOFF.md | Offene Aufgaben für nächste Sitzung | Overwrite |
| DECISIONS.md | Aktive Entscheidungen | Append; superseded → HISTORY.md |
| ARCHITECTURE.md | Living structural map | Overwrite |
| CONVENTIONS.md | Laufende Regeln zur Befolgung | Append |
| PITFALLS.md | Fallstricke und nicht-offensichtliche Fehler | Append |
| DOMAIN.md | Domänenregeln (Schule + Modell-Spezifika) | Append |
| STATE.md | Aktueller Projektstatus | Overwrite |
| HISTORY.md | Archiv superseded Einträge (append-only) | Append-only |

## Data Flows

- STT: Browser (via ZID-HTTPS-Front) → Open WebUI `:3000` → Whisper `whisper:9000` direkt (`WHISPER_API_KEY`) → GPU. Kein LiteLLM-Hop. Reserve-Pfad via LiteLLM (`:11434` → `whisper-1`/`groq-whisper`) dokumentiert, derzeit gestoppt.
- Chat: Browser → Open WebUI `:3000` → BYOK-Modell-API direkt (User-Key, `direct.enable=true`) — kein lokaler Hop. Tool-Calls (`search_web`) → SearXNG (`gregor.kik:80`, Schul-Instanz — Instanz-Trennung #36, kein Fallback auf die private Instanz des Operators) → Antwort.
- Login: Open WebUI `:3000` → LDAPS `ldap.spengergasse.at:636` (LDAP-only, Issue #22).
- Reaktivierung LiteLLM: `up -d litellm db models-proxy` + Deployment-Rows prüfen + Open-WebUI-Base zurück auf `http://litellm:11434/v1` (siehe `KI-Kustodiat-intern:whisper/README.md`).

## Known Gaps (siehe PITFALLS.md / DECISIONS.md)

- BYOK-Keys liegen am Server (Backend macht die Requests) — kein Client-only-BYOK; DeepSeek-direkt = Tier-4-DSGVO (China), Eigenverantwortung des Key-Inhabers.
- LiteLLM-Chat-Rows + Open-WebUI-`model`-Rows lokaler LLMs sind Karteileichen (Ollama aus) — ausblenden oder als tot dokumentieren.
- Mic braucht externen Secure Context (ZID-TLS) — intern bleibt `:3000` Klartext (by design).