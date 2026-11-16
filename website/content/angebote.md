# Angebote

_Aktualisiert: 2026-11-16._

Überblick über Token-Preise, Gratis- und Bildungsangebote sowie Optionen für eigene
Hardware. Nimm die Zahlen als Startpunkt und prüfe sie am Tag der Beschaffung beim Anbieter
nach — alle Angaben sind Momentaufnahmen mit dem jeweiligen Stand. Bei der Hardware stehen
ausschließlich **turnkey**-Systeme: fertig montiert, vom Hersteller/OEM geliefert,
Linux-supportet. DIY-Bausätze (z. B. Framework Desktop), Eigenbau aus Einzel-GPUs und
Gebraucht-Selbstbau sind bewusst **nicht** dabei.

## Token-Preise (API)

Preise je 1 Mio. Token (Input / Output), Standard-Tarif, USD.

| Anbieter | Angebot | Preis | Stand | Quelle |
|---|---|---|---|---|
| OpenAI | GPT-6 Astra (Flaggschiff); GPT-6.1 Sol; GPT-6.1 Terra; GPT-6 Luna | Astra: 10 $ / 50 $ (Cache-Input 1 $); Sol: 2 $ / 10 $ (Cache-Input 0,10 $); Terra: 1 $ / 5 $; Luna: 0,10 $ / 0,50 $; Batch je −50 % | 2026-11-16 | [Preisseite](https://platform.openai.com/docs/pricing) |
| Anthropic | Claude Fable 5.2 (Flaggschiff); Opus 5.5; Sonnet 5.5; Haiku 5.5 | Fable 5.2: 8 $ / 40 $ (Cache-Hit 0,20 $); Opus 5.5: 4 $ / 20 $; Sonnet 5.5: 2 $ / 10 $ (Cache-Hit 0,10 $); Haiku 5.5: 0,10 $ / 0,50 $ bei Prompts ≤ 100 K Token, darüber 0,50 $ / 2,50 $ | 2026-11-16 | [Preisseite](https://platform.claude.com/docs/en/about-claude/pricing) |
| Google | Gemini 4 Carbon (Flaggschiff); Gemini 4 Argon; Gemini 4 Hydrogen; Gemini 3.8 Flash; Gemini 3.5 Flash-Lite | Carbon und Argon: je 2 $ / 10 $ bis 30.11.2026, ab 01.12.2026 4 $ / 20 $ (Context-Cache 0,10 $ → 0,20 $); Hydrogen: 1,50 $ / 7,50 $; 3.8 Flash: 0,75 $ / 3,75 $ bis 31.12.2026, ab 01.01.2027 1,50 $ / 7,50 $; 3.5 Flash-Lite: 0,30 $ / 2,50 $ | 2026-11-16 | [Preisseite](https://ai.google.dev/gemini-api/docs/pricing) |
| Mistral (EU/FR) | Mistral Large 4 (Flaggschiff); Mistral Small 4; Ministral 3 14B; zusätzlich gehostet: DeepSeek V4.1 Flash, GLM 5.3 / 5.3 Flash | Large 4: 0,70 $ / 2,10 $ (Cache-Input 0,07 $); Small 4: 0,15 $ / 0,60 $; Ministral 3 14B: 0,20 $ / 0,20 $; DeepSeek V4.1 Flash: 0,30 $ / 1,20 $ (Cache-Input 0,007 $); GLM 5.3: 1,40 $ / 4,40 $; GLM 5.3 Flash: 0,15 $ / 0,50 $ | 2026-11-16 | [Preisseite](https://docs.mistral.ai/inference/pricing) |
| Groq | GPT-OSS 120B / 20B; Qwen3.8 27B; Whisper large-v3 / Turbo | 120B: 0,15 $ / 0,60 $; 20B: 0,075 $ / 0,30 $; Qwen3.8 27B: 0,80 $ / 4,00 $; Whisper: 0,111 $ / Std. (Turbo 0,04 $ / Std.) | 2026-11-16 | [Modell-/Preisliste](https://console.groq.com/docs/models) |
| xAI | Grok 4.7 (Flaggschiff), 500 K Kontext | 2 $ / 6 $ | 2026-11-16 | [Preisseite](https://docs.x.ai/docs/models) |
| OpenRouter (Gateway) | 600+ Modelle von 80+ Anbietern über einen Schlüssel | Durchleitung zum Anbieter-Listenpreis ohne Aufschlag; Plattformgebühr beim Guthabenkauf 5,5 % (Standard) bzw. 8 % (Business); EU-In-Region-Routing erst ab Business | 2026-11-16 | [Preisseite](https://openrouter.ai/pricing) |
| Cortecs (EU/AT) | EU-Gateway mit Datenresidenz, 150+ Modelle von 10+ EU-Anbietern; EUR-Abrechnung, ISO 27001 | Anbieterpreis + 5 % pauschale Servicegebühr — gerechnet auf Claude Sonnet 5.5: 2,10 $ / 10,50 $ statt 2 $ / 10 $ | 2026-11-16 | [Preisseite](https://cortecs.ai/pricing) |

Für die Schul- und Datenschutzperspektive sind die EU-Angebote der interessante Teil:
Cortecs (Wien) bietet EU-Datenresidenz, GDPR-Compliance, ISO 27001, native EUR-Abrechnung
und routet über einen EU-Gateway; Mistral sitzt in Frankreich und bietet
EU-Datenresidenz-Optionen. Bei den Gateways gilt: OpenRouter leitet zum Listenpreis durch
und verlangt eine Gebühr auf das gekaufte Guthaben — In-Region-Routing innerhalb der EU gibt
es dort erst ab dem Business-Plan. Für einen Multi-Modell-Zugang hinter einem Schlüssel
bündelt ein Gateway wie Cortecs (EU, ein Vertragspartner für alle Subprozessoren) oder
OpenRouter (international) viele Anbieter.

## Gratis- und Bildungsangebote

| Anbieter | Angebot | Preis | Stand | Quelle |
|---|---|---|---|---|
| Google AI Studio / Gemini | Free Tier mit Rate-Limits und begrenztem Modellzugang: Gemini 4 Hydrogen ist kostenlos, Gemini 4 Carbon und Gemini 4 Argon sind es nicht. Achtung Datenschutz: Inhalte im Free Tier werden laut Anbieter zur Produktverbesserung genutzt (im Paid Tier nicht) | 0 $ (Rate-Limits) | 2026-11-16 | [Preisseite](https://ai.google.dev/gemini-api/docs/pricing) |
| Groq | Free Plan mit RPM-/RPD-/TPM-/TPD-Limits je Modell; Tages- und Minutenkontingente reichen für Tests und kleine Gruppen | 0 $ (Rate-Limits) | 2026-11-16 | [Rate-Limits](https://console.groq.com/docs/rate-limits) |
| OpenRouter | 25+ kostenlose Modellvarianten (`:free`) von 4 Anbietern, ohne Kreditkarte nutzbar; Free-Plan: 20 Anfragen/Minute und 50 pro Tag, ab 10 $ gekauftem Guthaben 1.000 pro Tag | 0 $; danach kostenpflichtiges Guthaben | 2026-11-16 | [Preisseite](https://openrouter.ai/pricing) |
| GitHub Education | Copilot Student kostenlos für verifizierte Schüler:innen und Studierende; Copilot Pro zusätzlich kostenlos für verifizierte Lehrkräfte und Maintainer populärer Open-Source-Projekte | 0 $ (Copilot Student / Copilot Pro) | 2026-11-16 | [Copilot-Pläne](https://docs.github.com/en/copilot/concepts/billing/individual-plans) |
| Microsoft Azure | Azure for Students: 100 $ Guthaben innerhalb von 12 Monaten plus 65+ dauerhaft freie Dienste (inkl. Azure OpenAI / Foundry), keine Kreditkarte nötig, jährlich erneuerbar. Die Anbieterseite nennt „full-time university students“ — für HTL-Schüler:innen ist die Berechtigung nicht belegt | 100 $ / Jahr | 2026-11-16 | [Azure for Students](https://azure.microsoft.com/en-us/free/students) |
| Mistral (EU/FR) | Education-Plan für verifizierte Studierende an akkreditierten Hochschulen (max. 12 Monate, laut Preisseite inkl. 25,5 $ API-Guthaben/Monat, nur für Erstnutzer:innen) — für HTL-Schüler:innen nicht belegt | 14,99 $ / Monat | 2026-11-16 | [Preisseite](https://mistral.ai/pricing) |

## Hardware für eigene Inferenz

Nur **turnkey**-Systeme: fertig montiert, vom Hersteller/OEM geliefert, Linux-supportet.
Die **Speicherbandbreite** ist die entscheidende Kennzahl für Parallelität (siehe unten);
sie stammt aus der Herstellerspezifikation. Bei den AMD-Strix-Halo-Systemen ist sie aus der
offiziellen Busbreite (256 Bit) und der Speicherdatenrate gerechnet: 256 Bit × 8.000 MT/s
÷ 8 = 256 GB/s, 256 Bit × 8.533 MT/s ÷ 8 = 273 GB/s.

### Kompaktklasse (bis ca. 192 GB Speicher)

| Anbieter | System | Speicher | Bandbreite | Preis | Stand | Quelle |
|---|---|---|---|---|---|---|
| AMD | „Ryzen AI Halo" Developer Platform, Ryzen AI Max+ PRO 495, Linux-Edition | 192 GB Unified (LPDDR5X-8533) | 273 GB/s | 7.299 $ (laut Fachpresse, US-Handel) | 2026-11 (laut Suchergebnis) | [VideoCardz](https://videocardz.com/newz/amd-ryzen-ai-halo-with-ryzen-ai-max-pro-495-launches-at-7299-with-192gb-memory) |
| GMKtec | EVO-X5 Pro, Ryzen AI Max+ PRO 495 | 192 GB Unified (LPDDR5X-8533) | 273 GB/s | 6.799 $ (2 TB SSD); 7.099 $ (4 TB SSD) | 2026-11-16 | [GMKtec](https://www.gmktec.com/products/gmktec-evo-x5-pro-amd-ryzen-ai-max-pro-495-ai-mini-pc) |
| GMKtec | EVO-X3, Ryzen AI Max+ 395 | 128 GB Unified (LPDDR5X-8000) | 256 GB/s | 3.799,99 $ (2 TB SSD); 3.999,99 $ (4 TB SSD) | 2026-11-16 | [GMKtec](https://www.gmktec.com/products/gmktec-evo-x3-ai-mini-pc-amd-ryzen-ai-max-395) |
| Minisforum | MS-S1 Max, Ryzen AI Max+ 395 | 128 GB Unified (LPDDR5X-8000) | 256 GB/s | 2.919,90 $ (128 GB, 2 TB SSD) | 2026-11-16 | [Minisforum](https://www.minisforum.com/products/ms-s1-max) |
| NVIDIA | DGX Spark (GB10) | 64 GB oder 128 GB LPDDR5X Unified (256-Bit-Interface) | 273 GB/s | 128 GB: 6.950 $ (MSRP), Straßenpreis ab 5.999 $ laut Händlerübersicht | 2026-11-16 | [NVIDIA DGX Spark](https://www.nvidia.com/en-us/products/workstations/dgx-spark/), [Preisübersicht](https://physicalailab.io/en/nvidia-dgx-spark-price-specs-buy/) |
| Apple | Mac Studio M5 Max | 36 / 48 / 64 / 128 GB Unified | 460 GB/s (32-Core-GPU), 614 GB/s (40-Core-GPU) | ab 2.499 $ (36 GB, 32-Core-GPU); 40-Core-GPU ab 3.099 $ | 2026-11-16 | [Apple Tech Specs](https://www.apple.com/mac-studio/specs/), [Apple Shop](https://www.apple.com/shop/buy-mac/mac-studio) |

Aus diesen Werten: Die **höchste** Bandbreite hat der Mac Studio M5 Max mit **614 GB/s**
(40-Core-GPU), die **niedrigste** der GMKtec EVO-X3 und der Minisforum MS-S1 Max mit je
**256 GB/s**.

### Regal-/Server-Klasse (ab 256 GB Speicher)

Deckt die Ausbaustufen 256 GB, 512 GB und ≥ 1 TB ab. Ausbaustufen ab 1 TB sind praktisch nur
als Rack-Server mit acht GPUs turnkey erhältlich; im Desk-Side-Format endet das Angebot bei
der NVIDIA DGX Station (748 GB kohärent) und dem Mac Studio M5 Ultra (256 / 512 GB).
NVIDIA vermarktet die 8-GPU-RTX-PRO-6000-Klasse als „RTX PRO Server" (2 / 4 / 8 Karten,
Acht-Karten-Ausbau im 4U-Chassis). Dell (PowerEdge XE9680/XE9685), HPE (ProLiant Compute
XD685), Lenovo (ThinkSystem SR675/SR685), GIGABYTE (G593), Lambda und die NVIDIA DGX B200/
B300 bauen in derselben Klasse, veröffentlichen aber keine belastbaren Listenpreise — deshalb
stehen sie hier nicht in der Tabelle. Aufgenommen ist nur, was mit einer konkreten Zahl
belegt ist.

| Anbieter | System | Speicher | Bandbreite | Bauform | Preis | Stand | Quelle |
|---|---|---|---|---|---|---|---|
| Apple | Mac Studio M5 Ultra | 256 GB Unified (Klasse 256 GB) | 1,2 TB/s | Desk-Side | k. A. (Konfigurationsaufpreis für 256 GB nicht öffentlich belegt) | 2026-11-16 | [Apple Tech Specs](https://www.apple.com/mac-studio/specs/), [Apple Shop](https://www.apple.com/shop/buy-mac/mac-studio) |
| Apple | Mac Studio M5 Ultra, 36-Core-CPU / 80-Core-GPU | 512 GB Unified (Klasse 512 GB) | 1,2 TB/s | Desk-Side | 22.299 $ (6.799 $ Basis + 15.500 $ für 512 GB); mit 16 TB SSD 29.799 $ | 2026-10-28 | [Apple Tech Specs](https://www.apple.com/mac-studio/specs/), [MacRumors](https://www.macrumors.com/2026/10/28/mac-studio-m5-ultra-512gb-ram/) |
| NVIDIA / OEM (Supermicro) | DGX Station (GB300 Grace Blackwell Ultra), als Super AI Station ARS-511GD-NB-LCC-01-G2 | 748 GB kohärent (252 GB HBM3e + 496 GB LPDDR5X; Klasse 512 GB) | 7,1 TB/s (HBM3e), 396 GB/s (LPDDR5X) | Desk-Side (Tower, optional 5U-Rack) | 93.409 $ (Händlerliste) | 2026-11-16 | [NVIDIA DGX Station](https://www.nvidia.com/en-us/products/workstations/dgx-station/), [SparkThai](https://www.sparkthai.com/de/gpu-server-film/super-ai-station-gb300) |
| Octoserver (über UpStation) | 4U-E10G-GENOAX2, 8× RTX 5090 (passive Server Edition) | 256 GB GDDR7 (8× 32 GB; Klasse 256 GB) | 1.792 GB/s je Karte = 14,3 TB/s gesamt | Rack (4U) | 76.679,60 $ (Listenpreis, 8 GPUs); pro GPU 9.584,95 $ | 2026-11-03 | [UpStation](https://ai.upstation.io/p/UPS-GPU-5090-8), [NVIDIA RTX 5090](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/) |
| Supermicro | SYS-422GA-NRT, 8× RTX PRO 6000 Blackwell Server Edition | 768 GB GDDR7 (8× 96 GB; Klasse 512 GB) | 12,8 TB/s (8× 1.597 GB/s) | Rack (4U) | 177.430,31 $ netto (Liste 201.625,35 $); pro GPU 22.178,79 $ | 2026-11-03 | [UpStation](https://ai.upstation.io/p/UPS-GPU-RTXPRO-8), [NVIDIA RTX PRO 6000 SE](https://www.nvidia.com/en-us/data-center/rtx-pro-6000-blackwell-server-edition/) |
| Supermicro | SYS-821GE-TNHR, 8× H200 (Hopper-Generation) | 1.128 GB HBM3e (8× 141 GB; Klasse ≥ 1024 GB) | 38,4 TB/s (8× 4,8 TB/s) | Rack (8U) | 318.117,39 $ netto (Liste 361.497,03 $); pro GPU 39.764,67 $ | 2026-11-03 | [UpStation](https://ai.upstation.io/p/UPS-GPU-H200-8), [NVIDIA H200](https://www.nvidia.com/en-us/data-center/h200/) |
| Supermicro | SYS-822GS-NB3RT, 8× B300 (HGX B300 NVL8) | 2.304 GB HBM3e (8× 288 GB; Klasse ≥ 1024 GB) | 64 TB/s (8× 8 TB/s) | Rack (8U) | 537.196,40 $ netto (Liste 610.450,46 $); pro GPU 67.149,55 $ | 2026-11-03 | [UpStation](https://ai.upstation.io/p/UPS-GPU-B300-8), [NVIDIA GB300 NVL72](https://www.nvidia.com/en-us/data-center/gb300-nvl72/) |

Aus diesen Werten: Die **höchste** Bandbreite hat der Supermicro SYS-822GS-NB3RT mit
**64 TB/s** (8× B300), die **niedrigste** der Mac Studio M5 Ultra mit **1,2 TB/s**.

### Was Parallelität begrenzt

_Stand: 2026-11-13._

Ob ein System viele gleichzeitige Chats trägt, entscheidet nicht der Speicher, sondern die
**Speicherbandbreite**: pro generiertem Token wird das Modell einmal durch den Speicher
gelesen. Parallele Sessions teilen sich denselben Bandbreiten-Topf — doppelt so viele
Sessions heißt halb so viele Tok/s pro Session.

- **Dichte Modelle:** Bytes pro Token = Modellgröße. Ein 70B-Modell in Q4 (~40 GB) liest
  ~40 GB pro Token; auf 273 GB/s sind das rund 4–7 tok/s für *alle* Sessions zusammen.
- **MoE-Modelle** (z. B. gpt-oss-120B, Qwen3-30B-A3B) lesen nur die aktiven Experten
  (~3–5B Parameter) und laufen dadurch um ein Vielfaches schneller — mehr Parallelität bei
  gleicher Hardware.
- **Kapazität ist nicht Parallelität:** 192 GB erlauben ein größeres Modell, nicht mehr
  gleichzeitige Nutzer. Bei gleicher Bandbreite sinkt die Parallelität sogar, weil pro Token
  mehr gelesen wird.
- **Prefill und Batching** kosten Rechenleistung: Systeme mit vLLM/TensorRT-LLM und
  FP4/FP8-Tensorcores verkraften Lastspitzen besser als solche mit MLX/llama.cpp.

Faustregel bei gleichem Modell und gleicher Quantisierung: **höchste Bandbreite = meiste
parallele Sessions.** Kein System der Kompaktklasse trägt eine ganze Schulklasse
(25 gleichzeitige Sessions) — dafür braucht es diskrete GPUs ab etwa 1,6 TB/s.

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

Hinweis: Hardwarepreise sind stark schwankend (Speicherknappheit 2026). Enterprise-Systeme
werden oft nur auf Anfrage angeboten; die genannten Preise sind Listen-, Distributor- oder
Händler-Netto-Preise bzw. als solche gekennzeichnete Straßenpreise. Vor einer Beschaffung
aktuelle Angebote des Händlers einholen.

---

**Wichtig:** Preise ändern sich schnell. Prüfe vor einer Entscheidung immer beim Anbieter
selbst nach — die Angaben hier sind Momentaufnahmen mit Datum.

---

Zurück zur [Startseite](#/) · [Status](status.md) · [Milestones](milestones.md)
