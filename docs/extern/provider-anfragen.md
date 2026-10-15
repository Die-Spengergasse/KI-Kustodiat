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

## Priorität: Sammel-Mail an die vielen Adressaten

> Ein Draft für alle Anbieter/Rahmenvertragsstellen, die kein bestehendes
> Kundenverhältnis mit uns haben. Vor Versand: Adressaten selektieren,
> Personalisierung (Anrede + 1 Satz je Firma), Georg überarbeitet gründlich.

**Betreff:** Anfrage Bildungseinrichtung — LLM-API-Kostenvoranschlag & Kooperation (HTL Spengergasse)

Sehr geehrtes Team,

die HTL Spengergasse (Wien, ~2.600 Schüler:innen, ~280 Lehrkräfte, 97 Klassen)
baut eine schuleigene, hybride LLM-Infrastruktur auf: on-premise Backend plus
API-Zukauf bei EU-souveränen Providern. Wir suchen Anbieter, die öffentliche
Bildungseinrichtungen mit LLM-API-Dienstleistungen versorgen können —
bevorzugt im Rahmen bestehender öffentlicher Beschaffungswege (OCRE/GEANT
Call-Off via ACOnet, BBG-Katalog, oder direkt).

Uns interessieren folgende Punkte:

1. **Bildungs-/Schul-Rabatt** — gibt es gesondertes Pricing für öffentliche,
   nicht-kommerzielle Bildungseinrichtungen (HTL, Bundesschule)?
2. **Modellangebot & Preise** — LLM-API pro Mio. Tokens (Input/Output),
   idealerweise inkl. europäischer und Open-Weight-Modelle.
3. **Datenschutz** — DPA/Auftragsverarbeitung, Serverstandort EU, keine
   Trainingsnutzung der Kunden Daten, Aufbewahrungsfristen / Zero-Retention.
4. **Beschaffungsweg** — ist Ihre Dienstleistung über OCRE-2024 (GEANT,
   Call-Off via ACOnet) bzw. BBG-Katalog beziehbar? Falls nicht: wegweisender
   Standard-Vertragsweg für eine öffentliche Schule?
5. **Volumen** — grobe Schätzung mittleres Szenario: ~325 Mio. Output-Tokens/
   Monat bei 30 % aktiven Schüler:innen; Worst-Case-Skalierung Richtung
   ~2,2 Mrd./Monat. Bitte einen Preisvorschlag für beide Größenordnungen.
6. **Technische Anbindung** — OpenAI-kompatible API (Routing über LiteLLM),
   Virtual Keys / Rate-Limits pro Gruppe wünschenswert.
7. **Pilot** — Möglichkeit eines begrenzten Testzeitraums (z. B. 1–2 Klassen,
   30 Tage) vor einer Budgetforderung an die Schulaufsicht.

Ein Projektüberblick: <https://kik.spengergasse.at>

Wir freuen uns auf Ihr Angebot bzw. einen kurzen Erstkontakt.

Mit freundlichen Grüßen
Georg Graf
HTL Spengergasse, Spengergasse 20, 1050 Wien

### OCRE/BBG-spezifische Ergänzung (in die Sammel-Mail bei diesen Adressaten)

> Diese beiden Punkte zusätzlich in die Mail bei Rahmenvertragsstellen:

- Können österreichische Bildungseinrichtungen (Schulträger: Stadt Wien bzw.
  BM für Bildung) direkt aus dem OCRE-2024-Rahmenvertrag Call-Offs tätigen,
  oder läuft der Zugang über Teilnehmerorganisationen (z. B. ACOnet/Universitäten)?
- Welche LLM-/Inference-Dienste sind konkret im OCRE-2024-Katalog gelistet,
  und zu welchen Konditionen (Preisbänder, Kombinationen mit Education-Rabatten)?

> **Update 2026-10-15:** Antwort auf Frage 1 steht faktisch fest — wir sind
> bereits ACOnet-Teilnehmer, Zugang läuft über ACOnet/ACOmarket. Die Mail an
> `cloud@aco.net` kann daher kompakter ausfallen (Bestätigung einholen statt
> Grundlagen klären).

### Academic AI — Anfrage-Punkte (an `office@acomarket.ac.at`)

> Kompakter Zweit-Draft für den realistischsten Weg (Prio 1):

- Wir sind ACOnet-Teilnehmerorganisation (HTBLVA Spengergasse, ~2.600 Schüler:innen,
  ~280 Lehrkräfte, 97 Klassen) und Mitglied der ACOnet Identity Federation —
  SSO wäre damit gegeben.
- Nimmt ACOmarket auch **Schulen** als Abonnenten an (bisher 32 Hochschulen)?
  Ggf. als Pionier-/Pilotschule mit reduzierter Skala (1–2 Klassen, 30 Tage).
- Verfügbare Modelle in v3.0 (OpenAI/Google/Mistral/Anthropic) und geltende
  Token-Preise; Per-User-Limit-Empfehlung für Sekundarstufe-II-Nutzung.
- **API-Zugang**: Umfang (Chat Completions, KB/RAG-Management), Auth-Mechanik
  (`X-Client-ID`/`X-Client-Secret`), Limits — wir würden über LiteLLM routen.
- Verrechnung: monatliche Token-Abrechnung, Institutions-Limit-Steuerung durch
  uns als Admins — bestätigen.
- Kein eigenes Vergabeverfahren nötig (Beschaffung via OCRE durch ACOmarket) —
  bestätigen und Nutzungsvertrag-Muster übersenden.

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

Vor Versand je Adressat:
- [ ] Adressaten-Selektion finalisieren (OCRE-Katalog, BBG-Katalog, Websuche)
- [ ] Anrede + persönlicher Einstiegssatz je Firma
- [ ] Aktuelle Schülerzahl / Schultage verifizieren
- [ ] Volumen-Zahlen gegen `docs/extern/on-premise-vs-api-kalkulation.md` abgleichen
- [ ] Schul-UID / Rechnungsadresse offiziell bestätigen
- [ ] Mit Direktion / IT-Leitung abstimmen
- [ ] Gesendete Fassung nach `docs/extern/mail-archiv/` archivieren
