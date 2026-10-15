# Provider-Anfragen — E-Mail-Drafts & Recherche (Issue #34)

> **Status:** Sammlung → Entwürfe. Georg überarbeitet vor Versand gründlich.
> **Priorität:** Sammel-Mail an die *vielen* Adressaten (OCRE/BBG/Provider).
> Cortecs ist ein separater, kurzer Nachtrag (siehe unten).

## Recherche-Links

- **Exoscale — Concrete AI, Dedicated Inference** (Quick-Start):
  <https://community.exoscale.com/product/concrete_ai/dedicated_inference/quick-start/>
- **OCRE-2024-Framework gestartet** (GEANT, News):
  <https://clouds.geant.org/news/ocre-2024-framework-officially-starts-empowering-european-research-and-education-with-extensive-cloud-service-offering/>
- **OCRE-2024-Katalog** (welche Provider/Services überhaupt Call-Off-fähig sind):
  <https://clouds.geant.org/ocre-2024-catalogue/>
- **GEANT-Ressourcen** (Übersicht):
  <https://clouds.geant.org/resources/>
- **Bechtle — Digitale Souveränität / OCRE / Azure**:
  <https://www.bechtle.com/public-sector/digitale-souveraenitaet/ocre/azure>
- **ACOnet — OCRE-2024 für österreichische Teilnehmerorganisationen**:
  <https://www.aco.net/ocre-2024.html>

## Recherche-Ergebnisse (2026-10-15)

> Quellen: aco.net (OCRE-2024-Seiten, Grundsätze, Teilnehmerliste), clouds.geant.org
> (Framework-FAQ, Catalogue, Institution Guide), acomarket.at/at (Academic AI),
> Academic-AI-Benutzerhandbuch 3.0 (Kunstuni Linz, Juli 2026), bbg.gv.at, BMBWF
> (MS-ACH, Parlamentsanfrage-Beantwortungen KI), BRZ (LLMaaS), GEANT Compendium
> (NREN AI services matrix, SIG-EDU/SIG-AI), IAedu (FCCN/PT), EduGenAI (SURF/NL).

### Kernbefunde

1. **HTL Spengergasse ist bereits ACOnet-Teilnehmerorganisation** — auf der
   offiziellen Teilnehmerliste (`aco.net/teilnehmer.html`, „HTBLVA Textil Wien V")
   und in der **ACOnet Identity Federation** (StudID-Liste). Damit sind OCRE-2024
   und Academic AI ohne Antragsstrecke für uns abrufbar.
2. **Academic AI (ACOmarket) ist der realistischste LLM-Weg über den Wissenschaftsnetz-Kanal:**
   - Secure Azure Landing Zone (EU-Rechenzentrum), DSGVO-Österreich-Konzept mit
     fertigen Vertragstexten, keine Trainingsnutzung, SSO via ACONET-Federation.
   - Version 3.0 (Juli 2026): Modelle von **OpenAI, Google, Mistral, Anthropic**;
     Tailored-AI-RAG (eigene Chatbots mit Wissensbasis), Internetsuche,
     Bildgenerierung; **API-Zugang seit v2.0** (Chat Completions + KB-Management,
     `X-Client-ID`/`X-Client-Secret`) → mit LiteLLM routbar.
   - Verrechnung: nutzungsabhängig monatlich nach tatsächlichen Tokens
     (Azure-Preisliste); Tokenkostenlimits pro User (univie-Referenz: €20/User/Monat)
     und pro Institution; Institutionen-Admins steuern Limits + Kostenreport (CSV).
   - Bereits 32 österreichische Institutionen (Hochschulen) an Bord; Beschaffung der
     Azure-Landing-Zone läuft über **OCRE** → kein eigenes Vergabeverfahren nötig.
   - Ungeklärt (→ Anfrage): nimmt ACOmarket **Schulen** (nicht nur Hochschulen)?
     Handbuch sagt „jede Institution mit aufrechtem Nutzungsvertrag" — Teilnehmerkreis
     formal offen; konkrete Token-Preise; API-Access-Scope für Schüler-Tools.
   - Limitation: nur Azure-Ökosystem-Modelle, **keine Open-Weight-Modelle**
     (DeepSeek/GLM/Qwen) → unser Hybrid-Plan (on-prem + Cortecs/Partner) bleibt
     bestehen; Academic AI wäre die EU-gedeckte Copilot-Ebene fürs Breitband-Deploys.
3. **OCRE 2024 (GÉANT, Laufzeit 2/2025–1/2030):** Rahmenvertrag für IaaS/PaaS/SaaS.
   Group-B-Definition schließt **„primary and secondary (or further) education
   institutions"** explizit ein → wir sind formal eligible; in AT erfolgt der Zugang
   über ACOnet (passiver Referrer, keine Cost-Recovery-Fee, Verträge direkt mit dem
   Provider; Support durch ACOmarket). **Aber: der Katalog enthält keine LLM-API-Position**
   (416 Offerings, 17 Plattformen) — OCRE liefert Rechenleistung, keine Tokens.
   - Österreich (13 Offerings, 8 Plattformen): AWS (Sparkle/SoftwareOne/PCG),
     Google (PCG/Sparkle/SoftwareOne), **Azure (Bechtle #1/SoftwareOne)**,
     IONOS (Bechtle), **Exoscale via A1 (#1, Rank)**, Open Telekom Cloud,
     CloudFerro, Setcor. Bei Direktvergabe gilt das **Wasserfallprinzip** (#1 zuerst).
   - Konkreter KI-Treffer: **Exoscale „Concrete AI / Dedicated Inference"**
     (GPU-Inferenz, EU-Datacenter Wien) — als GPU-IaaS-Overflow/Absicherung für
     unser on-prem-Setup über OCRE abrufbar.
4. **BBG:** Bundesschulen sind laut BBG-Gesetz verpflichtet, über BBG zu beschaffen
   (unsere Schule ist vermutlich bereits e-Shop-Kunde — MS-ACH läuft über BBG).
   - **MS-ACH (verlängert bis 31.5.2027)** enthält bereits **Microsoft Copilot Chat**
     für alle Bundesbediensteten + Schüler:innen → potenziell **sofort ohne
     Beschaffung nutzbar**; Lizenzfragen: `edu.at@softwareone.com` (SoftwareOne ist
     gleichzeitig OCRE-Provider #2 für AWS/Azure in AT).
   - **kloudease (AOE/Consileon)** über BBG-IT-Dienstleistungen: souveräne
     Cloud-Native-Plattform auf STACKIT in österreichischen Rechenzentren, inkl.
     „eigenes Unternehmens-GPT" und Agentic-Workflows — als BBG-Position abrufbar.
   - BRZ **LLMaaS** (on-prem, mandantenfähig, Basis für GovGPT/Public-AI-Initiative)
     richtet sich an BRZ-Kunden der Verwaltung — Schulen aktuell nicht im Fokus.
   - BMBWF-eigene KI: hausinternes Azure-OpenAI-KI-Portal nur für die Zentralstelle;
     „sicher nutzbare KI-Umgebung für Schulen" laut Ministerratsvortrag 16/10 (6/2025)
     **in Planung**; 100 KI-Pilotschulen-Programm (eEducation Austria) existiert.
     → Politischer Hebel: uns als Pionier-Schule mit lauffähiger Infrastruktur positionieren.
5. **GÉANT/Europa-Trend:** NREN-AI-Matrix (Compendium) zeigt ~15 NRENs mit
   AI-Services; Federated-LLM-Plattformen für Bildung existieren (IAedu/Portugal:
   GPT-4o/Mistral/AMALIA + API, 25k User; EduGenAI/NL via SURF+Npuls, Rollout
   Ende 2026). ACOnet bietet selbst **noch keinen** eigenen AI-Service — Academic AI
   via ACOmarket ist der österreichische Vorreiter. Unsere Anfrage kann genau hier
   Pionierarbeit für Schulen einleiten.

### Adressaten (final, mit geernteten Adressen)

| Adressat | Kontakt | Betrifft |
|---|---|---|
| **ACOmarket GmbH** | `office@acomarket.ac.at` (Ansprechpartner Academic AI: Mag. Michael Pisecki, +43 670 354 8193) | **Academic AI für Schulen** (Prio 1) — SSO, API, Preis |
| **Academic AI Support** | `support@academic-ai.at` | Test-Accounts, Support, Benutzerhandbuch |
| **ACOnet (OCRE-Team)** | `cloud@aco.net` | OCRE-2024-Zugang für Schulen, Teilnahme-Fragen |
| **ACOnet allgemein** | `admin@aco.net` (+43-1-4277-14030) | Teilnahme/Anbindung (wir sind bereits Teilnehmer) |
| **ACONET Community** | `community@aconet.at` (David Urbaner) | Community/Infoshare-AI-Format, Mailingliste AI |
| **cloud-discuss Mailingliste** | `noc.aco.net/mailman/listinfo/cloud-discuss` | Niederschwelliger Erstkontakt in der OCRE-Community |
| **BBG Helpcenter** | `office@bbg.gv.at`, +43 1 245 70-0 | Katalogpositionen KI/Cloud für Bundesschulen |
| **BBG Kundenmanagement** | `kundenmanagement@bbg.gv.at` | e-Shop-Zugang/Grundsatzvereinbarung |
| **Exoscale via A1 (OCRE AT #1)** | `sales.austria@exoscale.com` | Concrete AI / Dedicated Inference (GPU), OCRE-Abruf |
| **SoftwareOne (OCRE AT #2, MS-ACH EDU)** | `OCRE.EMEA@softwareone.com`, EDU: `edu.at@softwareone.com` | Azure/AWS OCRE-Konditionen + Copilot-Chat-Fragen |
| **Cortecs** | `enterprise@cortecs.ai` | separater kurzer Nachtrag (Bestandskunde) |

### Realistische Einschätzung für die HTL Spengergasse

- **Realistisch und schnell:** Academic AI-Teilnahme anfragen (wir sind ACOnet-Teilnehmer
  + Federation-Mitglied — kürzester Weg zu datenschutzkonformen LLMs mit SSO und API),
  parallel Copilot-Chat-Bestand aus MS-ACH aktivieren.
- **Realistisch, aber für Infrastruktur statt Tokens:** GPU-IaaS via OCRE (Exoscale
  Concrete AI via A1) als Backup/Overflow für das on-prem-Backend.
- **Nicht über OCRE/BBG:** LLM-API-Tokens mit Open-Weight-Modellen (DeepSeek/GLM/Qwen)
  — hier bleiben Direktverträge (Cortecs u. a.) der einzige Weg; BBG-Katalogposition
  „LLM-API" gibt es derzeit nicht → Anfrage an BBG als Signal setzen (Nachfrage erzeugen).
- **Politisch wertvoll:** BMBWF plant eine schulische KI-Umgebung erst — unsere
  lauffähige Infrastruktur + Academic-AI-Pionierstellung ist ein starkes Argument
  für die Budgetforderung (M2).

---

## Einzel-Drafts (2026-10-15) — eine Mail je Adressat

> Die frühere Sammel-Mail ist obsolet: Die Adressaten sind zu unterschiedlich
> (Kooperations-Pilot, Fachverständigungs-Fragen, Preisangebot, Beschaffungs-Signal,
> Bestandskundenauftrag). Fragensets wurden passend verteilt. Georg überarbeitet
> vor Versand gründlich. URLs text-only (Outlook rendert kein Markdown).

### Draft 1 — ACOmarket: Academic AI für eine ACOnet-Teilnehmerschule (Prio 1)

**An:** `office@acomarket.ac.at` (Ansprechpartner Academic AI: Mag. Michael Pisecki)
**Betreff:** Academic AI für eine ACOnet-Teilnehmerschule — Pionieranfrage HTL Spengergasse

Sehr geehrter Herr Mag. Pisecki, sehr geehrtes ACOmarket-Team,

die HTL Spengergasse (HTBLVA Wien V, ~2.600 Schüler:innen, ~280 Lehrkräfte,
97 Klassen) ist ACOnet-Teilnehmerorganisation und Mitglied der ACOnet Identity
Federation. Wir betreiben eine schuleigene KI-Infrastruktur (eigener Whisper-STT-,
LLM- und Open-WebUI-Stack, Anmeldung über das Schul-AD, siehe
https://kik.spengergasse.at) und suchen für den Breitband-Einsatz im Unterricht
eine datenschutzkonforme, EU-gehostete LLM-Plattform — Academic AI erscheint uns
dafür als der offenkundige Weg.

Unsere Anfrage in vier Punkten:

1. **Schulen als Abonnenten:** Bisher nutzen 32 Hochschulen Academic AI. Nimmt
   ACOmarket auch österreichische Schulen (Sekundarstufe II, Schulerhalter Bund)
   als Abonnenten an? Wir wären gern Pionierschule — ggf. als Pilot mit reduzierter
   Skala (1–2 Klassen, ~30 Tage), danach Ausweitung.
2. **Modelle & Konditionen:** Welche Modelle sind in v3.0 konkret verfügbar
   (OpenAI/Google/Mistral/Anthropic), und wie sind die Token-Preise? Welche
   Per-User-Limits empfehlen Sie für Schüler:innen der Sekundarstufe II
   (Referenz u:ai: €20/User/Monat)?
3. **API-Zugang:** Wir würden Academic AI über LiteLLM in unsere bestehende
   Infrastruktur routen. Umfang des API-Zugangs (Chat Completions,
   Tailored-AI-/Wissensbasis-Management), Authentifizierung
   (X-Client-ID/X-Client-Secret), Rate-Limits und Kostendetail pro API-Key?
4. **Formales:** Bestätigen Sie bitte, dass kein eigenes Vergabeverfahren
   notwendig ist (Beschaffung der Azure Secure Landing Zone durch ACOmarket
   über OCRE), und senden Sie ein Muster des Nutzungsvertrags sowie Ihr
   Datenschutzkonzept zu. Abrechnung monatlich nach tatsächlichem Tokenverbrauch,
   Limits von uns als Institutions-Admins steuerbar — korrekt?

Da SSO über die ACOnet Identity Federation bei uns bereits gegeben wäre, wäre
eine Aufnahme technisch für uns ohne Reibungsverluste denkbar.

Mit freundlichen Grüßen
Georg Graf
HTL Spengergasse, Spengergasse 20, 1050 Wien

### Draft 2 — ACOnet: OCRE-2024-Abruf durch eine Teilnehmerschule (Prio 2)

**An:** `cloud@aco.net`
**Betreff:** OCRE 2024 — Abruf durch eine ACOnet-Teilnehmerschule (HTBLVA Spengergasse)

Sehr geehrtes ACOnet-Team,

die HTL Spengergasse (HTBLVA Wien V) ist als Teilnehmerorganisation in der
Teilnehmerliste geführt und nutzt die ACOnet Identity Federation. Im Rahmen des
Aufbaus einer schuleigenen KI-Infrastruktur (siehe https://kik.spengergasse.at)
haben wir drei Verständnisfragen zum OCRE 2024 Framework:

1. Bestätigen Sie, dass ACOnet-Teilnehmerschulen (Sekundarstufe II, Schulerhalter
   Bund) OCRE-2024-Services auf dieselbe Weise ausschreibungsfrei abrufen können
   wie Hochschulen (Call-Off direkt mit dem Provider, ACOmarket-Unterstützung)?
2. Planen wir den Bezug von GPU-Inferenz-Rechenleistung (z. B. Exoscale „Concrete
   AI / Dedicated Inference" via A1, Rank #1 in Österreich). Gibt es aus Ihrer
   Sicht Besonderheiten bei Call-Offs für GPU-Workloads (Wasserfallprinzip,
   Mini-Competition)?
3. Nehmen wir die Gelegenheit wahr: Falls ACOmarket/ACOnet künftig über den
   OCRE-Kanal hinaus eigene AI-Services für den Teilnehmerkreis (inkl. Schulen)
   prüft — wir bringen uns als Pilotschule gern ein.

Falls für die Beantwortung der Detailfragen die ACOmarket GmbH zuständig ist,
wären wir für einen Hinweis an die richtige Stelle dankbar.

Mit freundlichen Grüßen
Georg Graf
HTL Spengergasse, Spengergasse 20, 1050 Wien

### Draft 3 — Exoscale via A1: GPU-Dedicated-Inference-Angebot (Prio 3)

**An:** `sales.austria@exoscale.com`
**Betreff:** Kostenvoranschlag GPU Dedicated Inference (OCRE 2024) — HTL Spengergasse

Sehr geehrtes Exoscale-Team,

die HTL Spengergasse (Wien, ~2.600 Schüler:innen, ~280 Lehrkräfte) betreibt eine
schuleigene LLM-Infrastruktur mit on-premise GPU-Backend (vLLM, Open WebUI,
LiteLLM-Routing; https://kik.spengergasse.at). Für Absicherung und
Lastspitzen (z. B. Schulwochen mit hohem Chat-Aufkommen) evaluieren wir
Exoscale „Concrete AI / Dedicated Inference" als EU-gehostete Overflow- und
Reserve-Infrastruktur — abrufbar über den OCRE 2024 Rahmenvertrag (Exoscale via
A1, OCRE-2024 Rank #1 in Österreich).

Bitte erstellen Sie uns einen Kostenvoranschlag für:

1. **Szenario A — Pilot:** eine dedizierte GPU-Instanz (moderne Datacenter-GPU,
   24–80 GB VRAM) für Modell-Hosting mit OpenAI-kompatibler API, EU-Datenzentrum
   (Wien), Laufzeit 3 Monate, planbare Abschaltung außerhalb der Schulwochen.
2. **Szenario B — Ausbau:** 2–4 GPU-Instanzen dauerhaft während der Schulzeiten
   (September–Juni), für Open-Weight-Inferenz-Modelle (Größenordnung 7B–70B
   Parameter), QPS-Spitzen ~50 gleichzeitige Anfragen.
3. **Konditionen:** Education-/R&E-Preise im Rahmen von OCRE 2024,
   Abrechnungsmodell (Reservierung vs. On-Demand), Einrichtungs-/Betriebsaufwand
   für Dedicated Inference, DPA/AVV für eine österreichische Bundesschule sowie
   Rechnungsstellung auf die Schule (UID-pflichtig).

Wir sind als ACOnet-Teilnehmerorganisation OCRE-berechtigt und können den Abruf
zügig formalisieren, sofern das Preisgepasst für unser Schulbudget passt.

Mit freundlichen Grüßen
Georg Graf
HTL Spengergasse, Spengergasse 20, 1050 Wien

### Draft 4 — BBG: KI-/LLM-Positionen für Bundesschulen (Prio 4)

**An:** `office@bbg.gv.at` (ggf. BCC/Zweitkontakt: `kundenmanagement@bbg.gv.at`)
**Betreff:** Anfrage Bundesschule — LLM-/KI-Dienstleistungen im BBG-e-Shop (HTL Spengergasse)

Sehr geehrtes BBG-Team,

die HTL Spengergasse (HTBLVA Wien V, ~2.600 Schüler:innen, ~280 Lehrkräfte,
97 Klassen) ist als Bundesschule BBG-Abnehmerin (e-Shop, Grundsatzvereinbarung)
und baut derzeit eine schuleigene, hybride KI-Infrastruktur auf: on-premise
Backend (STT, LLM-Inferenz) plus zugekaufte API-Dienste souveräner europäischer
Provider (siehe https://kik.spengergasse.at).

Unsere Anfragen:

1. **Bestand:** Gibt es im e-Shop aktuell Rahmenvereinbarungen oder Katalogpositionen
   für LLM-API-Dienste (Token-basierte Sprachmodell-Zukauf), KI-Plattformen
   (z. B. im Umfeld von GovGPT/Public AI) oder GPU-Inferenz-Rechenleistung, die
   für Bundesschulen abrufbar sind?
2. **Neubedarf:** Falls nicht — über welchen Weg gerät ein konkreter Bedarf
   „LLM-API für Bildungseinrichtungen" in Ihre Beschaffungsplanung (Beschaffungsgruppe,
   Bedarfsmeldung, Kontaktstelle)? Wir würden eine solche Position gern aktiv
   anstoßen, da wir davon ausgehen, dass viele Bundesschulen denselben Bedarf haben.
3. **Bestehende Positionen:** Wir nutzen den MS-ACH-Rahmenvertrag (Microsoft EDU
   Austria) und haben gesehen, dass über BBG abgewickelte Positionen wie
   Cloud-Plattformen (z. B. mit österreichischem Rechenzentrumsbezug) existieren.
   Gibt es dazu eine fachliche Ansprechperson, die uns für KI-/Cloud-Positionen
   beraten kann?

Mit freundlichen Grüßen
Georg Graf
HTL Spengergasse, Spengergasse 20, 1050 Wien

### Draft 5 — SoftwareOne EDU: Copilot Chat aus MS-ACH aktivieren (Prio 5)

**An:** `edu.at@softwareone.com`
**Betreff:** MS-ACH (Microsoft EDU Austria) — Microsoft Copilot Chat für HTL Spengergasse

Sehr geehrtes SoftwareOne-EDU-Team,

die HTL Spengergasse (HTBLVA Wien V) nimmt am MS-ACH-Rahmenvertrag (Microsoft EDU
Austria, über BBG) teil und stellt fest, dass „Microsoft Copilot Chat" als
Bestandteil des Agreements (M365 A3 für Bundesbedienstete und Schüler:innen)
ausgewiesen ist. Wir möchten das für unseren Schulbetrieb aktiv nutzen und haben
drei Fragen:

1. **Aktivierung:** Welche Schritte sind für die Aktivierung von Copilot Chat an
   unserer Schule notwendig (Tenant-Konfiguration, Synchronisierung mit dem
   Identitätsmanagement der Bundesportale/edu.IDAM, Lizenzzuweisung für
   Schüler:innen und Lehrkräfte)?
2. **Datenschutz/Konfiguration:** Welche Einstellungen empfiehlt Microsoft
   bzw. das BMBWF für den Schuleinsatz (Datenschutzkonfiguration, Teacher-Admin-
   Controls, Ruhe-/Altersgrenzen für Schüler:innen unter 18)?
3. **Ausblick:** Können über den MS-ACH-Weg zusätzlich Azure-OpenAI-Kapazitäten
   oder Azure-Dienste beziehbar gemacht werden — insbesondere über den
   OCRE-2024-Rahmenvertrag (SoftwareOne ist dort OCRE-Provider für AWS/Azure in
   Österreich)? Für einen zweiten, separaten OCRE-Strang (GPU/LLM-API) wären wir
   an Ihren Konditionen interessiert.

Mit freundlichen Grüßen
Georg Graf
HTL Spengergasse, Spengergasse 20, 1050 Wien

---

## Cortecs — Extra-Paragraph (zufriedener Kunde)

> Cortecs-Anfrage ist ein kurzer Nachtrag auf Basis des bestehenden, positiven
> Kundenverhältnisses — kein vollständiger Pitch nötig. Georg baut die finale
> Mail manuell zusammen (alter Draft unten als Referenz + dieser Paragraph):

Sehr geehrtes Cortecs-Team,

wir sind bereits zufriedener Kunde und nutzen Cortecs-Modelle produktiv in
unserer schuleigenen KI-Infrastruktur (LiteLLM-Routing, Open WebUI, Anmeldung
über das Schul-AD). Die Zusammenarbeit läuft zuverlässig und datenschutzseitig
unproblematisch. Mit der Ausweitung auf den regulären Schulbetrieb (alle
Klassen, Lehrkräfte und Verwaltung) ergeben sich für uns nun eine
handvoll konkrete Punkte — siehe unten.

*(Rest des Mail-Texts: Georg setzt manuell die relevanten Punkte aus dem
Referenz-Draft zusammen.)*

---

## Cortecs — vollständiger Einzel-Draft (Referenz, 2026-08-13)

> Nur noch als Referenz/Zulieferung für die finale Mail; die Punkte unten
> stammen aus der ursprünglichen Einzelanfrage.

Betreff: Anfrage Bildungseinrichtung — LLM-API für HTL Spengergasse

Die HTL Spengergasse (Wien, ~2.600 Schüler, 280 Lehrer, 97 Klassen) baut
aktuell eine hybride LLM-Infrastruktur auf (On-Premise + API) und evaluiert
EU-souveräne Provider als Alternative zu direkten China-basierten APIs
(DeepSeek, SiliconFlow).

Cortecs ist aufgrund der EU-native-Cloud-Infrastruktur, ISO 27001-Zertifizierung
und DSGVO-by-default für uns ein bevorzugter Kandidat. Details zur Evaluation
finden Sie unter `docs/extern/cortecs-provider-evaluation.md` (ggf. auf Anfrage).

1. **Bildungs-/Schul-Rabatt** — spezielles Pricing für öffentliche
   Bildungseinrichtungen (HTL, nicht kommerziell, Bundesschule)?
2. **Modellangebot und Preise** — pro Mio Tokens (Input/Output):
   DeepSeek V4 Flash, GLM-5.2, Qwen 3.6; optional Claude Opus 4.8, GPT-5.6.
3. **DPA und Auftragsverarbeitung** — DPA-Dokument für Unterzeichnung seitens
   der Schule / des Schulträgers (BM für Bildung).
4. **Datenlöschung und Aufbewahrung** — Standard-Aufbewahrungsfristen für
   API-Inputs/Outputs? Zero-Data-Retention möglich?
5. **Volumen-Kalkulation** — ~325 Mio Output-Tokens/Monat (mittleres Szenario,
   30 % aktive Schüler), Worst-Case ~2,2 Mrd/Monat.
   Details: `docs/extern/on-premise-vs-api-kalkulation.md`.
6. **Auth-Integration** — LiteLLM-kompatibles Routing (OpenAI-API-Format)?
   Virtual-Keys / Rate-Limits pro Schülergruppe möglich?
7. **Test-Phase** — 30-tägiger Pilot-Zugang für 1–2 Klassen?
8. **Rechnungsstellung** — auf österreichische öffentliche Schule?
   (UID-pflichtig, Rechnungsadresse: HTL Spengergasse, 1050 Wien)

---

## Verwendungs-Hinweis

Vor Versand je Draft (1 = ACOmarket, 2 = ACOnet, 3 = Exoscale, 4 = BBG, 5 = SoftwareOne):
- [ ] Schülerzahl / Klassenanzahl aktuell verifizieren
- [ ] Projekt-URL `https://kik.spengergasse.at` prüfen (Status-Seite aktuell?)
- [ ] Volumen-/Szenario-Zahlen gegen `docs/extern/on-premise-vs-api-kalkulation.md` abgleichen
- [ ] Schul-UID / Rechnungsadresse offiziell bestätigen (Relevant v. a. Draft 3)
- [ ] Mit Direktion / IT-Leitung abstimmen (Relevant v. a. Draft 1 und 5 — diese Mails
      können zu echten Vertragsabschlüssen führen)
- [ ] Versand-Reihenfolge: 1 → 2 → 3 → 5 → 4 (BBG als Signal-Mail kann zuletzt laufen)
- [ ] Gesendete Fassung je Mail nach `docs/extern/mail-archiv/` archivieren
