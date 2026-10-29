# Anleitung — Token und Diktat

Es gibt zwei Wege ins KI-Kustodiat: **im Browser chatten** (ohne Token) und
**über die API arbeiten** (mit Token). Diese Seite erklärt beides — und wie du
Sprache zu Text umwandeln lässt.

## Wofür brauchst du einen Token?

| Wofür | Token nötig? | Adresse |
| --- | --- | --- |
| Chat im Browser (Open WebUI) | nein, Schul-Login genügt | <https://openwebui.kik.spengergasse.at> |
| Coding-Assistent, Skripte, eigene Programme | **ja** | `https://api.kik.spengergasse.at/v1` |
| Diktat / Sprache zu Text | **ja** | `https://whisper.kik.spengergasse.at/v1/` |
| Portal selbst (Schlüssel, Verbrauch) | nein, nur Login | <https://kik.spengergasse.at/portal> |

## Token erzeugen

1. <https://kik.spengergasse.at/portal> öffnen und mit dem **Schul-Login**
   anmelden (Benutzername = Teil vor dem `@` deiner Schuladresse, Passwort =
   Schulpasswort — dasselbe wie im Open WebUI).
2. **API-Keys → Schlüssel erzeugen**, eine Bezeichnung vergeben (z. B. „Laptop").
3. Der Schlüssel wird **genau einmal** angezeigt. Jetzt kopieren — später lässt
   er sich nicht mehr anzeigen, dann hilft nur ein neuer.
4. **Rotation** erzeugt einen neuen Schlüssel und macht den alten ungültig.
   **Widerrufen** sperrt einen Schlüssel sofort.

Pro Person sind bis zu zehn aktive Schlüssel möglich. Ein Schlüssel gilt für
Chat **und** Diktat.

## Chat und Coding

Für alles, was OpenAI-kompatibel ist, sind es zwei Einstellungen:

```bash
export OPENAI_API_KEY="<dein-token>"
export OPENAI_BASE_URL="https://api.kik.spengergasse.at/v1"
```

```bash
curl https://api.kik.spengergasse.at/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"<modell>","messages":[{"role":"user","content":"Hallo"}]}'
```

Welche Modelle freigeschaltet sind, zeigt `GET /v1/models` mit deinem Token.

## Diktat (Sprache zu Text)

Die Adresse ist unabhängig vom Chat-Endpunkt, der Ablauf ist derselbe wie bei
OpenAI:

- **Base-URL:** `https://whisper.kik.spengergasse.at/v1/`
- **Modell:** `whisper-large-v3`

```bash
curl https://whisper.kik.spengergasse.at/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F file=@aufnahme.ogg \
  -F model=whisper-large-v3 \
  -F response_format=verbose_json
```

`verbose_json` liefert zusätzlich `duration`, `language` und — mit
`timestamp_granularities[]=word` — Zeitmarken pro Wort.

**Bestehende Konfiguration?** Es ändert sich nur der Token, nicht die Adresse:
Base-URL bleibt `https://whisper.kik.spengergasse.at/v1/`, Modell heißt
`whisper-large-v3`. Ältere Konfigurationen mit `large-v3` funktionieren
weiterhin.

Das Diktat läuft **vollständig auf schuleigener Hardware** — Audiodaten
verlassen die Schule nicht.

## Grenzen und Kontingent

- **Monatskontingent:** im Portal unter **Verbrauch** als Prozentwert und in
  Tokens. Es wird am Monatsanfang zurückgesetzt.
- **Rate-Limit:** 120 Anfragen pro Minute und Schlüssel — gezählt über alle
  Modelle zusammen. Für normales Arbeiten reicht das deutlich; es bremst
  fehlerhafte Programme, die in einer Schleife Anfragen schicken.
- **Diktat zählt ins Monatskontingent — anteilig zur gesprochenen Zeit.**
  Zehn Diktate à einer Minute kosten so viel wie ein Diktat à zehn Minuten
  (abgerechnet wird der übliche Minutenpreis für Transkription). Stummes
  Mitlaufen lassen kostet also mit.
- Es gibt **eine** Grafikkarte für Sprache: wenn viele gleichzeitig diktieren,
  wartet die Anfrage, statt abzubrechen. Sehr lange Aufnahmen dauern
  entsprechend.

## Sicherheit

- Ein Token ist ein **Passwort**. Nicht in Git-Repositories, nicht in Chats,
  nicht per Mail weitergeben.
- Wenn ein Token verloren geht oder versehentlich geteilt wurde: im Portal
  **widerrufen** und einen neuen erzeugen. Das wirkt sofort.
- Im Browser (z. B. für Diktat-Tools) nur speichern, wenn du dem Gerät traust.

## Wenn etwas nicht geht

| Meldung | Bedeutung |
| --- | --- |
| `401` | Token fehlt, ist falsch oder wurde widerrufen — neu erzeugen. |
| `403` | Das Konto ist für das Portal nicht freigeschaltet (Rolle im Schul-Verzeichnis). |
| `429` | Zu viele Anfragen in kurzer Zeit — kurz warten und erneut versuchen. |
| Modell wird nicht gefunden | Modellname prüfen: `whisper-large-v3` beim Diktat, `GET /v1/models` für den Chat. |
| Im Diktat-Werkzeug stehen Coding-Modelle zur Auswahl | Der Client filtert die Modellliste nicht — `whisper-large-v3` direkt auswählen. |

## Datenschutz in zwei Sätzen

Prompts und Antworten werden **nicht** in den Verbrauchs-Logs gespeichert
(gespeichert werden nur Zähler und Kosten). Sprache-zu-Text läuft
ausschließlich auf schuleigener Hardware.

---

Zurück zur [Startseite](index.md) · [Status](status.md) · [FAQ](faq.md)
