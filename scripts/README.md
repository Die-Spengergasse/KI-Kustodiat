# scripts

Betriebs- und Prüfskripte des Kustodiats. Alle laufen **auf `kik`** (oder gegen
die veröffentlichten Endpunkte), nicht in der CI — sie brauchen den echten
Gateway, die echte GPU oder `sudo`.

| Skript | Zweck | Aufruf |
| --- | --- | --- |
| `deploy-app.sh` | Website + Portal ausrollen (Build → Release → Symlink → Health-Check → Prune) | `bash scripts/deploy-app.sh` (als `grafg`, **nicht** mit `sudo`) |
| `run-offers-job.sh` | Headless-Angebots-Job (systemd-Timer, Mo 06:00) | vom Timer; Modell ist gepinnt |
| `test-stt-api.mjs` | API-Testsuite für den Speech-to-Text-Endpunkt (Issue #55) | `node scripts/test-stt-api.mjs` |

## `test-stt-api.mjs`

Prüft den **veröffentlichten** STT-Pfad (`https://whisper.kik.spengergasse.at`)
gegen den echten Gateway und die echte GPU — nicht gegen Mocks. Die Suite legt
sich dafür einen Wegwerf-User samt Keys an und räumt ihn wieder ab; sie kann
also auf der Produktion laufen.

Geprüft werden: exponierte Routen (nur `/v1/audio/transcriptions` und
`/v1/models`), Auth (ohne/falscher/widerrufener Key), Discovery inkl.
Modus und Namensfilter, Transkription in `json`/`verbose_json`/`text` inkl.
Wort-Zeitmarken, Client-Fehler (unbekanntes Modell, fehlende Datei,
Nicht-Audio), Rate-Limits (pro Key und per nginx), Nebenläufigkeit und die
Spend-Zeile.

```bash
node scripts/test-stt-api.mjs            # vollständig (~1 min, inkl. 20 s Wartezeit)
node scripts/test-stt-api.mjs --quick    # ohne Limits/Nebenläufigkeit/Buchhaltung
STT_BASE=http://127.0.0.1:4000 node scripts/test-stt-api.mjs --no-nginx
```

Exit-Code 0 = alles grün. Der Admin-Key wird aus
`/etc/litellm/proxy_admin.key` gelesen (`sudo -n`), überschreibbar per
`PROXY_ADMIN_KEY` oder `PROXY_ADMIN_KEY_FILE`.

**Bewusste Abweichung, die die Suite dokumentiert:** `response_format=text`
liefert über das Gateway JSON (`{"text": …}`) statt reinem Text — LiteLLM parst
die Antwort des Backends. Beide aktuellen Clients (`Polished Recognition`,
`aitranscribe`) nutzen `verbose_json` und sind davon nicht betroffen; wer
reinen Text braucht, liest das Feld `text`.
