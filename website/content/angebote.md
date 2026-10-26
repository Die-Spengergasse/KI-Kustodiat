# Angebote

_Aktualisiert: 2026-10-26._

Überblick über Token-Preise, Gratis- und Bildungsangebote sowie Optionen für eigene
Hardware. Wenn du eine Entscheidung treffen willst, nimm die Zahlen hier als Startpunkt
und prüfe sie am Tag der Beschaffung beim Anbieter nach — alle Angaben sind
Momentaufnahmen mit dem jeweiligen Stand. Bei der Hardware werden ausschließlich
**turnkey**-Systeme gelistet: fertig montiert, vom Hersteller/OEM geliefert,
Linux-supportet. DIY-Bausätze (z. B. Framework Desktop), Eigenbau aus Einzel-GPUs und
Gebraucht-Selbstbau sind bewusst **nicht** dabei.

## Token-Preise (API)

Preise je 1 Mio. Token (Input / Output), Standard-Tarif, USD.

| Anbieter | Angebot | Preis | Stand | Quelle |
|---|---|---|---|---|
| OpenAI | GPT-6 Astra (Flaggschiff); GPT-6.1 Sol; GPT-6 Luna | Astra: 10 $ / 50 $; Sol: 2 $ / 10 $; Luna: 0,10 $ / 0,50 $ (Standard, Kontext ≤ 272 K Token) | 2026-10-26 | [Preisseite](https://developers.openai.com/api/docs/pricing) |
| Anthropic | Claude Fable 5.1 (Flaggschiff); Opus 5.5; Sonnet 5.5; Haiku 5.5 | Fable 5.1: 10 $ / 50 $; Opus 5.5: 4 $ / 20 $; Sonnet 5.5: 2 $ / 10 $; Haiku 5.5: 0,10 $ / 0,50 $ (Prompts ≤ 100 K) | 2026-10-26 | [Preisseite](https://platform.claude.com/docs/en/about-claude/pricing) |
| Google | Gemini 4 Argon (Flaggschiff); Gemini 3.8 Flash; Gemini 3.5 Flash-Lite | Argon: 2 $ / 10 $ (bis 30.11.2026, danach 4 $ / 20 $); 3.8 Flash: 0,75 $ / 3,75 $ (bis 31.12.2026, danach 1,50 $ / 7,50 $); Flash-Lite: 0,30 $ / 2,50 $ | 2026-10-26 | [Preisseite](https://ai.google.dev/gemini-api/docs/pricing) |
| Mistral (EU/FR) | Mistral Large 4 (Flaggschiff); Medium 3.5; Large 3; Small 4 | Large 4: 1,36 $ / 4,18 $; Medium 3.5: 1,50 $ / 7,50 $; Large 3: 0,50 $ / 1,50 $; Small 4: 0,15 $ / 0,60 $ | 2026-10-26 | [Preisseite](https://docs.mistral.ai/inference/pricing) |
| Groq | GPT-OSS 120B / 20B; Qwen3.8 27B; Whisper large-v3 / Turbo | 120B: 0,15 $ / 0,60 $; 20B: 0,075 $ / 0,30 $; Qwen3.8 27B: 0,80 $ / 4,00 $; Whisper: 0,111 $ / Std. (Turbo 0,04 $ / Std.) | 2026-10-26 | [Modell-/Preisseite](https://console.groq.com/docs/models) |
| xAI | Grok 4.7 (Flaggschiff) | 2 $ / 6 $ (Prompt < 200 K); 4 $ / 12 $ (Prompt ≥ 200 K) | 2026-10-26 | [Preisseite](https://docs.x.ai/docs/models) |
| OpenRouter (Gateway) | 500+ Modelle von 80+ Anbietern über einen Schlüssel | Durchleitung zum Anbieter-Listenpreis, dazu 5,5 % auf gekauftes Guthaben (Business: 8 %); EU-In-Region-Routing erst ab Business | 2026-10-26 | [Preisseite](https://openrouter.ai/pricing) |
| Cortecs (EU/AT) | EU-Gateway mit Datenresidenz, 150+ Modelle von 10+ EU-Anbietern; EUR-Abrechnung, DPA, ISO 27001 | Anbieterpreis + 5 % pauschale Servicegebühr — Beispiel Claude Sonnet 5.5: 2,10 $ / 10,50 $ statt 2 $ / 10 $ | 2026-10-26 | [Preisseite](https://cortecs.ai/pricing) |

Mistral (Frankreich) und Cortecs (Wien) bieten einen Auftragsverarbeitungsvertrag (DPA)
und EU-Datenresidenz; Cortecs routet über einen EU-Gateway und rechnet in EUR ab. Bei den
Gateways gilt: OpenRouter leitet zum Listenpreis durch und verlangt eine Gebühr auf das
gekaufte Guthaben — In-Region-Routing innerhalb der EU gibt es dort erst ab dem
Business-Plan. Für einen Multi-Modell-Zugang hinter einem Schlüssel bündelt ein Gateway wie
Cortecs (EU, ein DPA für alle Subprozessoren) oder OpenRouter (international) viele
Anbieter.

## Gratis- und Bildungsangebote

| Anbieter | Angebot | Preis | Stand | Quelle |
|---|---|---|---|---|
| Google AI Studio / Gemini | Free Tier mit Rate-Limits: Gemini 3.8 Flash ist im Free Tier kostenlos, Gemini 4 Argon nicht. Achtung Datenschutz: Inhalte im Free Tier werden laut Anbieter zur Produktverbesserung genutzt (im Paid Tier nicht) | 0 $ (Rate-Limits) | 2026-10-26 | [Preisseite](https://ai.google.dev/gemini-api/docs/pricing) |
| Groq | Free Plan mit Tages-/Minuten-Limits, z. B. GPT-OSS 120B: 30 RPM / 1.000 RPD / 8 K TPM / 200 K TPD | 0 $ (Rate-Limits) | 2026-10-26 | [Rate-Limits](https://console.groq.com/docs/rate-limits) |
| OpenRouter | Kostenlose Modellvarianten (`:free`): laut Preisseite 25+, im Katalog-Abruf vom 26.10.2026 sind es 17 kostenlose Sprachmodelle (u. a. NVIDIA Nemotron 3 Ultra, Google Gemma 4, Thinking Machines Inkling), ohne Kreditkarte | 0 $; 20 Anfragen/Min. und 50 Anfragen/Tag, ab 10 $ gekauftem Guthaben 1.000/Tag | 2026-10-26 | [Preisseite](https://openrouter.ai/pricing), [Katalog-API](https://openrouter.ai/api/v1/models) |
| Microsoft Azure | Azure for Students: 100 $ Guthaben für 12 Monate plus 65+ dauerhaft freie Dienste (inkl. Foundry / Azure OpenAI), kein Kreditkarteneintrag, jährlich erneuerbar solange immatrikuliert | 100 $ / Jahr | 2026-10-26 | [Azure for Students](https://azure.microsoft.com/en-us/free/students) |
| GitHub Education | Copilot Pro kostenlos für verifizierte Studierende und Lehrende; die Berechtigung wird monatlich neu geprüft | 0 $ (Copilot Pro) | 2026-10-26 | [GitHub Docs](https://docs.github.com/en/copilot/how-tos/manage-your-account/get-free-access-to-copilot-pro) |
| Mistral (EU/FR) | Education-Plan für verifizierte Studierende (max. 12 Monate, inkl. 25,50 $ API-Guthaben/Monat); die FAQ nennt zusätzlich 5,99 $/Monat für verifizierte Studierende | 5,99 $ / Monat laut FAQ (Liste: 14,99 $) | 2026-10-26 | [Preisseite](https://mistral.ai/pricing) |
| Apple | Education-Preise (US): Mac Studio M5 Max ab 2.299 $, M5 Ultra ab 5.099 $; in Österreich über den AT-Education-Store mit abweichenden Preisen | US-Bildungspreise, nicht 1:1 auf AT übertragbar | 2026-09-22 | [Apple Newsroom](https://www.apple.com/newsroom/2026/09/the-new-mac-mini-and-mac-studio-are-available-today/) |

## Hardware für eigene Inferenz

Nur **turnkey**-Systeme: fertig montiert, vom Hersteller/OEM geliefert, Linux-supportet.

### Kompaktklasse (bis ca. 192 GB Speicher)

| Anbieter | System | Speicher | Preis | Stand | Quelle |
|---|---|---|---|---|---|
| AMD | „Ryzen AI Halo" Entwickler-Mini-PC, Ryzen AI Max+ PRO 495, Linux-Edition | 192 GB Unified (LPDDR5X-8533) | 7.299,99 $ (Micro-Center-Preis) | 2026-10-12 | [VideoCardz](https://videocardz.com/newz/amd-ryzen-ai-halo-with-ryzen-ai-max-pro-495-launches-at-7299-with-192gb-memory) |
| AMD Strix Halo (Ryzen AI Max+ 395, Turnkey-Mini-PCs) | Bosgame M5, GMKtec EVO-X2, Minisforum MS-S1 Max, Beelink GTR9 Pro | 128 GB Unified | M5: 3.599 $ (2 TB); EVO-X2: 3.649,99 $ (2 TB); MS-S1 Max: 3.879 $ (2 TB); GTR9 Pro: 4.349 $ (2 TB) | 2026-10-22 | [ComputingForGeeks](https://computingforgeeks.com/ryzen-ai-max-395-mini-pc-comparison/) |
| AMD Strix Halo 192 GB (Ryzen AI Max+ PRO 495) | ACEMAGIC F9A, GMKtec EVO-X5 Pro, Minisforum MS-S1 MAX-P495 | 192 GB Unified | F9A: 6.499 $ (2 TB); EVO-X5 Pro: 6.799 $ (2 TB); MS-S1 MAX-P495: 7.399 $ (2 TB) | 2026-10-22 | [ComputingForGeeks](https://computingforgeeks.com/ryzen-ai-max-395-mini-pc-comparison/) |
| NVIDIA | DGX Spark (GB10), 64 GB bzw. 128 GB Unified Memory | 64 / 128 GB | 64 GB: 4.999 $; 128 GB: 6.950 $ (Händler-/Partnerpreise laut Fachpresse — NVIDIA selbst nennt keinen Listenpreis; 64 GB seit 23.10.2026 über sechs OEM-Partner) | 2026-10-23 | [NVIDIA](https://www.nvidia.com/en-us/products/workstations/dgx-spark/), [tech-insider](https://tech-insider.org/dgx-spark-64gb-on-sale-4999-vs-128gb-6950-2026/) |
| Apple | Mac Studio M5 Max, Unified Memory bis 128 GB | 36 / 48 / 64 / 128 GB | ab 2.499 $ (36 GB); 128-GB-Konfiguration 5.099 $ (laut Fachpresse) | 2026-10-22 | [Apple Specs](https://www.apple.com/mac-studio/specs/), [ComputingForGeeks](https://computingforgeeks.com/ryzen-ai-max-395-mini-pc-comparison/) |

### Regal-/Server-Klasse (ab 256 GB Speicher)

Deckt die Ausbaustufen 256 GB, 512 GB und ≥ 1 TB ab. Größere Ausbaustufen sind heute
praktisch nur als Rack-Server (8-GPU) turnkey erhältlich; im Desk-Side-Format endet das
Angebot bei der NVIDIA DGX Station (748 GB kohärent) und dem Mac Studio M5 Ultra
(256 / 512 GB). NVIDIA vermarktet die 8-GPU-RTX-PRO-6000-Klasse als „RTX PRO Server"
(2 / 4 / 8 Karten, Acht-Karten-Ausbau im 4U-Chassis) — einen belegten Listenpreis gibt es
dafür nur über die Systempartner, hier über Supermicro. Dell (PowerEdge XE9680/XE9685),
HPE (ProLiant Compute XD685), Lenovo (ThinkSystem SR675/SR685), GIGABYTE (G593) und
Lambda bauen in derselben Klasse, veröffentlichen aber keine Listenpreise — deshalb
stehen sie hier nicht in der Tabelle, solange keine belegte Zahl vorliegt.

| Anbieter | System | Speicher | Bauform | Preis | Stand | Quelle |
|---|---|---|---|---|---|---|
| NVIDIA / OEM (MSI) | DGX Station (GB300 Grace Blackwell Ultra), als MSI XpertStation WS300 | 748 GB kohärent (HBM3e + LPDDR5X) | Desk-Side | 85.000 $ (einziger veröffentlichter Preis, MSI; andere OEMs ohne Listenpreis) | 2026-10-06 | [NVIDIA](https://www.nvidia.com/en-us/products/workstations/dgx-station/), [Spheron](https://www.spheron.network/blog/dgx-station-gb300-vs-renting-gb300-nvl72-break-even-guide-20/) |
| Apple | Mac Studio M5 Ultra | 96 / 256 / 512 GB Unified | Desk-Side | ab 5.499 $ (96 GB); 256 GB ohne veröffentlichten Listenpreis (Testkonfiguration laut The Verge: 12.299 $); 512 GB ab Ende Okt. 2026, Preis noch nicht bestätigt | 2026-10-20 | [Apple Specs](https://www.apple.com/mac-studio/specs/), [TechRepublic](https://www.techrepublic.com/article/news-apple-512gb-mac-studio-release-date-price-ai/) |
| Supermicro | SYS-422GA-NRT, 8× RTX PRO 6000 Blackwell Server Edition | 768 GB GPU-Speicher (8× 96 GB) | Rack (4U) | 173.030,97 $ netto (Listenpreis 196.626,10 $); pro GPU 21.628,87 $ | 2026-10-13 | [UpStation](https://ai.upstation.io/p/UPS-GPU-RTXPRO-8) |
| Supermicro | SYS-821GE-TNHR, 8× H200 | 1,13 TB GPU-Speicher (8× 141 GB) | Rack (8U) | 284.770,32 $ netto (Listenpreis 323.602,64 $); pro GPU 35.596,29 $ | 2026-10-13 | [UpStation](https://ai.upstation.io/p/UPS-GPU-H200-8) |
| NVIDIA / OEM | DGX B300 (8× B300), als Supermicro SYS-822GS-NB3RT | 2,3 TB GPU-Speicher (8× 288 GB) | Rack (8U) | 499.937,11 $ netto (Listenpreis 568.110,35 $); Tier-2-Systembauer 475.000–500.000 $ | 2026-10-13 | [UpStation](https://ai.upstation.io/p/UPS-GPU-B300-8) |
| NVIDIA / OEM | DGX B200 (8× B200), als Exxact TensorEX TS4 | 1,44 TB GPU-Speicher (8× 180 GB) | Rack (8U) | 390.000–410.000 $ (Preis unter NDA, gerundete Bandbreite) | 2026-10-13 | [UpStation](https://ai.upstation.io/p/UPS-GPU-B200-8-T2) |

### Beschaffungsweg über die BBG

_Stand: 2026-10-26._

| Thema | Stand |
|---|---|
| Zugang | Bundesschulen sind BBG-Abnehmerin. Die Grundsatzvereinbarung ist kostenfrei und enthält zwei e-Shop-Zugänge. |
| Preise | Katalogpreise gibt es ausschließlich im e-Shop nach Login. Öffentlich sind nur Vertrags- und Ausschreibungslisten (GZ-Nummern, Termine). |
| PCs & Workstations | „PCs & 13 Zoll 2 in 1" (GZ 3401.04830) — individuell konfigurierte PCs, Notebooks und Workstations. |
| Server | Eigene Rahmenvereinbarung „Serversysteme, Netzwerkkomponenten und Storagesysteme" (GZ 3401.03804). Neuvergabe als SSN 2026-2 (neun Hersteller-Lose, u. a. Supermicro; abrufbar ab 2026-11-20) und SSN 2026-3 (Palo Alto, Cisco; ab 2027-01-22). |
| GPU ab 256 GB | Nicht belegt. Das laufende Verfahren SSN 2026-3 hat nur zwei Lose (Palo Alto, Cisco) und nennt weder im Vertrag noch im Preisblatt eine GPU-Position; das Preisblatt von SSN 2026-2 ist nach Fristablauf nicht mehr abrufbar. |

Quellen: [Aktuelle Verträge](https://www.bbg.gv.at/information/aktuelle-vertraege) · [Aktuelle Ausschreibungen](https://www.bbg.gv.at/information/aktuelle-ausschreibungen) · [SSN 2026-3 im Vergabeportal](https://bbg.vergabeportal.at/Detail/257753)

Hinweis: Hardwarepreise sind stark schwankend (Speichermangel 2026). Enterprise-Systeme
werden oft nur auf Anfrage angeboten; die genannten Preise sind Listenpreise, Distributor-
oder Händler-Netto- bzw. als solche gekennzeichnete NDA-Bandbreiten. Vor einer Beschaffung
aktuelle Angebote des Händlers einholen.

---

**Wichtig:** Preise ändern sich schnell. Prüfe vor einer Entscheidung immer beim Anbieter
selbst nach — die Angaben hier sind Momentaufnahmen mit Datum.

---

Zurück zur [Startseite](#/) · [Status](status.md) · [Milestones](milestones.md)
