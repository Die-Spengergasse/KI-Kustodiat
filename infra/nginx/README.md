# nginx VHost reference copies (host: kik)

Live files: `/etc/nginx/sites-available/` — managed by Certbot
(`# managed by Certbot` lines). These copies are the versioned reference;
keep them in sync after manual live edits. No secrets in these files
(cert paths only, keys stay under `/etc/letsencrypt/`).

- `sites-available/kik.spengergasse.at` — static site, docroot `/var/www/kik`
  (deployed via `rsync` from `website/` in this repo)
- `sites-available/openwebui.kik.spengergasse.at` — reverse proxy to
  `http://10.50.11.10:3000` (WebSocket upgrade, 100M uploads, 300s timeouts)

No HSTS header by design (added only after passing HTTPS e2e — see Issue #3).
