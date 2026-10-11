# Open WebUI — Anleitung

Diese Anleitung beschreibt den **Zugang zum Chat** und das **Einbinden eigener KI-Modelle**.
Open WebUI ist das Chat-Frontend des Kustodiats, betrieben auf schuleigenen Servern unter
<https://openwebui.kik.spengergasse.at>.

## Anmelden

Für den Chat ist ein **Spengergassen-Login** erforderlich:

- **Benutzername:** der Teil deiner Schul-Mailadresse **vor dem `@`-Zeichen** — also
  z.&nbsp;B. `vorname.nachname` aus `vorname.nachname@spengergasse.at`.
- **Passwort:** dein normales Schulpasswort.

Es gibt **kein** separates Konto und **kein** E-Mail-Formular — die Anmeldung läuft
ausschließlich über das Schul-Verzeichnis (LDAP).

## Warum Open WebUI?

Open WebUI ist ein **bewährtes Werkzeug** mit großer Community und besonders geeignet für
**Retrieval Augmented Generation (RAG)** und Recherche — Dokumente einwerfen, Fragen stellen,
mit Quellen arbeiten. Es ist als Selbst-Hosting-Lösung genau für einen datenschutzkonformen
Betrieb wie unseren gemacht. Projekt-Homepage: <https://openwebui.com>

## Infrastruktur & Modelle

Wir sind in der **Explorationsphase**. Open WebUI läuft bereits, aber **zentrale KI-Modelle
sind noch keine konfiguriert** — bis zur zentralen Modellversorgung bringst du dein eigenes
Modell ein (siehe unten).

Was bereits **100 % im Haus** läuft: die **Audio-Transkription** (Sprache → Text) auf einer
gespendeten Grafikkarte. Keine Audiodaten verlassen dafür die Schule. Auch die **Metasuche**
läuft über eine schuleigene Instanz.

## Eigenes Modell einbinden (Personal Connections / BYOK)

Open WebUI bringt fertige **Presets** für die großen Provider mit: In
*Einstellungen → Verbindungen* (Personal Connections) kannst du deine eigenen
Provider-Accounts mit deinem **eigenen API-Token** anbinden. Vorintegriert sind:
**OpenAI, Anthropic, Google, Mistral, Groq, OpenRouter und xAI**.

| Anbieter (Preset) | Basis-URL | Key herbekommen | Modell-ID (Beispiele) |
|---|---|---|---|
| OpenAI | `https://api.openai.com/v1` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | `gpt-…` |
| Anthropic | `https://api.anthropic.com/v1` | [console.anthropic.com](https://console.anthropic.com) | `claude-…` |
| Google | `https://generativelanguage.googleapis.com/v1beta` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | `gemini-…` |
| Mistral | `https://api.mistral.ai/v1` | [console.mistral.ai](https://console.mistral.ai) | `mistral-…` |
| Groq | `https://api.groq.com/openai/v1` | [console.groq.com/keys](https://console.groq.com/keys) | `llama-…`, `gpt-oss-120b` (offenes Modell, sehr schnell) |
| OpenRouter | `https://openrouter.ai/api/v1` | [openrouter.ai/keys](https://openrouter.ai/keys) | `openai/gpt-…`, `anthropic/claude-…` u.&nbsp;v.&nbsp;m. ([Modellliste](https://openrouter.ai/models)) |
| xAI | `https://api.x.ai/v1` | [console.x.ai](https://console.x.ai) | `grok-…` |

1. **Key besorgen:** Beim Anbieter anmelden (Abo bzw. Gratis-Account), API-Key kopieren.
2. **Verbindung anlegen:** In Open WebUI zu *Einstellungen → Verbindungen* gehen, eine
   *OpenAI-kompatible Verbindung* hinzufügen und Basis-URL plus Key eintragen.
3. **Modell wählen:** Die gewünschte Modell-ID aus der Tabelle (bzw. der
   Anbieter-Modellliste) eintragen und speichern.
4. **Loschatten:** Im Modell-Picker das neue Modell auswählen.

**Empfehlung (vorläufig):** Konfiguriere eine **bestehende Provider-Subscription** — das ist
aktuell der zuverlässigste Weg. Dies gilt so lange, bis entweder **eigene Hardware**
angeschafft ist oder **Token-Kontingente über das Schulbudget** erworben werden können.
Diese Kontingente werden insbesondere beim **agentischen Coding** relevant — und dann, wenn
die Gratis-Angebote am Internet wieder zurückgehen.

> **Hinweis:** Eigene Keys liegen technisch am Server (die Anfragen stellt unser Backend) —
> bitte keine sensiblen Daten an US-/China-Anbieter schicken, solange kein EU-Datenschutzvertrag
> besteht. Details klärt das Kustodiat mit der zentralen Modellversorgung.

## Hinweis: nicht OpenCode-kompatibel

Open WebUI ist **nicht** mit OpenCode kompatibel — die OpenCode-/Zen-Angebote funktionieren hier
nicht. Für das **Coding** am Terminal ist OpenCode die bessere Wahl; für den **Chat** hier in
Open WebUI gilt die Empfehlung oben.

---

Zurück zur [Startseite](#/) · [Status](status.md) · [Plan](plan.md)
