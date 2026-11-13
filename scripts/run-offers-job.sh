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
#
#    SCHREIBPFLICHT (Issue #63): Ein Lauf, der nur recherchiert und dann einen
#    Statusbericht absetzt, ist ein Fehlschlag — nicht "keine Änderung". Der
#    Prompt sagt das ausdrücklich, und Schritt 3 prüft es am mtime der Datei.
PROMPT="Führe den Skill update-offers vollständig aus. Schreibe website/content/angebote.md in DIESEM Lauf mit dem write-Tool fertig — der Lauf gilt nur mit geschriebener Datei als erledigt. Keine anderen Dateien anfassen, nicht committen, nicht nachfragen."

run_agent() {
  set +e
  opencode run --standalone --model opencode-go/deepseek-v4.1-flash#high "$1"
  local rc=$?
  set -e
  echo "[offers] opencode rc=${rc}"
}

MTIME_BEFORE="$(stat -c %y "${TARGET}" 2>/dev/null || echo 0)"
run_agent "${PROMPT}"

# 3. Artefakt prüfen: wurde die Seite in diesem Lauf überhaupt geschrieben?
#    mtime statt Hash: die Datumszeile `_Aktualisiert: <ISO-Datum>._` macht einen
#    Diff nur wahrscheinlich (ein zweiter Lauf am selben Tag erzeugt dasselbe
#    Datum). Ein Schreibvorgang ist das verlässliche Signal; `%y` liefert
#    Nanosekunden, `%Y` nur Sekunden (zwei Schreibvorgänge in derselben Sekunde
#    wären sonst ununterscheidbar).
if [ "$(stat -c %y "${TARGET}" 2>/dev/null || echo 0)" = "${MTIME_BEFORE}" ]; then
  echo "[offers] Agent hat die Seite nicht geschrieben — ein Retry"
  run_agent "${PROMPT} Der vorige Lauf hat die Datei nicht geschrieben; schreibe sie jetzt."
  if [ "$(stat -c %y "${TARGET}" 2>/dev/null || echo 0)" = "${MTIME_BEFORE}" ]; then
    echo "[offers] FEHLSCHLAG: zweiter Lauf ohne Schreibvorgang — Abbruch"
    exit 1
  fi
fi

# 4. Artefakt prüfen: existiert, nicht leer, richtige Überschrift.
if [ ! -s "${TARGET}" ] || ! head -1 "${TARGET}" | grep -q '^# Angebote'; then
  echo "[offers] Angebotsseite fehlt oder ist ungültig — Abbruch"
  exit 1
fi

# 5. Sicherheitsnetz: der Agent darf nur die Angebotsseite anfassen.
UNEXPECTED="$(git status --porcelain | grep -v " ${TARGET}$" || true)"
if [ -n "${UNEXPECTED}" ]; then
  echo "[offers] Warnung: unerwartete Änderungen, breche ab:"
  echo "${UNEXPECTED}"
  exit 1
fi

# 6. Committen — nur bei echter Inhaltsänderung. Ein Schreibvorgang ohne
#    Änderung ist ein gültiger Lauf (Agent hat geschrieben, Inhalt identisch).
if git diff --quiet -- "${TARGET}"; then
  echo "[offers] Inhalt unverändert (Agent hat geschrieben) — fertig"
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
