# HANDOFF — KI-Kustodiat

Stand: 2026-10-07 · Whisper exklusiv auf GPU (Ollama aus, LiteLLM gestoppt/Reserve).

## Gerade abgeschlossen
- **2026-10-12 — Whisper-HTTPS-Front (Issue #3):** VHost `htl.graf.priv.at` → **`whisper.kik.spengergasse.at`** umbenannt (DNS = CNAME auf `kik.spengergasse.at`; Proxy-Ziel bleibt `http://gregor.kik:11437` = Whisper-STT-API). Eigenes Let's-Encrypt-Cert (`certbot --nginx`, Renewal-Dry-Run grün), altes Cert/VHost/Logs entfernt. Referenzkopie `infra/nginx/sites-available/whisper.kik.spengergasse.at`; nginx-Abhängigkeit auf `gregor.kik` (Suchdomäne `htl-wien5.schule` in `/etc/resolv.conf`) in `infra/hosts/kik.md` dokumentiert. e2e: `/health` → 200, `/docs` → 200, `:80`→`:443` 301.
- **2026-10-11 — Headless-Jobs pinnen ihr Modell (Issue #33):** Der systemd-Angebots-Job lief ohne konfiguriertes Modell; opencode V2 fiel auf das *neueste Katalogmodell* zurück (`opencode-go/claude-haiku-5-5`, verifiziert via Journal + DB-Session `ses_ed3844d3cffesPrSYQ9AVSNZqi`). Fix: `--model opencode-go/deepseek-v4.1-flash#high` in `scripts/run-offers-job.sh`, globaler Default `model` in `~/.config/opencode/opencode.json` (Sicherheitsnetz, host-lokales File). Doku: PITFALLS, DECISIONS, STATE, `infra/systemd/README.md`, `infra/hosts/kik.md`; Konvention „headless Jobs pinnen `--model`" in `opencode-helpers/AGENTS.global.md`. Verifikation: `opencode run --model … "Antworte nur mit: OK"`.
- **2026-10-11 — Markdown-getriebene Homepage + Skill (Issue #31):** `website/` neu: Startseite als Shell (Logo, Linksammlung, „OpenWebUI Chat"+Anleitung), Unterseiten aus `website/content/*.md` via Hash-Router (`app.js`, marked); Pico `2.1.1` + marked `18.1.0` lokal vendored; Schul-Logo freigestellt (hell/dunkel) + Favicon. Skill `update-homepage` (`.opencode/skills/`) erzeugt Status/Milestones/Plan. Git-Milestones **M1 Explorationsphase (erreicht)**, **M2 Beschaffungswünsche abklären** (#14, #32), **M3 Zentrale Modellversorgung** angelegt + Issues zugeordnet. #4 (Network Hardening) ins interne Repo (dort #2) verschoben + geschlossen. nginx: `.md → text/markdown`. rsync nach kik, Live-Seite verifiziert. Offen: visueller Feinschliff (Abstände/Logo) nach Sichtprüfung; Angebots-Job #32.

- **2026-10-08 — Website + Pages-Rückbau (Issue #29):** `website/index.html` überarbeitet (custos-Intro, Discussions-CTA Projektziele, Explorationsphase, STT in-house, Open-WebUI-Lob + Link, Custom-Model-Guide neu — nur Preset-Provider via Personal Connections, **nicht OpenCode-kompatibel**; Empfehlung Provider-Subscription bis eigene Hardware/Schulbudget-Kontingente). GitHub Pages = Minimal-Index (`pages/index.html` → Links auf `kik.spengergasse.at` + Discussions); Slides nur noch im Repo, `deploy-pages.yml` auf neuen Trigger umgestellt. Mail-Entwurf #24 auf Homepage-Link umgebogen (unversendet). E2e grün (Workflow-Run 37809658076, Live-Seite gecheckt).
- **2026-10-07 — GPU exklusiv Whisper:** Ollama gestoppt + `disable` (VRAM frei), LiteLLM/Postgres/models-proxy gestoppt (Reserve, Reaktivierung in `whisper/README.md`), Whisper `large-v3` dauerhaft (`restart: unless-stopped`, e2e 200, ~3,9 GB VRAM), Open WebUI STT direkt (`http://whisper:9000/v1`, `restart` erfolgt). BYOK bereits aktiv (`direct.enable=true`). `:3000` Klartext für ZID-nginx, SearXNG `:80` ok. Repo-Doku synchron (`compose.yaml`, `whisper/README`, `openwebui/README`, `gregor.md`, `DECISIONS.md`, `STATE.md`).
- **Issue #28 — Internes Schwester-Repo `KI-Kustodiat-intern`** angelegt (privat, Org `Die-Spengergasse`, Klon `~/repos/Die-Spengergasse/KI-Kustodiat-intern`): Trennungsregeln in dessen `AGENTS.md`, Gesprächsnotizen-Konvention + `docs/ai/`-Wissensbasis, Zugriffsanalyse `docs/intern/zugriff-org-rollen.md`. **Befund:** 36 Org-Admins haben zwangsläufig Admin auf privaten Repos (GitHub-Regel) — **geklärt (Option A, 2026-09-28):** alles EDV-Lehrer:innen, Zugriff unproblematisch; strikt keine Secrets ins Repo. Issue #28 geschlossen. Scope: nur Zukunft wandert intern; Bestand bleibt öffentlich.
- **Issue #24 — Kollegiums-Ideenaufruf, rev. 3 (kurz & bündig, 2026-10-11):** E-Mail-Entwurf gestrafft (~100 → ~40 Zeilen): Ich-Stimme-Aufhänger bleibt, Sinnfrage-Erklärblock + Detail-Threads #25/#26 aus dem Mail-Body gestrichen (bleiben in #27 verlinkt), Infrastruktur auf Open-WebUI-Kurz-Erwähnung reduziert. Alle drei Links real (Discussions #27, `https://openwebui.kik.spengergasse.at`, `https://kik.spengergasse.at` — HTTPS seit 2026-10-08 live, Blocker #3 entfällt). Text-only für Outlook (kein Markdown — Outlook rendert es nicht, bare URLs werden autogelinkt). Tonalität umgestellt auf Du/Ihr. Georg editiert manuell nach; danach versandbereit.
- **Issue #24 — Kollegiums-Ideenaufruf** (docs-only): Entwurf `docs/extern/kollegium-ideen-email-draft.md` (Ideen + Wünsche + Anforderungen, Infrastruktur-Verweis, Zeitschiene ~2–3 Wochen → Budgetforderung → Stimmungsbild); GitHub Discussions angelegt — Anker #27 (Announcements), Ideen-Threads #25/#26; Archiv-Konvention `docs/extern/mail-archiv/README.md`. Issue #3 um internetfähige ZID-VM (DMZ, 80/443, Let's Encrypt) erweitert.
- **Issue #22 — Open WebUI LDAP-only** implementiert + committet (`ee4ed72`): Service-Account-Bind, `sAMAccountName`, `search_filter=(objectClass=user)`, `ui.enable_login_form=false` (kein Email-Formular/Toggle), lokales Admin-Passwort neutralisiert. Realer AD-Login verifiziert. Docs: `openwebui/README.md`, `litellm/compose.yaml`, `.env.example`, `infra/hosts/gregor.md`.

## Politischer Rahmen (bewusst dokumentiert)

- Die **Direktion** will das KI-Kustodiat; das **Budget** wird nicht von der
  Direktion, sondern vom **Ministerium** genehmigt. Die Direktion fordert
  laufend Gelder beim Ministerium an.
- Deshalb: Die **Sinnfrage des Kustodiats nie explizit stellen** — eine offene
  „Brauchen wir das überhaupt?"-Frage wäre gegenüber der Direktion nicht
  angemessen. Sie wird **subtil über Wofür/Erwartung/Hofflung** formuliert und
  schwingt zwischen den Zeilen mit (Tonalitäts-Regel im E-Mail-Entwurf).
- Die Grundsatzfrage selbst bleibt legitim: Wenn die Rückmeldungen dünn
  ausfallen, ist das die stillschweigende Antwort — sie muss niemand aussprechen.
- **Transparenz-Grundsatz (bewusste Entscheidung von Georg):** Diese
  politische Kette steht absichtlich öffentlich im Repo. Maximale Transparenz
  wird vorgelebt; die tiefe Ordnerstruktur (`docs/ai/`) wirkt als Filter —
  wer hier liest, hat sich bewusst und gründlich mit der Materie
  auseinandergesetzt. Diese Offenlegung **nicht rückgängig machen** und
  sensible Punkte nicht stärker verschleiern, als die Regel es verlangt.

## Offen (nächste Session)
1. [ ] **#31 Feinschliff nach Sichtprüfung:** Abstände/Logo/Nav auf der Live-Seite (`kik.spengergasse.at`) eyeballen; Homepage-CTA-Umfang (Diskussions-Aufruf) final bewerten.
2. [x] **#32 Angebots-Job (2026-10-11):** Skill `update-offers` + Runner `scripts/run-offers-job.sh` + systemd-Timer `update-offers.timer` auf kik (Mo 06:00) → Route `#/angebote`, erster Lauf deployt. Details in `infra/systemd/README.md` und `infra/hosts/kik.md`.
3. [ ] **#24 Ideenaufruf:** Anker-Discussion [#27](https://github.com/Die-Spengergasse/KI-Kustodiat/discussions/27) **manuell anpinnen** (GitHub-GraphQL bietet kein `pinDiscussion` in dieser Schema-Version). E-Mail (rev. 3, `docs/extern/kollegium-ideen-email-draft.md`, alle URLs real, von Georg manuell nacheditiert) versenden; danach gesendete Fassung nach `docs/extern/mail-archiv/`.
2. [ ] **STT-e2e über ZID-Front:** Upload + Mic im UI via HTTPS (Secure Context kommt von außen). Bei Whisper-Ausfall: Reserve-Pfad `whisper/README.md` (LiteLLM-Reaktivierung).
3. [x] **BYOK-Search-e2e (verifiziert 2026-10-08):** `deepseek-v4.1-flash` via Zen-Direct-Connection → `search_web` → SearXNG-Hits + Scrapes → Antwort mit Citations. Caveat: Zen-Free-Modelle flattern (`big-pickle`, `muse-spark` derzeit 404) — pro Modell verifizieren, Details in PITFALLS.md.
4. [x] Tote lokale LLM-Rows sind bereits `is_active=0` (alle 5 `model`-Rows, verifiziert 2026-10-08) — Picker zeigt nur Direct-Connection-Modelle; frische LDAP-User ohne Direct Connection sehen **kein Modell**.
5. [ ] `search_chats`/`view_chat` leakt durch `builtinTools`-Gating — Upstream-Check (fehlendes Kategorie-Gate).
6. [ ] **Admin-Promotion:** neue Admins nach ihrem 1. LDAP-Login im Admin-Panel promoten (`grafg` ist aktuell der einzige Admin).

## Offen (älter)
- [ ] ZID-VM da (2026-10-07): URL in #24-Mail eingesetzt (rev. 3, 2026-10-11); noch offen: STT-e2e via Front (siehe Offen Nr. 2).
- [ ] Cortecs-Vertrag anfragen (`docs/extern/cortecs-anfrage-email-draft.md` → `enterprise@cortecs.ai`).
- [ ] Hardware-Entscheidung (Issues #2, #5, #7) — Framework Desktop Strix Halo 128 GB.
- [ ] Issue #14 (Token-/Auth-Konzept) um BYOK-Realität ergänzen (Keys liegen am Server; DeepSeek-direkt = Tier 4, Eigenverantwortung).
- [ ] LiteLLM-Reserve (gestoppt 2026-10-07): Reaktivierung in `whisper/README.md`; `models={}`-Regel + `OPENCODE_MODELS_URL`-Rollout erst wieder relevant, wenn LiteLLM zurückkommt.
