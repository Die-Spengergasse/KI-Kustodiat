#!/usr/bin/env bash
# Deploy der KI-Kustodiat-App auf kik (public Issue #51).
#
#   scripts/deploy-app.sh [--force] [--skip-health]
#
# Ablauf (alles oder nichts):
#   1. Abhängigkeiten im Repo sicherstellen und `npm run build` (Client + SSR + Prerender).
#   2. `dist/` prüfen (index/404/tokens/sitemap/robots/Fallback müssen existieren).
#   3. Neues Release `/srv/kik-app/releases/<ts>/dist` anlegen (nur Build-Artefakte,
#      **kein** node_modules).
#   4. Produktions-Install des Node-Servers unter `/srv/kik-app/app` synchronisieren
#      (`npm ci --omit=dev`, nur wenn sich `package-lock.json` geändert hat) und
#      `app/dist` als Symlink auf `../current/dist` halten.
#   5. `current` atomar auf das neue Release umhängen (`ln -sfn` + `mv -T`).
#   6. `kik-portal.service` neu starten und per HTTP-Health-Check prüfen;
#      scheitert der Check, wird auf das vorherige Release zurückgerollt.
#   7. nginx: VHost nur anfassen, wenn `--nginx-src`/`$KIK_NGINX_SRC` gesetzt ist
#      und die Datei sich unterscheidet (`nginx -t`, dann reload). Der Release-
#      Wechsel selbst braucht **keinen** Reload: `root` zeigt auf den Symlink.
#   8. Alte Releases löschen (die letzten `KEEP` bleiben, `current` nie).
#
# Idempotent: ein Lauf mit unverändertem `dist/` legt kein neues Release an und
# startet den Dienst nicht neu (`--force` erzwingt beides).
#
# Läuft als `grafg` und braucht passwortloses sudo für /srv/kik-app und systemctl.
set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$REPO_ROOT/app"

RUN_ROOT="${KIK_APP_ROOT:-/srv/kik-app}"
RELEASES="$RUN_ROOT/releases"
CURRENT="$RUN_ROOT/current"
APP_RUNTIME="$RUN_ROOT/app"
SERVICE="kik-portal"
KEEP="${KIK_APP_KEEP_RELEASES:-5}"
HEALTH_URL="http://127.0.0.1:8080/api/auth/me"
NGINX_SRC="${KIK_NGINX_SRC:-}"

# Systemweites Node (/usr/local/bin) statt nvm: der Dienst läuft als User kik-app
# und darf nicht von /home/grafg abhängen.
export PATH="/usr/local/bin:/usr/bin:/bin"

FORCE=0
HEALTH=1
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --skip-health) HEALTH=0 ;;
    -h | --help)
      sed -n '2,30p' "${BASH_SOURCE[0]}"
      exit 0
      ;;
    *)
      echo "deploy-app: unbekanntes Argument: $arg" >&2
      exit 2
      ;;
  esac
done

step() { echo "[deploy] ==> $*"; }
info() { echo "[deploy]     $*"; }
die() {
  echo "[deploy] FEHLER: $*" >&2
  exit 1
}
trap 'die "abgebrochen in Zeile $LINENO (Exit $?)"' ERR

# ── 0. Vorbedingungen ────────────────────────────────────────────────────────
step "Vorbedingungen prüfen"
# Nicht als root starten: der Build läuft im Repo und würde root-eigene
# dist/-Dateien hinterlassen, die den nächsten Build von grafg blockieren.
if [ "$(id -u)" -eq 0 ]; then
  die "bitte als normaler User starten (sudo nutzt das Skript selbst)"
fi
[ -d "$APP_DIR" ] || die "App-Verzeichnis fehlt: $APP_DIR"
command -v node >/dev/null || die "node nicht im PATH (systemweites Node fehlt?)"
case "$(node --version)" in
  v24.*) info "node $(node --version) ($(command -v node)), npm $(npm --version)" ;;
  *) die "Node 24 erwartet, gefunden: $(node --version)" ;;
esac
command -v rsync >/dev/null || die "rsync fehlt"
sudo -n true 2>/dev/null || die "passwortloses sudo nicht verfügbar"
[ -f "$APP_DIR/package-lock.json" ] || die "package-lock.json fehlt"

# ── 1. Build ────────────────────────────────────────────────────────────────
step "Abhängigkeiten (Repo, inkl. devDependencies für den Build)"
LOCK_MARKER="$APP_DIR/node_modules/.package-lock.json"
if [ ! -d "$APP_DIR/node_modules" ] || [ ! -f "$LOCK_MARKER" ] ||
  [ "$APP_DIR/package-lock.json" -nt "$LOCK_MARKER" ]; then
  npm --prefix "$APP_DIR" ci --no-audit --no-fund
else
  info "node_modules aktuell"
fi

step "Build (Client + SSR + Prerender)"
(cd "$APP_DIR" && npm run build)

# ── 2. dist prüfen ──────────────────────────────────────────────────────────
step "Build-Artefakte prüfen"
for required in index.html 404.html tokens.html tokens-fallback.html sitemap.xml robots.txt \
  status/index.html angebote/index.html faq/index.html milestones/index.html \
  anleitung/tokens/index.html anleitung/openwebui/index.html; do
  [ -s "$APP_DIR/dist/$required" ] || die "dist/$required fehlt oder ist leer"
done
for required in assets; do
  [ -d "$APP_DIR/dist/$required" ] || die "dist/$required fehlt"
done
DIST_SUM="$(cd "$APP_DIR/dist" && find . -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum | cut -d' ' -f1)"
info "dist-Prüfsumme ${DIST_SUM:0:16}…"

# ── 3. Release anlegen ──────────────────────────────────────────────────────
PREVIOUS=""
if [ -L "$CURRENT" ]; then
  PREVIOUS="$(readlink -f "$CURRENT" || true)"
fi

if [ -f "$CURRENT/.deploy-sum" ] && [ "$(sudo -n cat "$CURRENT/.deploy-sum" 2>/dev/null || true)" = "$DIST_SUM" ] && [ "$FORCE" -eq 0 ]; then
  info "dist unverändert — kein neues Release (--force erzwingt eines)"
  NEW_RELEASE="$(readlink -f "$CURRENT")"
  RELEASE_CHANGED=0
else
  STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
  NEW_RELEASE="$RELEASES/$STAMP"
  [ -e "$NEW_RELEASE" ] && NEW_RELEASE="$RELEASES/${STAMP}-$$"
  step "Release anlegen: $NEW_RELEASE"
  sudo -n install -d -o root -g root -m 0755 "$RELEASES"
  # Build in ein temporäres Verzeichnis neben dem Ziel kopieren und erst dann
  # umbenennen — ein halb kopiertes Release ist nie unter seinem Endnamen sichtbar.
  sudo -n rm -rf "$NEW_RELEASE.tmp"
  sudo -n install -d -o root -g root -m 0755 "$NEW_RELEASE.tmp"
  RSYNC_OPTS=(-a --delete --chown=root:root --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r)
  sudo -n rsync "${RSYNC_OPTS[@]}" "$APP_DIR/dist/" "$NEW_RELEASE.tmp/dist/"
  # Prüfsumme bewusst *außerhalb* von dist/ (sonst als Datei erreichbar).
  printf '%s\n' "$DIST_SUM" | sudo -n tee "$NEW_RELEASE.tmp/.deploy-sum" >/dev/null
  sudo -n chmod 0644 "$NEW_RELEASE.tmp/.deploy-sum"
  sudo -n mv -T "$NEW_RELEASE.tmp" "$NEW_RELEASE"
  RELEASE_CHANGED=1
fi

# ── 4. Produktions-Install des Servers ──────────────────────────────────────
step "Server-Install unter $APP_RUNTIME synchronisieren"
SRC_SUM="$(cd "$APP_DIR" && find server src drizzle db scripts package.json package-lock.json \
  tsconfig.json -type f ! -name '*.test.ts' -print0 | sort -z | xargs -0 sha256sum |
  sha256sum | cut -d' ' -f1)"
sudo -n install -d -o root -g root -m 0755 "$APP_RUNTIME"
for entry in package.json package-lock.json tsconfig.json server src drizzle db scripts; do
  [ -e "$APP_DIR/$entry" ] || die "$entry fehlt im Repo"
  # Trailing Slashes beidseitig: `server` → `app/server/`, nicht `app/server/server/`.
  if [ -d "$APP_DIR/$entry" ]; then
    sudo -n rsync -a --delete --chown=root:root --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r \
      --exclude '*.test.ts' "$APP_DIR/$entry/" "$APP_RUNTIME/$entry/"
  else
    sudo -n rsync -a --chown=root:root --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r \
      "$APP_DIR/$entry" "$APP_RUNTIME/$entry"
  fi
done
# Der Dienst liest die vorgerenderten Dokumente (/tokens) aus dem aktiven Release.
sudo -n ln -sfn ../current/dist "$APP_RUNTIME/dist"

RUNTIME_LOCK_SUM="$(sha256sum "$APP_DIR/package-lock.json" | cut -d' ' -f1)"
INSTALLED_LOCK_SUM=""
[ -f "$APP_RUNTIME/.lock-sum" ] && INSTALLED_LOCK_SUM="$(sudo -n cat "$APP_RUNTIME/.lock-sum")"
if [ "$RUNTIME_LOCK_SUM" != "$INSTALLED_LOCK_SUM" ] || [ ! -d "$APP_RUNTIME/node_modules" ]; then
  step "npm ci --omit=dev (Produktionsabhängigkeiten)"
  # umask 022: der Dienst-User kik-app muss nur *lesen* — root-typische 0700
  # auf node_modules würde den Start mit EACCES verhindern.
  sudo -n env PATH="$PATH" HOME=/root bash -c 'umask 022 && exec npm --prefix "$1" ci --omit=dev --no-audit --no-fund' _ "$APP_RUNTIME"
  printf '%s\n' "$RUNTIME_LOCK_SUM" | sudo -n tee "$APP_RUNTIME/.lock-sum" >/dev/null
else
  info "node_modules (Produktion) aktuell"
fi
# Leserechte für www-data (statisch) und kik-app (Dienst) sicherstellen.
sudo -n chmod -R a+rX "$APP_RUNTIME"
[ -f "$APP_RUNTIME/node_modules/tsx/dist/cli.mjs" ] || die "tsx fehlt im Produktions-Install"
sudo -n -u kik-app test -r "$APP_RUNTIME/node_modules/tsx/dist/cli.mjs" ||
  die "kik-app kann $APP_RUNTIME nicht lesen"
sudo -n -u kik-app test -r "$NEW_RELEASE/dist/tokens.html" ||
  die "kik-app kann das Release $NEW_RELEASE nicht lesen"

# ── 5. Release atomar umschalten ────────────────────────────────────────────
step "current umschalten"
if [ "$(readlink -f "$CURRENT" 2>/dev/null || true)" != "$(readlink -f "$NEW_RELEASE")" ]; then
  sudo -n ln -sfn "$NEW_RELEASE" "$RUN_ROOT/.current.tmp"
  sudo -n mv -T "$RUN_ROOT/.current.tmp" "$CURRENT"
fi
info "current -> $(readlink -f "$CURRENT")"

# ── 6. Dienst neu starten + Health-Check ────────────────────────────────────
if systemctl list-unit-files "$SERVICE.service" >/dev/null 2>&1 &&
  [ -n "$(systemctl list-unit-files "$SERVICE.service" --no-legend 2>/dev/null)" ]; then
  INSTALLED_SRC_SUM="$(sudo -n cat "$APP_RUNTIME/.runtime-sum" 2>/dev/null || true)"
  NEEDS_RESTART=0
  if [ "${RELEASE_CHANGED:-0}" -eq 1 ] || [ "$FORCE" -eq 1 ] || [ "$SRC_SUM" != "$INSTALLED_SRC_SUM" ]; then
    NEEDS_RESTART=1
  fi
  health_ok() {
    for _ in $(seq 1 20); do
      code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 5 "$HEALTH_URL" || true)"
      # Ohne Session antwortet /api/auth/me mit 401 — genau das ist der Beweis,
      # dass der Proxy-Pfad bis in die App durchgeht. 503 = App läuft, aber die
      # Portal-Konfiguration fehlt (kein Grund, das Deployment zurückzurollen).
      case "$code" in
        401 | 503) return 0 ;;
      esac
      sleep 0.5
    done
    return 1
  }

  if [ "$NEEDS_RESTART" -eq 1 ]; then
    step "systemctl restart $SERVICE"
    sudo -n systemctl restart "$SERVICE"
  else
    info "unverändert — kein Neustart (nur Health-Check)"
  fi

  if [ "$HEALTH" -eq 1 ]; then
    if ! health_ok; then
      if [ "$NEEDS_RESTART" -eq 0 ]; then
        # Nichts geändert, Dienst antwortet aber nicht → einmal neu starten.
        echo "[deploy] Dienst antwortet nicht (${code:-?}) — Neustart" >&2
        sudo -n systemctl restart "$SERVICE"
      fi
    fi
    if ! health_ok; then
      echo "[deploy] Health-Check fehlgeschlagen (letzter Status: ${code:-?})" >&2
      if [ -n "$PREVIOUS" ] && [ "$(readlink -f "$PREVIOUS")" != "$(readlink -f "$CURRENT")" ]; then
        echo "[deploy] Rollback auf $PREVIOUS" >&2
        sudo -n ln -sfn "$PREVIOUS" "$RUN_ROOT/.current.tmp"
        sudo -n mv -T "$RUN_ROOT/.current.tmp" "$CURRENT"
        sudo -n systemctl restart "$SERVICE" || true
      fi
      die "Deployment zurückgerollt"
    fi
    info "Health-Check ok ($HEALTH_URL → $code)"
  fi
  printf '%s\n' "$SRC_SUM" | sudo -n tee "$APP_RUNTIME/.runtime-sum" >/dev/null
  sudo -n chmod 0644 "$APP_RUNTIME/.runtime-sum"
else
  info "Unit $SERVICE.service ist nicht installiert — Dienst-Schritt übersprungen"
fi

# ── 7. nginx (nur bei gesetzter Quelle und echter Änderung) ─────────────────
if [ -n "$NGINX_SRC" ]; then
  [ -f "$NGINX_SRC" ] || die "nginx-Quelle fehlt: $NGINX_SRC"
  DEST="/etc/nginx/sites-available/kik.spengergasse.at"
  if ! sudo -n diff -q "$NGINX_SRC" "$DEST" >/dev/null 2>&1; then
    step "nginx-VHost installieren + reload"
    sudo -n install -o root -g root -m 0644 "$NGINX_SRC" "$DEST"
    sudo -n nginx -t
    sudo -n systemctl reload nginx
  else
    info "nginx-VHost unverändert"
  fi
fi

# ── 8. Alte Releases aufräumen ──────────────────────────────────────────────
step "Releases aufräumen (behalte $KEEP)"
CURRENT_REAL="$(readlink -f "$CURRENT")"
mapfile -t ALL < <(find "$RELEASES" -mindepth 1 -maxdepth 1 -type d ! -name '*.tmp' -printf '%f\n' | sort -r)
for i in "${!ALL[@]}"; do
  [ "$i" -lt "$KEEP" ] && continue
  victim="$RELEASES/${ALL[$i]}"
  [ "$(readlink -f "$victim")" = "$CURRENT_REAL" ] && continue
  info "entferne $victim"
  sudo -n rm -rf "$victim"
done
info "$(find "$RELEASES" -mindepth 1 -maxdepth 1 -type d | wc -l) Release(s) vorhanden"

# ── 9. Bericht ──────────────────────────────────────────────────────────────
LIVE_CODE="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 https://kik.spengergasse.at/ || true)"
echo "[deploy] fertig: Release $(basename "$(readlink -f "$CURRENT")") — https://kik.spengergasse.at/ (HTTP $LIVE_CODE)"
echo "[deploy] Rollback: sudo ln -sfn $(basename "${PREVIOUS:-<release>}") $RUN_ROOT/.current.tmp && sudo mv -T $RUN_ROOT/.current.tmp $CURRENT && sudo systemctl restart $SERVICE"
