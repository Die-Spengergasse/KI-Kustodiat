# Host: kik

> Status: **active** — Management-VM, nginx TLS-Front (2026-10-08).

## Hardware specs

| Field | Value |
|---|---|
| Role | Management-VM: nginx Reverse Proxy / TLS-Terminierung (Let's Encrypt), statische Website `kik.spengergasse.at` |
| Hostname | kik |
| OS | Debian 13 (trixie) |
| Network | ens18 (intern, `10.50.0.0/16`), ens19 (öffentlich, `192.189.51.57/26`) — IPs in `secrets.local.md` |
| Added | 2026-10-08 (Issue #3) |

## Runtime role (2026-10-08)

nginx `1.26.3` lauscht öffentlich auf `:80`/`:443`. Zwei separate Let's-Encrypt-Certs
(je ein Cert pro VHost, Account `grafg@spengergasse.at`), Renewal über `certbot.timer`
(zweimal täglich) + `/etc/cron.d/certbot`. **Kein HSTS** (Header erst nach bestandenem
HTTPS-e2e — Mic, BYOK-Search).

| VHost | Ziel |
|---|---|
| `kik.spengergasse.at` | Statisch aus `/var/www/kik` (Deploy per `rsync` aus `website/` im Repo) |
| `openwebui.kik.spengergasse.at` | `proxy_pass http://10.50.11.10:3000` (WebSocket-Upgrade, 100M Upload, 300s Timeouts) |

Referenzkopien der VHosts: `infra/nginx/sites-available/`. Live-Files unter
`/etc/nginx/sites-available/` werden von Certbot verwaltet (`# managed by Certbot`) —
bei manuellem Edit am Live-File die Referenzkopie synchron halten.

## Angebots-Job (2026-10-11, Issue #32)

`update-offers.timer` (systemd, montags 06:00, `Persistent=true`) startet
`update-offers.service` → `scripts/run-offers-job.sh`: opencode-Websuche (Skill
`update-offers`) → `website/content/angebote.md` → Commit/Push → rsync auf
`/var/www/kik`. Läuft als User `grafg`; Deploy nutzt das passwortlose `sudo`.
Referenzkopien der Units: `infra/systemd/`. Installiert per
`systemctl enable --now update-offers.timer`.

- **opencode headless** braucht `HOME=/home/grafg` (Credentials in
  `~/.local/share/opencode/opencode.db`, Provider `opencode-go`/`opencode`).
- `opencode run` endet mit Exitcode 1, sobald im Lauf Tool-Fehler auftraten —
  das Skript fängt das ab und entscheidet am Artefakt.

## History

- **2026-10-11**: Wöchentlicher Angebots-Job (`update-offers.timer`), Skill
  `update-offers`, Route `#/angebote`; `.md` wird nun als `text/markdown` ausgeliefert;
  Startseite markdown-getrieben (Issue #31/#32).
- **2026-10-08**: nginx + Certbot installiert, beide VHosts + separate Certs, Renewal verifiziert (Issue #3).
