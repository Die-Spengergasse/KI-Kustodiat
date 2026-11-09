# Angebote

_Aktualisiert: 2026-11-09._

Überblick über Token-Preise, Gratis- und Bildungsangebote sowie Optionen für eigene
Hardware. Nimm die Zahlen als Startpunkt und prüfe sie am Tag der Beschaffung beim
Anbieter nach — alle Angaben sind Momentaufnahmen mit dem jeweiligen Stand. Bei der
Hardware stehen ausschließlich **turnkey**-Systeme: fertig montiert, vom Hersteller/OEM
geliefert, Linux-supportet. DIY-Bausätze (z. B. Framework Desktop), Eigenbau aus
Einzel-GPUs und Gebraucht-Selbstbau sind bewusst **nicht** dabei.

## Token-Preise (API)

Preise je 1 Mio. Token (Input / Output), Standard-Tarif, USD.

| Anbieter | Angebot | Preis | Stand | Quelle |
|---|---|---|---|---|
| OpenAI | GPT-6 Astra (Flaggschiff); GPT-6.1 Sol; GPT-6.1 Terra; GPT-6 Luna | Astra: 10 $ / 50 $; Sol: 2 $ / 10 $; Terra: 1 $ / 5 $; Luna: 0,10 $ / 0,50 $. Batch je −50 %, Cache-Input 1 $ / 0,10 $ / 0,05 $ / 0,01 $ | 2026-11-09 | [Preisseite](https://developers.openai.com/api/docs/pricing) |
| Anthropic | Claude Fable 5.1 (Flaggschiff); Opus 5.5; Sonnet 5.5; Haiku 5.5 | Fable 5.1: 10 $ / 50 $ (Cache-Hit 0,25 $); Opus 5.5: 4 $ / 20 $; Sonnet 5.5: 2 $ / 10 $; Haiku 5.5: 0,10 $ / 0,50 $ bei Prompts ≤ 100 K Token, darüber 0,50 $ / 2,50 $ | 2026-11-09 | [Preisseite](https://platform.claude.com/docs/en/about-claude/pricing) |
| Google | Gemini 4 Argon (Flaggschiff); Gemini 3.8 Flash; Gemini 3.5 Flash-Lite | Argon: 2 $ / 10 $ bis 30.11.2026, ab 01.12.2026 4 $ / 20 $; 3.8 Flash: 0,75 $ / 3,75 $ bis 31.12.2026, ab 01.01.2027 1,50 $ / 7,50 $; 3.5 Flash-Lite: 0,30 $ / 2,50 $ | 2026-11-09 | [Preisseite](https://ai.google.dev/gemini-api/docs/pricing) |
| Mistral (EU/FR) | Mistral Large 4 (Flaggschiff); Mistral Small 4; Ministral 3 14B | Large 4: 0,70 $ / 2,10 $ (1 Mio. Kontext, Cache-Input 0,07 $); Small 4: 0,15 $ / 0,60 $; Ministral 3 14B: 0,20 $ / 0,20 $ | 2026-11-09 | [Preisseite](https://docs.mistral.ai/inference/pricing) |
| Groq | GPT-OSS 120B / 20B; Qwen3.8 27B; Whisper large-v3 / Turbo | 120B: 0,15 $ / 0,60 $; 20B: 0,075 $ / 0,30 $; Qwen3.8 27B: 0,80 $ / 4,00 $; Whisper: 0,111 $ / Std. (Turbo 0,04 $ / Std.) | 2026-11-09 | [Modell-/Preisseite](https://console.groq.com/docs/models) |
| xAI | Grok 4.7 (Flaggschiff), 500 K Kontext | 2 $ / 6 $ | 2026-11-09 | [Preisseite](https://docs.x.ai/docs/models) |
| OpenRouter (Gateway) | 600+ Modelle von 80+ Anbietern über einen Schlüssel | Durchleitung zum Anbieter-Listenpreis, dazu 5,5 % auf gekauftes Guthaben (Business: 8 %); EU-In-Region-Routing erst ab Business | 2026-11-09 | [Preisseite](https://openrouter.ai/pricing) |
| Cortecs (EU/AT) | EU-Gateway mit Datenresidenz, 150+ Modelle von 10+ EU-Anbietern; EUR-Abrechnung, DPA, ISO 27001 | Anbieterpreis + 5 % pauschale Servicegebühr — gerechnet auf Claude Sonnet 5.5: 2,10 $ / 10,50 $ statt 2 $ / 10 $ | 2026-11-09 | [Preisseite](https://cortecs.ai/pricing) |

Cortecs (Wien) bietet einen Auftragsverarbeitungsvertrag (DPA), EU-Datenresidenz und
ISO 27001, routet über einen EU-Gateway und rechnet in EUR ab; Mistral sitzt in
Frankreich und bietet EU-Datenresidenz-Optionen.
Mistral listet auf derselben Preisseite auch gehostete Fremdmodelle, etwa DeepSeek V4.1
Flash mit 0,30 $ / 1,20 $, GLM 5.3 mit 1,40 $ / 4,40 $ und GLM 5.3 Flash mit
0,15 $ / 0,50 $. Bei den Gateways gilt: OpenRouter leitet zum Listenpreis durch und
verlangt eine Gebühr auf das gekaufte Guthaben — In-Region-Routing innerhalb der EU gibt
es dort erst ab dem Business-Plan. Für einen Multi-Modell-Zugang hinter einem Schlüssel
bündelt ein Gateway wie Cortecs (EU, ein DPA für alle Subprozessoren) oder OpenRouter
(international) viele Anbieter.

## Gratis- und Bildungsangebote

| Anbieter | Angebot | Preis | Stand | Quelle |
|---|---|---|---|---|
| Google AI Studio / Gemini | Free Tier mit Rate-Limits: Gemini 3.8 Flash und 3.5 Flash-Lite sind kostenlos, Gemini 4 Argon nicht. Achtung Datenschutz: Inhalte im Free Tier werden laut Anbieter zur Produktverbesserung genutzt (im Paid Tier nicht) | 0 $ (Rate-Limits) | 2026-11-09 | [Preisseite](https://ai.google.dev/gemini-api/docs/pricing) |
| Groq | Free Plan mit Tages-/Minuten-Limits, z. B. GPT-OSS 120B: 30 RPM / 1.000 RPD / 8 K TPM / 200 K TPD | 0 $ (Rate-Limits) | 2026-11-09 | [Rate-Limits](https://console.groq.com/docs/rate-limits) |
| OpenRouter | Kostenlose Modellvarianten (`:free`): laut Preisseite 25+, im Katalog-Abruf vom 09.11.2026 sind es 16 Einträge ohne Tokenpreis (u. a. NVIDIA Nemotron 3 Ultra, Google Gemma 4, Cohere North Mini Code), ohne Kreditkarte | 0 $; 20 Anfragen/Min. und 50 Anfragen/Tag, ab 10 $ gekauftem Guthaben 1.000/Tag | 2026-11-09 | [Preisseite](https://openrouter.ai/pricing), [Limits](https://openrouter.ai/docs/api-reference/limits) |
| GitHub Education | Copilot Student kostenlos für verifizierte Schüler:innen und Studierende (High School bzw. Diploma-Programm, ab 13 Jahren); Copilot Pro zusätzlich kostenlos für verifizierte Lehrkräfte und Maintainer populärer Open-Source-Projekte. Die Berechtigung wird monatlich neu geprüft | 0 $ (Copilot Student / Copilot Pro) | 2026-11-09 | [GitHub Docs — Students](https://docs.github.com/en/education/about-github-education/github-education-for-students/about-github-education-for-students), [GitHub Docs — Teachers](https://docs.github.com/en/copilot/how-tos/manage-your-account/get-free-access-to-copilot-pro) |
| Microsoft Azure | Azure for Students: 100 $ Guthaben für 12 Monate plus 65+ dauerhaft freie Dienste (inkl. Foundry / Azure OpenAI), kein Kreditkarteneintrag, jährlich erneuerbar. Die Anbieterseite nennt „full-time university students“ — für HTL-Schüler:innen ist die Berechtigung nicht belegt | 100 $ / Jahr | 2026-11-09 | [Azure for Students](https://azure.microsoft.com/en-us/free/students) |
| Mistral (EU/FR) | Education-Plan für verifizierte Studierende an akkreditierten Hochschulen (max. 12 Monate, laut Preisliste inkl. 25,50 $ API-Guthaben/Monat, nur für Erstnutzer:innen) — für HTL-Schüler:innen nicht belegt | 14,99 $ / Monat | 2026-11-09 | [Preisseite](https://mistral.ai/pricing) |
| Apple | Education-Preise (US): Mac Studio M5 Max ab 2.299 $, M5 Ultra ab 5.099 $; in Österreich über den AT-Education-Store mit abweichenden Preisen | US-Bildungspreise, nicht 1:1 auf AT übertragbar | 2026-09-22 | [Apple Newsroom](https://www.apple.com/newsroom/2026/09/the-new-mac-mini-and-mac-studio-are-available-today/) |

## Hardware für eigene Inferenz

Nur **turnkey**-Systeme: fertig montiert, vom Hersteller/OEM geliefert, Linux-supportet.

### Kompaktklasse (bis ca. 192 GB Speicher)

| Anbieter | System | Speicher | Preis | Stand | Quelle |
|---|---|---|---|---|---|
| AMD | „Ryzen AI Halo" Entwickler-Mini-PC, Ryzen AI Max+ PRO 495, Linux-Edition | 192 GB Unified (LPDDR5X-8533, 2 TB SSD, bis 160 GB als Grafikspeicher) | 7.299,99 $ (Micro Center, nur US-Ladengeschäft) | 2026-10-12 | [Micro Center](https://www.microcenter.com/product/717068/amd-ryzen-ai-halo-developer-platform-with-ryzen-ai-max-pro-495-processor-linux-os), [VideoCardz](https://videocardz.com/newz/amd-ryzen-ai-halo-with-ryzen-ai-max-pro-495-launches-at-7299-with-192gb-memory) |
| TOPC | TXA2 Mini AI Workstation, Ryzen AI Max+ PRO 495 | 192 GB Unified (LPDDR5X-8533, bis 160 GB Grafikspeicher) | 6.399 $ (2 TB SSD); 6.699 $ (4 TB SSD) | 2026-10-15 | [TechPowerUp](https://www.techpowerup.com/353764/topc-launches-usd-6-399-amd-ryzen-ai-max-pro-495-mini-pc-workstation) |
| AMD Strix Halo (Ryzen AI Max+ 395, Turnkey-Mini-PCs) | GMKtec EVO-X2; Minisforum MS-S1 Max | 128 GB Unified | EVO-X2: 3.649,99 $; MS-S1 Max: 3.919 $ (je 2 TB SSD, US-Straßenpreise) | 2026-11-03 | [Preisverlauf EVO-X2](https://pricehistory.app/p/gmktec-evo-x2-ai-mini-pc-ryzen-0zI8VhQ2), [Lucebox](https://www.lucebox.com/compare/minisforum-ms-s1-max) |
| NVIDIA | DGX Spark (GB10), 64 GB bzw. 128 GB Unified Memory | 64 / 128 GB Unified | 128 GB: 6.950 $ (NVIDIA Marketplace, 4 TB SSD); 64 GB: ab 4.999 $ über die OEM-Partner Acer, ASUS, Dell, Gigabyte, HP und MSI; ASUS Ascent GX10 mit 128 GB und 1 TB: 5.999 $ | 2026-11-09 | [Preisübersicht Physical AI Lab](https://physicalailab.io/en/nvidia-dgx-spark-price-specs-buy/) |
| Apple | Mac Studio M5 Max, Unified Memory bis 128 GB | 36 / 48 / 64 / 128 GB | ab 2.499 $ (36 GB); 128 GB mit 1 TB SSD ca. 6.028 € (deutscher Handelspreis, inkl. USt.) | 2026-11-09 | [Apple Newsroom](https://www.apple.com/newsroom/2026/09/the-new-mac-mini-and-mac-studio-are-available-today/), [billiger.de](https://www.billiger.de/pricelist/5903968352-apple-mac-studio-m5-max-mini-pc-2026-128-gb-ram-1-tb-ssd) |

### Regal-/Server-Klasse (ab 256 GB Speicher)

Deckt die Ausbaustufen 256 GB, 512 GB und ≥ 1 TB ab. Ausbaustufen über 768 GB sind heute
praktisch nur als Rack-Server (8-GPU) turnkey erhältlich; im Desk-Side-Format endet das
Angebot bei der NVIDIA DGX Station (748 GB kohärent) und dem Mac Studio M5 Ultra
(256 / 512 GB). NVIDIA vermarktet die 8-GPU-RTX-PRO-6000-Klasse als „RTX PRO Server"
(2 / 4 / 8 Karten, Acht-Karten-Ausbau im 4U-Chassis) — einen belegten Listenpreis gibt es
dafür nur über die Systempartner, hier über Supermicro. Dell (PowerEdge XE9680/XE9685L),
HPE (ProLiant Compute XD685), Lenovo (ThinkSystem SR685a V3), GIGABYTE (G593) und Lambda
bauen in derselben Klasse, veröffentlichen aber keine Listenpreise — deshalb stehen sie
hier nicht in der Tabelle, solange keine belegte Zahl vorliegt. Dasselbe gilt für die
NVIDIA DGX B200/DGX B300, die NVIDIA nur über Systempartner und ohne öffentlichen
Listenpreis anbietet.

| Anbieter | System | Speicher | Bauform | Preis | Stand | Quelle |
|---|---|---|---|---|---|---|
| Apple | Mac Studio M5 Ultra | 256 GB Unified (Klasse 256 GB) | Desk-Side | 9.499 $ (96 GB → 256 GB kostet 4.000 $ Aufpreis) | 2026-11-06 | [Fello AI](https://felloai.com/m5-ultra-mac-studio/) |
| Apple | Mac Studio M5 Ultra | 512 GB Unified (Klasse 512 GB) | Desk-Side | 22.299 $ (512 GB mit 1 TB SSD; 16 TB SSD: 29.799 $) | 2026-10-28 | [MacRumors](https://www.macrumors.com/2026/10/28/mac-studio-m5-ultra-512gb-ram/), [9to5Mac](https://9to5mac.com/2026/10/28/apple-reveals-pricing-for-mac-studio-with-512gb-of-ram/) |
| NVIDIA / OEM (Supermicro) | DGX Station (GB300 Grace Blackwell Ultra), als Super AI Station ARS-511GD-NB-LCC-01-G2 | 748 GB kohärent (252 GB HBM3e + 496 GB LPDDR5X; Klasse 512 GB) | Desk-Side (Tower, optional 5U-Rack) | 93.409 $ Supermicro-Listenpreis; OEM-Listings 92.887 $ (Supermicro) bis 159.283 $ (Dell) | 2026-11-06 | [SparkThai](https://www.sparkthai.com/de/gpu-server-film/super-ai-station-gb300), [BetterClaw](https://www.betterclaw.io/blog/dgx-station-alternative) |
| Supermicro | SYS-422GA-NRT, 8× RTX PRO 6000 Blackwell Server Edition (NVIDIA RTX PRO Server) | 768 GB GPU-Speicher (8× 96 GB; Klasse 512 GB) | Rack (4U) | 177.430,31 $ netto (Listenpreis 201.625,35 $); pro GPU 22.178,79 $ | 2026-11-09 | [UpStation](https://ai.upstation.io/p/UPS-GPU-RTXPRO-8) |
| Supermicro | SYS-821GE-TNHR, 8× H200 (nicht mehr für Neuentwicklungen empfohlen) | 1.128 GB GPU-Speicher (8× 141 GB; Klasse ≥ 1024 GB) | Rack (8U) | 318.117,39 $ netto (Listenpreis 361.497,03 $); pro GPU 39.764,67 $ | 2026-11-09 | [UpStation](https://ai.upstation.io/p/UPS-GPU-H200-8) |
| Supermicro | SYS-822GS-NB3RT, 8× B300 (HGX B300 NVL8) | 2.304 GB GPU-Speicher (8× 288 GB; Klasse ≥ 1024 GB) | Rack (8U) | 537.196,40 $ netto (Listenpreis 610.450,46 $); pro GPU 67.149,55 $ | 2026-11-09 | [UpStation](https://ai.upstation.io/p/UPS-GPU-B300-8) |

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
oder Händler-Netto- bzw. als solche gekennzeichnete Straßenpreise. Vor einer Beschaffung
aktuelle Angebote des Händlers einholen.

---

**Wichtig:** Preise ändern sich schnell. Prüfe vor einer Entscheidung immer beim Anbieter
selbst nach — die Angaben hier sind Momentaufnahmen mit Datum.

---

Zurück zur [Startseite](#/) · [Status](status.md) · [Milestones](milestones.md)
