#!/usr/bin/env bash
# Wöchentlicher Angebots-Job (Issue #32):
#   opencode-Websuche (Skill update-offers) → website/content/angebote.md
#   → Commit/Push → Deploy auf die Management-VM.
# Läuft per systemd-Timer `update-offers.timer` als User grafg.
set -euo pipefail

REPO="/home/grafg/repos/Die-Spengergasse/KI-Kustodiat"
DOCROOT="/var/www/kik"
BRANCH="main"
TARGET="website/content/angebote.md"

export PATH="${HOME}/.opencode/bin:/usr/local/bin:/usr/bin:/bin"
cd "${REPO}"

echo "[offers] $(date -Is) Start"

# 1. Frischer Stand (bei lokal geändertem Baum bricht das ab — bewusst).
git pull --ff-only origin "${BRANCH}"

# 2. Recherche + Seite schreiben.
opencode run --standalone "Aktualisiere die Angebots-Übersicht (Skill update-offers)."

# 3. Sicherheitsnetz: der Agent darf nur die Angebotsseite anfassen.
UNEXPECTED="$(git status --porcelain | grep -v " ${TARGET}$" || true)"
if [ -n "${UNEXPECTED}" ]; then
  echo "[offers] Warnung: unerwartete Änderungen, breche ab:"
  echo "${UNEXPECTED}"
  exit 1
fi

# 4. Nur bei echter Änderung committen.
if git diff --quiet -- "${TARGET}"; then
  echo "[offers] keine Änderung — fertig"
  exit 0
fi

git add "${TARGET}"
git commit -m "web: Angebots-Übersicht aktualisiert ($(date +%F)) (#32)"
git push origin "${BRANCH}"

# 5. Deploy (rsync auf die Management-VM; hier lokal = kik).
sudo -n rsync -a website/ "${DOCROOT}/"
sudo -n chown -R www-data:www-data "${DOCROOT}"

echo "[offers] $(date -Is) fertig"
