# HANDOFF — KI-Kustodiat

Stand: 2026-09-24 · Branch `main` (trunk) · letzte Commits: `ee4ed72` (#22), `e0f2239` (#21).

## Gerade abgeschlossen
- **Issue #22 — Open WebUI LDAP-only** implementiert + committet (`ee4ed72`): Service-Account-Bind, `sAMAccountName`, `search_filter=(objectClass=user)`, `ui.enable_login_form=false` (kein Email-Formular/Toggle), lokales Admin-Passwort neutralisiert. Realer AD-Login verifiziert. Docs: `openwebui/README.md`, `litellm/compose.yaml`, `.env.example`, `infra/hosts/gregor.md`.

## Offen (nächste Session)
1. [ ] **#21 GROQ-STT:** Row `groq-stt-georg` aktiv (e2e API ok, Open WebUI `audio.stt.model=groq-whisper`). Rest: Mic-e2e im UI (Georg); Schüler-Keys einsammeln → weitere Deployment-Rows (SQL-Template in `whisper/README.md`); nach ~2 Dutzend Keys `groq-stt-georg` löschen (Key teilt Free-Tier mit Bot-STT).
2. [ ] **#21 UI-Verifikation Web Search** durch Georg (`qwen3:8b-search`, Globe-Icon) — inkl. Check, ob der `{}`-Stream-Drop auftritt.
3. [ ] `search_chats`/`view_chat` leakt durch `builtinTools`-Gating — Upstream-Check (fehlendes Kategorie-Gate).
4. [ ] **Admin-Promotion:** neue Admins nach ihrem 1. LDAP-Login im Admin-Panel promoten (`grafg@spengergasse.at` ist aktuell der einzige Admin).
5. [ ] HTTPS für Open WebUI (Mic/STT braucht Secure Context) — Caddy/nginx vor `:3000` (Issue #14).

## Offen (älter)
- [ ] Cortecs-Vertrag anfragen (`docs/extern/cortecs-anfrage-email-draft.md` → `enterprise@cortecs.ai`).
- [ ] Hardware-Entscheidung (Issues #2, #5, #7) — Framework Desktop Strix Halo 128 GB.
- [ ] Issue #14 (Token-/Auth-Konzept) um Cortecs-Volumen + Drei-Säulen-Modell ergänzen.
- [ ] `OPENCODE_MODELS_URL` für Schüler-Lab austollen (Shared-Launcher / `/etc/profile.d`) — aktuell nur georgs Shell.
- [ ] Management-VM (Issue #3): LiteLLM dorthin migrieren (`rsync -a /opt/litellm <vm>:` + `docker compose up -d`).
