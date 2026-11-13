---
type: State
title: State
description: Aktueller Projektstatus mit Fokus, abgeschlossenen und offenen Aufgaben.
tags: [ki-kustodiat, state]
generated: { by: opencode/knowledge-persistence, at: 2026-11-13T10:30:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
---

# STATE — KI-Kustodiat

## Current Focus
2026-11-13: **Angebots-Job erzwingt die Schreibpflicht (#63)** — `scripts/run-offers-job.sh` prüft den Schreibvorgang (`stat -c %y` vor/nach), retryt einmal und bricht dann mit `exit 1` ab; `git diff --quiet` gilt nicht mehr als Erfolgsnachweis. Dazu `docs/Recherche/on-premise-vs-api-kalkulation.md` repariert (Durchsatz über Bytes pro Token: 70B Q4 ≈ 6 tok/s statt 32; „M5 Max 192 GB" → M5 Ultra 256 GB). Davor am selben Tag: **Angebotsseite zeigt Speicherbandbreite und Parallelität (#62)** — beide Hardware-Tabellen auf `#/angebote` führen die Spalte `Bandbreite` (M5 Max 614 GB/s … EVO-X3/MS-S1 Max 256 GB/s; Server-Klasse M5 Ultra 1,2 TB/s … 8× B300 64 TB/s), je eine abgeleitete Zeile und der feste Block „Was Parallelität begrenzt". Die Änderung liegt im Generator `.opencode/skills/update-offers/SKILL.md`, nicht in der wöchentlich neu erzeugten Markdown-Datei; deployt als Release `20261113T090529Z`. Davor 2026-11-07: **Wissensbasis auf Open Knowledge Format v0.2 umgestellt (#58)** — alle 9 Concept-Files in `docs/ai/` tragen YAML-Frontmatter (`type`/`generated`/`verified`/`status`), neue reservierte Files `index.md` (progressive disclosure, `okf_version: "0.2"`) und `log.md` (Per-Run-Log); Body-Inhalte byte-identisch. Der globale `knowledge-persistence`-Skill wurde dafür umgeschrieben (opencode-helpers#127/#128, Commits `0e04b1a`/`45f2be7`): Spec-Beilage `OKF-SPEC.md`, Frontmatter-Envelope in `FILE-TEMPLATES.md`, Legacy-on-touch-Migration ohne Big-Bang, Confirmation nur für berührte Files. Davor 2026-10-30 (Defekt zu #55/#56): Die Anleitung behauptete „Ältere Konfigurationen mit
`large-v3` funktionieren weiterhin" — falsch, der Alias ist seit 2026-10-29 weg. Absatz
ersatzlos gelöscht, die Seite beschreibt nur die Neueinrichtung. 2026-10-30: **Startseite, Anleitungen und Token-URL neu geordnet (#57)** — Startseite
mit vier Kachel-Gruppen und normalen Links, `/anleitung/tokens` +
`/anleitung/openwebui`, Tokenverwaltung von `/portal` nach `/tokens` (harter Umzug,
`/portal` = 404). Davor 2026-10-29 (spät): **Speech-to-Text hängt am Gateway (#55)** — `whisper.kik…`
liefert nur noch mit Portal-Token (`whisper-large-v3`, Alias `large-v3`), der
geteilte Masterkey ist rotiert und aus allen Clients verschwunden; Open WebUI
bleibt am direkten Backend. Portal setzt `rpm_limit` je Key mit. Clients migriert, Alias `large-v3` entfernt (Suite `scripts/test-stt-api.mjs` prüft, dass er nicht zurückkommt).
Davor 2026-10-29: **Website und Portal sind live (AP9, #51)** — `https://kik.spengergasse.at`
wird static-first aus einem Release-Symlink (`/srv/kik-app/current/dist`) bedient, `/portal`
und die Portal-API laufen über `kik-portal.service` (`User=kik-app`, systemweites Node 24),
ausgerollt per `scripts/deploy-app.sh` (atomarer Wechsel, Health-Check mit Auto-Rollback,
5 Releases Vorhalt). Login mit echtem Schulkonto verifiziert (Rolle `admin` sichtbar), Keys
und Verbrauchsansicht live (AP6, #48). Offen: Kontingent-Policy (#49), Härtung/Testmatrix
(#50), Datenschutz-Gate (#52), Rollout (#53). Davor 2026-10-29 (abends): **Portal-Kern steht (AP5, #47)**: LDAP-Login gegen das Schul-AD (search-then-bind), serverseitige Sessions in Postgres (`portal.*`), CSRF, Login-Rate-Limit, Auto-Provisioning nach LiteLLM und Rollen aus dem AD-DN — auf kik verifiziert (echte LDAP-/DB-/LiteLLM-Integrationstests). Davor: **Key-Verwaltung + Verbrauch (AP6, #48)**. Davor 2026-10-29: **KI-Proxy-App — P1 fertig (#35)**: Die Website läuft vollständig als React-SPA in `app/` (Vite + Fastify, Build-time-Prärenderung, echtes Design-System statt Pico), pixelgleich zur Live-Seite. Davor 2026-10-29: **SearXNG-Engine-Cleanup (#41)**. Davor 2026-10-26: **Public/Intern-Trennung nachgezogen (#40)**. Davor gregor 2026-10-19: **SearXNG-Instanz-Trennung umgesetzt (#36)**. Davor 2026-10-07: GPU exklusiv Whisper `large-v3` (dauerhaft, direkt an Open WebUI angebunden, e2e 200). Ollama deaktiviert (kein lokales LLM), LiteLLM + Postgres + models-proxy gestoppt (Reserve, Reaktivierung in `KI-Kustodiat-intern:whisper/README.md`). Chat per BYOK (`direct.enable=true`). Open WebUI `:3000` Klartext (ZID-nginx davor), SearXNG `:80` Search-Backend. OpenCode-`KI-Kustodiat-intern:litellm/*`/`ollama-direct/*` tot (kein lokales Backend).

## Completed (this cycle)
Archiviert: [completed-2026.md](state/completed-2026.md) — abgeschlossene Arbeiten bis 2026-11-07.

## Pending
- [ ] Issue #24: Anker-Discussion #27 manuell anpinnen (gesendete Fassung archiviert: `KI-Kustodiat-intern:docs/extern/mail-archiv-sent/2026-10-13_aus_kollegium-ideenaufruf.md`).
- [ ] Issue #3 erweitert (**time-critical**, blockiert #24-Versand + Budgetfenster): ZID-VM (DMZ, `80/443`, DNS, Let's Encrypt) anfragen; falls ZID nicht in ~1–2 Wochen liefert → Fallback prüfen (E-Mail nur mit Pages-Link, Entscheidung: Georg).
- [ ] **#34** (Sub von #3, M2): Provider-Rundmail — 01/02/04 gesendet; offen: **03 Exoscale** (nach ACOnet-Antwort), **05 BBG** (zuletzt), **06 Cortecs** (versandfertig, nach ACOmarket-Antwort). Danach gesendete Fassungen archivieren und Issue schließen.
- [ ] **#35** (Sub von #3, M3): Spengergassen KI-Proxy — LDAP-Login, Self-Service-Tokenverwaltung, OpenAI-kompatibler Multi-Provider-Endpoint (Token-Durchschleifen), Fair-Use-Heuristiken, 100 %-Kosten-/Token-Logging.
- [x] opencode `OPENCODE_MODELS_URL`-Problem gelöst (2026-07-05): daemonized `opencode serve` erbt nun die Env-Var; Picker zeigt die 2 LiteLLM-Modelle.
- [ ] Katalog-Änderungen in Zukunft: `models`-Restriction der Virtual Keys bleibt leer (`{}`) — sie erben den Proxy-Katalog automatisch. Beim Hinzufügen eines Modells: ollama-Tag pullen → `config.yaml` `model_list`-Eintrag → `docker compose restart litellm` (Config wird nur am Startup gelesen). Kein Key-Edit nötig solange `models={}`.
- [ ] OPENCODE_MODELS_URL für Schüler-Lab austollen (Shared-Launcher / /etc/profile.d) — aktuell nur georgs Shell
- [x] **kik nginx-TLS-Front live (2026-10-08, Issue #3):** nginx 1.26.3 auf Management-VM `kik` (`:80`/`:443` öffentlich), zwei VHosts (`kik.spengergasse.at` statisch aus `/var/www/kik` via rsync aus `website/`; `openwebui.kik.spengergasse.at` → `proxy_pass <LAN_IP_GREGOR>:3000`, WebSocket, 100M, 300s), zwei separate Let's-Encrypt-Certs, 80→443-Redirect, Renewal via `certbot.timer` + Dry-Run, kein HSTS (erst nach e2e). Hostakte `KI-Kustodiat-intern:infra/hosts/kik.md`, VHost-Referenzen `KI-Kustodiat-intern:infra/nginx/`. Offen: Mic-e2e via Front, LiteLLM-Migration auf kik.
- [ ] Management-VM aufsetzen (Issue #3) — LiteLLM migriert dann dorthin (rsync /opt/litellm + compose up, api_base bleibt <WG_IP_GREGOR>; IP siehe `KI-Kustodiat-intern:infra/hosts/secrets.local.md`)
- [ ] Network Hardening / ufw für :11435 (Issue #4) — aktuell Bypass möglich (Known Gap)
- [ ] Hardware-Entscheidung (Issues #2, #5, #7)
- [ ] LiteLLM Access Control / Virtual-Keys für User-Groups (Issue #6) — kombiniert mit Open WebUI-Rollen (LDAP-Gruppen → LiteLLM-Budgets)
- [ ] dev-rig-01: Adapter einbauen, PCIe-Stränge prüfen, Specs nachtragen (Issue #12)
- [ ] HTTPS-Front live (2026-10-08, Issue #3: nginx auf kik) — offen nur noch Mic-e2e via Front (Secure Context) + HSTS danach
- [ ] Kein Function-Calling mit Qwen3 1.7B (builtin_tools + tool_choice=none blockieren auch Web-Search). Benötigt größeres Modell oder Upgrade von LiteLLM/Ollama für stabilen Tool-Call-Streaming via Open WebUI.
- [ ] Provider-Anfragen versenden (Einzel-Drafts `KI-Kustodiat-intern:docs/extern/llm-provider-rundmail-TODO/`, Reihenfolge = Dateinummer 01→06; Cortecs zuletzt als kurzer Nachtrag an `enterprise@cortecs.ai`) — Bildungs-Rabatt, DPA, Modellpreise, Pilot klären (**#34**)
- [ ] Framework Desktop Strix Halo 128 GB bestellen (Issues #2/#5/#7) — On-Prem-Backend für DSGVO-kritische Last + Q3-Modelle
- [ ] Issue #14 (Token- und Auth-Konzept) mit Cortecs-Volumen + Drei-Säulen-Modell ergänzen

## Blockers
- Hardware-Entscheidung
- ZID-Koordination (Netzwerk, VLAN, SSO)

## Next Session Suggestion
Mic-e2e über ZID-HTTPS-Front verifizieren (Secure Context), BYOK-Chat mit Tool-Search (`search_web` → SearXNG) testen, tote lokale LLM-Rows aus Open-WebUI-`model`-Tabelle ausblenden. Dann #24-Versand mit echter URL.