# Status des Projekts

_Stand: 2026-10-11_

Das KI-Kustodiat ist in der **Explorationsphase**: Der Dienst ist erreichbar und erste
Bausteine laufen produktiv, die zentrale Modellversorgung ist aber noch nicht eingerichtet.

## Was schon läuft

- **Open WebUI** als Chat-Frontend, erreichbar unter
  <https://openwebui.kik.spengergasse.at> — im Schulnetz über HTTPS.
- **Anmeldung über das Schul-Verzeichnis (LDAP)** — ein Spengergassen-Login, kein separates
  Konto und kein E-Mail-Formular.
- **Bring Your Own Token (BYOK):** Willst du ein eigenes Modell nutzen, bindest du deinen
  Provider-Account selbst ein. Siehe [Anleitung](openwebui-anleitung.md).
- **Spracherkennung (Whisper) im Haus:** Die Audio-Transkription läuft zu **100 % lokal** auf
  einer gespendeten Grafikkarte. Es verlassen keine Audiodaten die Schule.
- **Metasuche (SearXNG)** über eine schuleigene Suchinstanz.
- **Webseite und Diskussionsforum**: dieser Webauftritt auf dem schuleigenen Server sowie
  die [GitHub-Diskussionen](https://github.com/Die-Spengergasse/KI-Kustodiat/discussions) für
  Ideen, Wünsche und Erwartungen.

## Was noch fehlt oder eingeschränkt ist

- **Noch keine zentralen KI-Modelle.** Bis die zentrale Modellversorgung steht, musst du ein
  eigenes Modell einbinden (BYOK).
- **Hardware-Entscheidung offen.** Der Vorschlag ist eine dauerhafte Inferenzquelle in der
  Schule (128/256 GB VRAM) im Zusammenspiel mit zugekauften Tokens.
- **Tool-Aufrufe (Tool-Calling) über LiteLLM** sind im Streaming noch fehlerhaft — betrifft
  fortgeschrittene Funktionen, nicht den normalen Chat.

## Nächste Schritte

- Bedarf klären und **Beschaffung** aufsetzen: Gespräche mit den Abteilungen, Angebote von
  Anbietern (teils über die BBG).
- **Zentrale Modellversorgung** aufbauen und LiteLLM wieder in Betrieb nehmen.
- Laufend: Rückmeldungen aus dem Kollegium einsammeln — gerne in den
  [Diskussionen](https://github.com/Die-Spengergasse/KI-Kustodiat/discussions).

---

Zurück zur [Startseite](#/) · [Milestones](milestones.md) · [Anleitung](openwebui-anleitung.md)
