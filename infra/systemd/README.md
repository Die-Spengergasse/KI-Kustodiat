# systemd-Units (Host: kik)

Versionierte Referenzkopien der Units, die auf der Management-VM **kik** laufen.
Live-Dateien liegen unter `/etc/systemd/system/`. Nach Änderungen hier:

```bash
sudo cp infra/systemd/update-offers.{service,timer} /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now update-offers.timer
systemctl list-timers update-offers.timer
```

## update-offers (Issue #32)

Wöchentlicher Job (`scripts/run-offers-job.sh`): opencode-Websuche (Skill
`update-offers`) → `website/content/angebote.md` → Commit/Push → rsync auf
`/var/www/kik`. Läuft als User `grafg`; der Deploy nutzt das vorhandene
passwortlose `sudo` für `rsync`/`chown`.

- **Intervall:** montags 06:00 (`OnCalendar=Mon 06:00`), `Persistent=true`.
- **Testlauf manuell:** `sudo systemctl start update-offers.service` ·
  Logs: `journalctl -u update-offers -n 100 --no-pager`.
- **Voraussetzung:** `opencode`-Login unter `HOME=/home/grafg`
  (Credentials liegen in `~/.local/share/opencode/opencode.db`).
