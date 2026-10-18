# LLM-Provider-Rundmail — Einzel-Drafts

Aufgetröst aus `docs/extern/provider-anfragen.md` (Research-Datei mit Kernbefunden,
Links und Adressaten bleibt dort). Hier liegt **eine Datei pro E-Mail**, nummeriert
nach der **Versand-Reihenfolge**.

> **Warum eine Mail je Adressat?** Die Adressaten sind zu unterschiedlich
> (Kooperations-Pilot, Fachverständigungs-Fragen, Preisangebot,
> Beschaffungs-Signal, Bestandskundenauftrag). Die frühere Sammel-Mail ist obsolet.

## Versand-Reihenfolge

Die Datei-Nummer entspricht der Versand-Position — Dateisortierung = Sende-Reihenfolge.

| # | Datei | Adressat | Vermerk |
|---|---|---|---|
| 01 | `01-acomarket-academic-ai.md` | ACOmarket (`office@acomarket.ac.at`) | Start — keine Abhängigkeit |
| 02 | `02-aconet-ocre-2024.md` | ACOnet (`cloud@aco.net`) | keine Abhängigkeit — parallel zu 01 möglich |
| 03 | `03-exoscale-gpu-dedicated-inference.md` | Exoscale via A1 (`sales.austria@exoscale.com`) | ⏳ wartet auf Antwort von 02 |
| 04 | `04-softwareone-copilot-chat.md` | SoftwareOne EDU (`edu.at@softwareone.com`) | keine Abhängigkeit — jederzeit parallel möglich |
| 05 | `05-bbg-ki-llm-positionen.md` | BBG (`office@bbg.gv.at`) | ⏳ bewusst zuletzt, idealerweise nach 01–03 |
| 06 | `06-cortecs-nachtrag.md` | Cortecs (`enterprise@cortecs.ai`) | ⏳ idealerweise nach erster Antwort von 01 — versandfertig |

**Abhängigkeitskette (Übersicht):** 02 → 03 (OCRE-Berechtigung vor Kostenvoranschlag),
01/02/03 → 05 (Signal-Mail zuletzt), 01 → 06 (Cortecs erst, wenn die Academic-AI-Frage
sichtbar ist). 04 ist unabhängig.

## Weitere Adressaten (noch ohne eigenen Draft)

In `provider-anfragen.md` als Kontakte erfasst, aber noch ohne Mail-Entwurf:

| Adressat | Kontakt | Betrifft |
|---|---|---|
| **Academic AI Support** | `support@academic-ai.at` | Test-Accounts, Support, Benutzerhandbuch |
| **ACOnet allgemein** | `admin@aco.net` (+43-1-4277-14030) | Teilnahme/Anbindung (wir sind bereits Teilnehmer) |
| **ACONET Community** | `community@aconet.at` (David Urbaner) | Community/Infoshare-AI-Format, Mailingliste AI |
| **cloud-discuss Mailingliste** | `noc.aco.net/mailman/listinfo/cloud-discuss` | Niederschwelliger Erstkontakt in der OCRE-Community |

## Tonalität (Muster aus 01)

- **Ich = persönliche Stimme, wir = Schul-Fakten.** Beweggründe und Handlungen
  („Ich schreibe Ihnen als Kustode …", „Meine Fragen", „Ich würde …") stehen in
  der Ich-Form; Schulstatistik, Infrastruktur und Vertragsinhalte bleiben „wir".
- **Kustode-Intro** im ersten Absatz, mit der Herkunft der Rolle („als Kustode
  des KI-Kustodiates der HTL Spengergasse").
- **Leichtes Augenzwinkern** in der Überleitung („Damit diese schöne
  Infrastruktur auch zum Leben erwacht …") — bei Behörden und Fördergebern
  (ACOnet, BBG) sparsamer einsetzen als bei kommerziellen Providern.
- **Diplomatische Frageform** („Können Sie bitte bestätigen …") statt Imperativ.
- **Text-only für Outlook:** keine Markdown-Auszeichnung im Mailtext, URLs in
  spitzen Klammern; Zeilenumbrüche von Hand, damit nichts mit `--` oder `-`
  beginnt (wird sonst in Outlook zu einem Aufzählungszeichen).

## Master-Token-Paradigma (in allen Mails angeboten)

Unser bevorzugtes Betriebsmodell — als **technische Möglichkeit, nicht als
Bedingung** formuliert:

> Der Provider stellt **einen institutionellen Master-Token** bereit. Unser
> LiteLLM-Proxy erzeugt daraus individuelle Tokens für Schüler:innen und
> Lehrkräfte, samt Budgets und Rate-Limits. Der Provider muss keine ~2.600
> Accounts verwalten, und es fließen keine Schüler-Identitäten zu ihm
> (Datensparsamkeit im Sinne der DSGVO).

Deshalb fragen wir nach den **Rate-/Volumen-Limits auf Masterebene** (RPM/TPM,
gleichzeitige Requests) und nach der Verbrauchsauswertung pro Schlüssel — nicht
nach Per-User-Limits. `docs/ai/DECISIONS.md` (2026-10-18) hält die Entscheidung fest.

## Checkliste vor Versand (je Mail)

- [ ] Schülerzahl / Klassenanzahl aktuell verifizieren
- [ ] Projekt-URL `https://kik.spengergasse.at` prüfen (Status-Seite aktuell?)
- [ ] Volumen-/Szenario-Zahlen gegen `docs/extern/on-premise-vs-api-kalkulation.md` abgleichen
- [ ] Schul-UID / Rechnungsadresse offiziell bestätigen (relevant v. a. 03 Exoscale)
- [ ] `u:ai` als €20/User/Monat-Referenz vor Versand verifizieren (in 01 Punkt 2 genannt)
- [ ] Mit Direktion / IT-Leitung abstimmen (relevant v. a. 01 ACOmarket und 04 SoftwareOne
      — diese Mails können zu echten Vertragsabschlüssen führen)
- [ ] Gesendete Fassung nach `docs/extern/mail-archiv/` archivieren

## Grundlagen

- Research, Kernbefunde und Quellen: `docs/extern/provider-anfragen.md`
- BBG-Hardware/GPU-Server (ergänzend zu 05): `docs/extern/bbg-hardware-anfrage-email-draft.md`
- Cortecs-Evaluation (Referenz für 06): `docs/extern/cortecs-provider-evaluation.md`

> URLs in den Mails sind text-only (Outlook rendert kein Markdown).
