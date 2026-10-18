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
| 06 | `06-cortecs-nachtrag.md` | Cortecs (`enterprise@cortecs.ai`) | keine Abhängigkeit — manuell zusammenzusetzen |

## Weitere Adressaten (noch ohne eigenen Draft)

In `provider-anfragen.md` als Kontakte erfasst, aber noch ohne Mail-Entwurf:

| Adressat | Kontakt | Betrifft |
|---|---|---|
| **Academic AI Support** | `support@academic-ai.at` | Test-Accounts, Support, Benutzerhandbuch |
| **ACOnet allgemein** | `admin@aco.net` (+43-1-4277-14030) | Teilnahme/Anbindung (wir sind bereits Teilnehmer) |
| **ACONET Community** | `community@aconet.at` (David Urbaner) | Community/Infoshare-AI-Format, Mailingliste AI |
| **cloud-discuss Mailingliste** | `noc.aco.net/mailman/listinfo/cloud-discuss` | Niederschwelliger Erstkontakt in der OCRE-Community |

## Checkliste vor Versand (je Mail)

- [ ] Schülerzahl / Klassenanzahl aktuell verifizieren
- [ ] Projekt-URL `https://kik.spengergasse.at` prüfen (Status-Seite aktuell?)
- [ ] Volumen-/Szenario-Zahlen gegen `docs/extern/on-premise-vs-api-kalkulation.md` abgleichen
- [ ] Schul-UID / Rechnungsadresse offiziell bestätigen (relevant v. a. 03 Exoscale)
- [ ] Mit Direktion / IT-Leitung abstimmen (relevant v. a. 01 ACOmarket und 04 SoftwareOne
      — diese Mails können zu echten Vertragsabschlüssen führen)
- [ ] Gesendete Fassung nach `docs/extern/mail-archiv/` archivieren

## Grundlagen

- Research, Kernbefunde und Quellen: `docs/extern/provider-anfragen.md`
- BBG-Hardware/GPU-Server (ergänzend zu 05): `docs/extern/bbg-hardware-anfrage-email-draft.md`
- Cortecs-Evaluation (Referenz für 06): `docs/extern/cortecs-provider-evaluation.md`

> URLs in den Mails sind text-only (Outlook rendert kein Markdown).
