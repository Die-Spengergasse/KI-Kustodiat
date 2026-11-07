---
type: Pitfalls
title: "Pitfalls — Werkzeuge, Git und Betriebs-Hygiene"
description: "CLI-Verhalten, Git-Push, SSH, sudo und Datei-Modi."
tags: [ki-kustodiat, pitfalls, tooling-git-ops]
generated: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
---

# Werkzeuge, Git und Betriebs-Hygiene — Pitfalls

- **opencode-Subcommand-Gotcha**: `opencode models <provider>` (mit Argument) liefert "Provider not found" für kataloggestützte Provider; der TUI-Picker (`opencode models` ohne Arg / `/models` in TUI) funktioniert. Nur gegen den Picker validieren.
- **Headless `opencode run` ohne `--model` nutzt das NEUESTE Katalogmodell**: ohne konfigurierten `model`-Key (Root-Config) nimmt opencode V2 **nicht** das zuletzt im TUI gewählte Modell (`~/.local/state/opencode/model.json` gilt nur für die TUI), sondern fällt laut Doku auf das jüngste verfügbare Modell zurück ("falls back to the newest available supported model"). Der Angebots-Job lief so still auf `opencode-go/claude-haiku-5-5` (Issue #33). Folge: stiller Drift bei jedem Katalog-Update, inkl. Kostenrisiko (neuestes Modell kann ein teures Frontier-Modell sein). **Jeden headless Job explizit pinnen** (`--model provider/model#variant`); die Variant geht nur per CLI, der Root-`model`-Key kann keine halten.
- **Docker + ufw**: `:11434` ist ein *veröffentlichter Container-Port* → ufw kann ihn NICHT filtern (Docker pflegt eigene iptables-Regeln in der DOCKER-Kette). `:11435` ist Host-Service (ollama) → ufw könnte filtern (aktuell nicht umgesetzt → Known Gap, ollama direkt ohne Auth erreichbar). Wegen Docker+ufw-Interaktion immer nur Host-Service-Ports über ufw kontrollieren.
- **`~/.ssh/config` mit zwei `HostName`-Zeilen nimmt still die letzte (verifiziert 2026-10-19, intern #5):** Für `kik` standen `HostName kik.spengergasse.at` **und** eine zweite, inzwischen tote IP unter demselben `Host`-Block. ssh gewinnt „first value wins" **nicht** — die letzte Zeile überschreibt, und die war tot (`ssh kik` lief in einen Timeout, obwohl der Name korrekt auflöst). Symptom sieht wie Netz-/Firewallproblem aus. Prüfen mit `ssh -G kik | grep hostname`.
- **Interne Namen tragen weiter „portal" (2026-10-30, #57):** Nur die URL und das Nutzer-Label heißen `tokens`/„Tokenverwaltung"; Dienst (`kik-portal.service`), Env-Datei (`/etc/portal/portal.env`), DB-Schema `portal` und `src/lib/portalApi.ts` bleiben. Wer dort „aufräumt", bricht den Deploy — die Umbenennung war bewusst auf die öffentliche Fläche begrenzt.
- **`sudo cat > /etc/…` schreibt nichts (2026-10-29):** Die Umleitung wird von der aufrufenden Shell ausgewertet, *bevor* `sudo` läuft — die Datei bleibt leer bzw. das Schreiben scheitert mit „Permission denied", während der Befehl trotzdem weiterläuft. Für Dateien unter `/etc` immer `sudo tee` bzw. `install -m 644 -o root -g root <quelle> <ziel>` verwenden und danach `nginx -t` prüfen.
- **`git push` nach parallelem Remote-Commit wird rejected — erst `git pull --rebase`, dann pushen (2026-11-07, opencode-helpers#127):** Während der Session hatte ein anderer Host die Trunk-Linie bewegt; der Push scheiterte mit `fetch first`. Ein Rebase auf `origin/main` löst das kollisionsfrei (keine gemeinsamen Dateien), Force-Push ist nicht nötig. Trunk-Regel bleibt: direkt auf `main`, keine Feature-Branches.
- **Neue Files erben die Session-umask (oft 600) — `index.md`/`log.md` brauchen 644 (2026-11-07, #58):** Im selben Verzeichnis liegen teils bewusst sensible Files mit mode 600; neu erzeugte OKF-Files erbten beim Anlegen dennoch nur die umask. Git trackt nur das Executable-Bit — der Modus bleibt host-lokal und ist auf anderen Hosts anders. Nach dem Anlegen bewusst setzen (`chmod 644`), damit der Index für alle Leser der Wissensbank öffnet.
