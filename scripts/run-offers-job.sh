#!/usr/bin/env bash
# Wöchentlicher Angebots-Job (Issue #32):
#   opencode-Websuche (Skill update-offers) → website/content/angebote.md
#   → Commit/Push → App neu bauen und als Release ausrollen (Issue #51).
# Läuft per systemd-Timer `update-offers.timer` als User grafg.
set -euo pipefail

REPO="/home/grafg/repos/Die-Spengergasse/KI-Kustodiat"
BRANCH="main"
TARGET="website/content/angebote.md"

export PATH="${HOME}/.opencode/bin:/usr/local/bin:/usr/bin:/bin"
cd "${REPO}"

echo "[offers] $(date -Is) Start"

# 1. Frischer Stand (bei lokal geändertem Baum bricht das ab — bewusst).
git pull --ff-only origin "${BRANCH}"

# 2. Recherche + Seite schreiben.
#    Modell EXPLIZIT pinnen: ohne --model fällt opencode auf das "neueste
#    verfügbare Katalogmodell" zurück (V2-Doku) — der Job würde bei jedem
#    Release still das Modell wechseln (Kosten-/Qualitätsrisiko). Die Variant
#    (#high) lässt sich nur hier setzen, nicht über den Root-`model`-Key.
#    Hinweis: `opencode run` endet mit Exitcode 1, sobald im Lauf Tool-Fehler
#    auftraten (z. B. abgebrochene Websuchen), auch wenn das Ergebnis gut ist.
#    Deshalb hier den Code auffangen und am Artefakt entscheiden.
set +e
opencode run --standalone --model opencode-go/deepseek-v4.1-flash#high \
  "Aktualisiere die Angebots-Übersicht (Skill update-offers)."
OPENCODE_RC=$?
set -e
echo "[offers] opencode rc=${OPENCODE_RC}"

# 3. Artefakt prüfen: existiert, nicht leer, richtige Überschrift.
if [ ! -s "${TARGET}" ] || ! head -1 "${TARGET}" | grep -q '^# Angebote'; then
  echo "[offers] Angebotsseite fehlt oder ist ungültig — Abbruch"
  exit 1
fi

# 4. Sicherheitsnetz: der Agent darf nur die Angebotsseite anfassen.
UNEXPECTED="$(git status --porcelain | grep -v " ${TARGET}$" || true)"
if [ -n "${UNEXPECTED}" ]; then
  echo "[offers] Warnung: unerwartete Änderungen, breche ab:"
  echo "${UNEXPECTED}"
  exit 1
fi

# 5. Nur bei echter Änderung committen.
if git diff --quiet -- "${TARGET}"; then
  echo "[offers] keine Änderung — fertig"
  exit 0
fi

git add "${TARGET}"
git commit -m "web: Angebots-Übersicht aktualisiert ($(date +%F)) (#32)"
git push origin "${BRANCH}"

# 6. Deploy: App neu bauen und als Release ausrollen (Issue #51). Die
#    öffentliche Website kommt aus /srv/kik-app/current/dist, nicht mehr aus
#    /var/www/kik; der Prerender liest website/content/angebote.md beim Build.
#    Das Deploy-Skript bringt sein eigenes PATH (systemweites Node) mit und
#    nutzt `sudo -n` selbst — deshalb hier NICHT mit sudo starten (sonst legt
#    der Build root-eigene Dateien in app/dist ab).
"${REPO}/scripts/deploy-app.sh"

echo "[offers] $(date -Is) fertig"
