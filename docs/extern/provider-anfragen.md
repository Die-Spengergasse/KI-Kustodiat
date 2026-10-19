# Provider-Anfragen — Recherche (Issue #34)

> **Status:** Recherche-Referenz. Die E-Mail-Drafts sind aufgetrennt nach
> `docs/extern/llm-provider-rundmail-drafts/` (eine Datei je Adressat, nummeriert
> nach Versand-Reihenfolge, inkl. Abhängigkeiten und Vor-Versand-Checkliste).
> **Priorität:** Sammel-Mail an die *vielen* Adressaten (OCRE/BBG/Provider).
> Cortecs ist ein separater, kurzer Nachtrag.

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

## Recherche-Ergebnisse (2026-10-15; BBG-Preisweg ergänzt 2026-10-17)

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
     (Azure-Preisliste). Tokenkostenlimits pro User und pro Institution;
     Institutionen-Admins steuern Limits + Kostenreport (CSV).
     **Belegt (2026-10-18, verifiziert auf univie.ac.at):** Die Uni Wien
     (`u:ai`, ausdrücklich Teil des Academic-AI-Projekts) gibt
     **€20/Monat Guthaben** je Nutzer:in — Aufladung am Monatsersten, **hartes
     Monatslimit ohne Übertrag** (ausgeschöpft = gesperrt bis Folgemonat). Die
     Angewandte gibt **€10/Monat** → das Per-User-Limit ist
     **institutionskonfigurierbar**, was unser Master-Token-Modell (Budget-Hoheit
     bei der Schule) empirisch stützt. €20 ist ein **Deckel, kein Erwartungswert** —
     nie als Kostenprognose verwenden (2.600 × €20 wäre eine theoretische Maximalsumme).
   - **Datenschutz-Caveat (belegt 2026-10-18):** Bei `u:ai` verlassen
     **Internetsuche (Perplexity) und das Modell Mistral** die EU-Verarbeitung —
     laut Uni Wien ist „die Datenschutzkonformität dann nicht mehr vollständig
     gegeben". Für den Schuleinsatz relevant: Suchkomponente nicht beim Provider
     mitbuchen, sondern selbst orchestreren (eigene SearXNG), und die
     Mistral-Verfügbarkeit für Schulklassen gesondert klären.
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
   - **Preisabfrage (e-Shop):** Die konkreten Katalogpreise (inkl. Verwaltungscharge)
     sind **nur im e-Shop** sichtbar — nach Login im BBG-Portal, den man nach Abschluss
     der (seit 2025 kostenfreien) Grundsatzvereinbarung erhält (zwei kostenlose Zugänge
     inklusive). Die öffentliche Website listet nur die Verträge (GZ-Nummer + Link in den
     öffentlichen e-Shop); Preise erscheinen erst nach Login. Auskunft: Helpcenter
     `office@bbg.gv.at`, Kundenmanagement `kundenmanagement@bbg.gv.at` oder die KAM.
   - **Hardware/Server über BBG:** Das Portfolio nennt „leistungsstarke Server und
     Netzwerke" sowie die Position **„PCs & 13 Zoll 2 in 1 — GZ 3401.04830"**
     (individuell konfigurierte PCs, Notebooks, **Workstations**). Eine Katalogposition
     für **große GPU-Server (256 GB+ VRAM)** ist nicht ersichtlich → Bedarfserhebung bzw.
     „Projekt im besonderen Auftrag" über das Vergabekompetenzcenter; Preis dann per
     Einzelangebot statt Katalogpreis.
   - **Marktlage (BBG, Stand Mai 2026):** Speicherchip-/Halbleiter-Engpässe betreffen
     Verfügbarkeit, Lieferzeiten und Preisstabilität der IT-Hardware-Rahmenvereinbarungen;
     die BBG hat keine generellen Preisänderungen freigegeben und rechnet mit Angeboten
     nur kurzer Gültigkeit. → Bei GPU-Beschaffung Lieferzeit und Preisbindung früh klären.
   - **Kontakt Bundesschulen:** Barbara Weinmann, KAM Bund, Bundesschulen, Pädagogische
     Hochschulen & Bildungsdirektionen (`barbara.weinmann@bbg.gv.at`).
5. **GÉANT/Europa-Trend:** NREN-AI-Matrix (Compendium) zeigt ~15 NRENs mit
   AI-Services; Federated-LLM-Plattformen für Bildung existieren (IAedu/Portugal:
   GPT-4o/Mistral/AMALIA + API, 25k User; EduGenAI/NL via SURF+Npuls, Rollout
   Ende 2026). ACOnet bietet selbst **noch keinen** eigenen AI-Service — Academic AI
   via ACOmarket ist der österreichische Vorreiter. Unsere Anfrage kann genau hier
   Pionierarbeit für Schulen einleiten.

### Adressaten (final, mit geernteten Adressen)

| Adressat | Kontakt | Betrifft | Draft |
|---|---|---|---|
| **ACOmarket GmbH** | `office@acomarket.ac.at` (Ansprechpartner Academic AI: Mag. Michael Pisecki, +43 670 354 8193) | **Academic AI für Schulen** (Prio 1) — SSO, API, Preis | 01 |
| **Academic AI Support** | `support@academic-ai.at` | Test-Accounts, Support, Benutzerhandbuch | — |
| **ACOnet (OCRE-Team)** | `cloud@aco.net` | OCRE-2024-Zugang für Schulen, Teilnahme-Fragen | 02 |
| **ACOnet allgemein** | `admin@aco.net` (+43-1-4277-14030) | Teilnahme/Anbindung (wir sind bereits Teilnehmer) | — |
| **ACONET Community** | `community@aconet.at` (David Urbaner) | Community/Infoshare-AI-Format, Mailingliste AI | — |
| **cloud-discuss Mailingliste** | `noc.aco.net/mailman/listinfo/cloud-discuss` | Niederschwelliger Erstkontakt in der OCRE-Community | — |
| **BBG Helpcenter** | `office@bbg.gv.at`, +43 1 245 70-0 | Katalogpositionen KI/Cloud für Bundesschulen | 05 |
| **BBG Kundenmanagement** | `kundenmanagement@bbg.gv.at` | e-Shop-Zugang/Grundsatzvereinbarung | 05 |
| **Exoscale via A1 (OCRE AT #1)** | `sales.austria@exoscale.com` | Concrete AI / Dedicated Inference (GPU), OCRE-Abruf | 03 |
| **SoftwareOne (OCRE AT #2, MS-ACH EDU)** | `OCRE.EMEA@softwareone.com`, EDU: `edu.at@softwareone.com` | Azure/AWS OCRE-Konditionen + Copilot-Chat-Fragen | 04 |
| **Cortecs** | `enterprise@cortecs.ai` | separater kurzer Nachtrag (Bestandskunde) | 06 |

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

## E-Mail-Drafts

→ `docs/extern/llm-provider-rundmail-drafts/` (README mit Versand-Reihenfolge,
Abhängigkeiten, Adressaten ohne eigenen Draft und Vor-Versand-Checkliste)

Versand-Reihenfolge: **01 ACOmarket → 02 ACOnet → 03 Exoscale (wartet auf 02)
→ 04 SoftwareOne → 05 BBG (bewusst zuletzt) → 06 Cortecs (Nachtrag)**
