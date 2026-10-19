# SearXNG — Schul-Metasuche (gregor)

SearXNG läuft als Docker-Container auf gregor und ist die **schulweite
Metasuche** — Such-Backend für Open-WebUI-Tool-Calls (`search_web`) und
OpenCode-Agent-MCP (`searxng_search`). Im KI-Kustodiat-Kontext ist dies die
*einzige* Suchinstanz: Privatrecherche läuft auf der getrennten, privaten
Instanz des Operators (nicht Teil dieses Repos).

## Rolle der Instanz (nach der Instanz-Trennung, 2026-10-19)

| Eigenschaft | Wert |
|---|---|
| Host | gregor (`/opt/searxng/`) |
| Erreichbarkeit | `http://gregor.kik:80` = `gregor.kik.htl-wien5.schule` (Schulnetz-DNS **nur im Schulnetz auflösbar**, → `10.50.11.10`) — **Primär-Ziel für Schulklienten**; zusätzlich `http://10.8.0.16:80` (Operator-VPN, nur Admin-Zugriff) |
| Auth | **keine** — bewusst offen im Schulnetz/VPN, Absicherung über die Netzgrenze (DECISIONS 2026-09-17; nicht „reparieren") |
| TLS | nein (Prototyp-Betrieb, interne IP) |
| Egress | direkt aus dem Schulnetz (HTL-IP) — **kein Proxy**, keine Abhängigkeit von Operator-Infrastruktur |
| JSON-API | `http://10.50.11.10/search?q=<query>&format=json` |

**Keine privaten Credentials auf diesem Host** — `settings.yml` trägt keinen
Brave-API-Key und keinen GitHub-PAT; `SEARXNG_SECRET` liegt in
`/opt/searxng/.env` (mode 600), nicht im Klartext im Config-File.

## Klienten-Matrix (Instanz-Trennung)

| Host | Kontext | Suchinstanz |
|---|---|---|
| gregor (opencode + Open WebUI) | Schule | `http://gregor.kik`, kein Auth, `SEARXNG_CHAIN=strict` |
| dell (opencode) | Schule | `http://gregor.kik` |
| kik (Angebots-Job, grafg) | Schule | `http://gregor.kik` |
| think / claw / elite (opencode) | privat | private Instanz des Operators (nicht hier) |

Kein Fallback zwischen den Instanzen — fällt eine aus, hat der jeweilige
Kontext vorübergehend keine Suche.

## Service

| Eigenschaft | Wert |
|---|---|
| Container | `searxng` (`docker.io/searxng/searxng:latest`) + `searxng-redis` (`valkey:8-alpine`) |
| Port | `127.0.0.1:8888` → Container `:8080`; nginx `:80` davor |
| Config | `settings.yml`, `limiter.toml` in `./searxng/` (live) |
| Compose | `docker-compose.yaml` (live-Pfad; Repo-Kopie: `compose.yaml`) |

## Engine-Kette und Status

Der Client-Skill (opencode-helpers `searxng`, instanz-neutral) steuert die
Kette; auf gregor gilt das Profil `SEARXNG_CHAIN=strict`:
`bing → yahoo → braveapi` — ohne Free-Tier-3.

- `bing` (Primär) und `yahoo` (Fallback) sind serverseitig `disabled: false`.
- `braveapi` ist serverseitig **keylos disabled**: solange kein schuleigener
  Brave-Search-Key existiert (offen, extern zu beschaffen), endet die Kette
  praktisch bei `bing`/`yahoo`. Kein privater Key des Operators läuft hier.
- `google`/`brave` bleiben aktiviert (`disabled: false`) für einen künftigen
  Upstream-Fix, sind aber nicht in der Kette (`google` → HTTP 403,
  searxng#5867; `brave` → 429).
- **Gemessen 2026-10-18:** `bing` liefert 0 Treffer, jede Suche lief auf
  `yahoo` (`fallback_used: true`) — Details + Diagnose-Rezept in
  `docs/ai/PITFALLS.md`.

## Config-Dateien

| Datei (Repo) | Live-Pfad (gregor) | Zweck |
|---|---|---|
| `settings.yml` | `/opt/searxng/searxng/settings.yml` | Engine-Set, Formats, Redis, Timeouts. `secret_key` → `SEARXNG_SECRET` aus `.env` |
| `limiter.toml` | `/opt/searxng/searxng/limiter.toml` | Bot-Detection (link_token off — intern) |
| `compose.yaml` | `/opt/searxng/docker-compose.yaml` | Container-Definition (Valkey + SearXNG) |
| `.env.sample` | `/opt/searxng/.env` | `SEARXNG_SECRET` (mode 600, nicht im Repo) |
| `../infra/nginx/sites-available/gregor-searxng` | `/etc/nginx/sites-available/gregor-searxng` | nginx-`default_server` :80 → `127.0.0.1:8888` |

## Betrieb

```bash
# Status / Logs
docker ps
docker logs searxng

# Neustart / Update
cd /opt/searxng && docker compose restart
cd /opt/searxng && docker compose pull && docker compose up -d
```

Nach `docker compose pull` (Image-Update) **Engine-Matrix neu messen**
(Drei Testsuchen, `engine_used`/`fallback_used`/`tried` prüfen — Rezept in
`docs/ai/PITFALLS.md`).

## History

- **2026-10-19** (Issue #36): Instanz-Trennung — dieses Repo ist Owner der
  gregor-Instanz. Private Keys (Brave/GitHub) entfernt, `secret_key` in
  `.env`, Klienten-Matrix auf Schulnetz-IP, Austragung aus dem persönlichen
  SVN-Deployed-Baum.
- **2026-10-08**: Instanz auf Port 80 gebracht (nginx `default_server`, kein
  TLS/Auth), Image 2026.10.7, General-Engines `bing`+`yahoo` aktiviert
  (Referenz-Issue im persönlichen SVN: `2026-10-08-suchinstanz-gregor-port80`).
