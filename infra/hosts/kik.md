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

## History

- **2026-10-08**: nginx + Certbot installiert, beide VHosts + separate Certs, Renewal verifiziert (Issue #3).
