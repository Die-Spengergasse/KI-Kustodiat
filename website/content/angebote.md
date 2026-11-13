# Angebote

_Aktualisiert: 2026-11-13._

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
| OpenAI | GPT-6 Astra (Flaggschiff); GPT-6.1 Sol; GPT-6.1 Terra; GPT-6 Luna | Astra: 10 $ / 50 $ (Cache-Input 1 $); Sol: 2 $ / 10 $; Terra: 1 $ / 5 $; Luna: 0,10 $ / 0,50 $; Batch je −50 % | 2026-11-13 | [Preisseite](https://developers.openai.com/api/docs/pricing) |
| Anthropic | Claude Fable 5.2 (Flaggschiff); Opus 5.5; Sonnet 5.5; Haiku 5.5 | Fable 5.2: 8 $ / 40 $ (Cache-Hit 0,20 $); Opus 5.5: 4 $ / 20 $; Sonnet 5.5: 2 $ / 10 $ (Cache-Hit 0,10 $); Haiku 5.5: 0,10 $ / 0,50 $ bei Prompts ≤ 100 K Token, darüber 0,50 $ / 2,50 $ | 2026-11-13 | [Preisseite](https://platform.claude.com/docs/en/about-claude/pricing) |
| Google | Gemini 4 Carbon (Flaggschiff); Gemini 4 Argon; Gemini 3.8 Flash; Gemini 3.5 Flash-Lite | Carbon und Argon: je 2 $ / 10 $ bis 30.11.2026, ab 01.12.2026 4 $ / 20 $; 3.8 Flash: 0,75 $ / 3,75 $ bis 31.12.2026, ab 01.01.2027 1,50 $ / 7,50 $; 3.5 Flash-Lite: 0,30 $ / 2,50 $ | 2026-11-13 | [Preisseite](https://ai.google.dev/gemini-api/docs/pricing) |
| Mistral (EU/FR) | Mistral Large 4 (Flaggschiff); Mistral Small 4; Ministral 3 14B; gehostet: DeepSeek V4.1 Flash, GLM 5.3 / 5.3 Flash | Large 4: 0,70 $ / 2,10 $ (Cache-Input 0,07 $); Small 4: 0,15 $ / 0,60 $; Ministral 3 14B: 0,20 $ / 0,20 $; DeepSeek V4.1 Flash: 0,30 $ / 1,20 $; GLM 5.3: 1,40 $ / 4,40 $; GLM 5.3 Flash: 0,15 $ / 0,50 $ | 2026-11-13 | [Preisseite](https://docs.mistral.ai/inference/pricing) |
| Groq | GPT-OSS 120B / 20B; Qwen3.8 27B; Whisper large-v3 / Turbo | 120B: 0,15 $ / 0,60 $; 20B: 0,075 $ / 0,30 $; Qwen3.8 27B: 0,80 $ / 4,00 $; Whisper: 0,111 $ / Std. (Turbo 0,04 $ / Std.) | 2026-11-13 | [Modell-/Preisseite](https://console.groq.com/docs/models) |
| xAI | Grok 4.7 (Flaggschiff), 500 K Kontext | 2 $ / 6 $ | 2026-11-13 | [Preisseite](https://docs.x.ai/docs/models) |
| OpenRouter (Gateway) | 600+ Modelle von 80+ Anbietern über einen Schlüssel | Durchleitung zum Anbieter-Listenpreis, Plattformgebühr 5,5 % auf gekauftes Guthaben (Business: 8 %); EU-In-Region-Routing erst ab Business | 2026-11-13 | [Preisseite](https://openrouter.ai/pricing) |
| Cortecs (EU/AT) | EU-Gateway mit Datenresidenz, 150+ Modelle von 10+ EU-Anbietern; EUR-Abrechnung, DPA, ISO 27001 | Anbieterpreis + 5 % pauschale Servicegebühr — gerechnet auf Claude Sonnet 5.5: 2,10 $ / 10,50 $ statt 2 $ / 10 $ | 2026-11-13 | [Preisseite](https://cortecs.ai/pricing) |

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
| Google AI Studio / Gemini | Free Tier mit Rate-Limits: Gemini 3.8 Flash und 3.5 Flash-Lite sind kostenlos, Gemini 4 Carbon und Gemini 4 Argon nicht. Achtung Datenschutz: Inhalte im Free Tier werden laut Anbieter zur Produktverbesserung genutzt (im Paid Tier nicht) | 0 $ (Rate-Limits) | 2026-11-13 | [Preisseite](https://ai.google.dev/gemini-api/docs/pricing) |
| Groq | Free Plan mit Tages-/Minuten-Limits, z. B. GPT-OSS 120B: 30 RPM / 1.000 RPD / 8 K TPM / 200 K TPD | 0 $ (Rate-Limits) | 2026-11-13 | [Rate-Limits](https://console.groq.com/docs/rate-limits) |
| OpenRouter | 25+ kostenlose Modellvarianten (`:free`), ohne Kreditkarte nutzbar; der Free-Plan erlaubt 50 Anfragen pro Tag | 0 $; 50 Anfragen/Tag, danach kostenpflichtiges Guthaben | 2026-11-13 | [Preisseite](https://openrouter.ai/pricing) |
| GitHub Education | Copilot Student kostenlos für verifizierte Schüler:innen und Studierende; Copilot Pro zusätzlich kostenlos für verifizierte Lehrkräfte und Maintainer populärer Open-Source-Projekte | 0 $ (Copilot Student / Copilot Pro) | 2026-11-13 | [Copilot-Pläne](https://docs.github.com/en/copilot/concepts/billing/individual-plans), [Lehrkräfte](https://docs.github.com/en/copilot/how-tos/manage-your-account/get-free-access-to-copilot-pro) |
| Microsoft Azure | Azure for Students: 100 $ Guthaben für 12 Monate plus 65+ dauerhaft freie Dienste (inkl. Azure OpenAI / Foundry), kein Kreditkarteneintrag, jährlich erneuerbar. Die Anbieterseite nennt „full-time university students“ — für HTL-Schüler:innen ist die Berechtigung nicht belegt | 100 $ / Jahr | 2026-11-13 | [Azure for Students](https://azure.microsoft.com/en-us/free/students) |
| Mistral (EU/FR) | Education-Plan für verifizierte Studierende an akkreditierten Hochschulen (max. 12 Monate, laut Preisliste inkl. 25,50 $ API-Guthaben/Monat, nur für Erstnutzer:innen) — für HTL-Schüler:innen nicht belegt | 14,99 $ / Monat | 2026-11-13 | [Preisseite](https://mistral.ai/pricing) |
| Apple | Education-Preise (US): Mac Studio M5 Max ab 2.299 $, M5 Ultra ab 5.099 $; in Österreich über den AT-Education-Store mit abweichenden Preisen | US-Bildungspreise, laut Fachpresse; nicht 1:1 auf AT übertragbar | 2026-10-28 | [Apple Education Store](https://www.apple.com/us-hed/shop/buy-mac/mac-studio), [Fello AI](https://felloai.com/m5-ultra-mac-studio/) |

## Hardware für eigene Inferenz

Nur **turnkey**-Systeme: fertig montiert, vom Hersteller/OEM geliefert, Linux-supportet.
Die **Speicherbandbreite** ist die entscheidende Kennzahl für Parallelität (siehe unten);
sie stammt aus der Herstellerspezifikation. Bei den AMD-Strix-Halo-Systemen ist sie aus
der offiziellen Busbreite (256 Bit) und der Speicherdatenrate (LPDDR5X-8000 bzw. -8533)
gerechnet: 256 Bit × 8.000 MT/s ÷ 8 = 256 GB/s, 256 Bit × 8.533 MT/s ÷ 8 = 273 GB/s.

### Kompaktklasse (bis ca. 192 GB Speicher)

| Anbieter | System | Speicher | Bandbreite | Preis | Stand | Quelle |
|---|---|---|---|---|---|---|
| AMD | „Ryzen AI Halo" Entwickler-Mini-PC, Ryzen AI Max+ PRO 495, Linux-Edition | 192 GB Unified (LPDDR5X-8533, 2 TB SSD, bis 160 GB als Grafikspeicher) | 273 GB/s | 7.299,99 $ (Micro Center, nur US-Ladengeschäft) | 2026-11-13 | [VideoCardz](https://videocardz.com/newz/amd-ryzen-ai-halo-with-ryzen-ai-max-pro-495-launches-at-7299-with-192gb-memory), [Micro Center](https://www.microcenter.com/product/717068/amd-ryzen-ai-halo-developer-platform-with-ryzen-ai-max-pro-495-processor-linux-os) |
| GMKtec | EVO-X5 Pro, Ryzen AI Max+ PRO 495 | 192 GB Unified (LPDDR5X-8533, bis 160 GB VRAM, 2 TB SSD) | 273 GB/s | 6.799 $ (2 TB); 7.099 $ (4 TB); EU-Variante im Herstellershop | 2026-11-13 | [GMKtec](https://www.gmktec.com/products/gmktec-evo-x5-pro-amd-ryzen-ai-max-pro-495-ai-mini-pc) |
| GMKtec | EVO-X3, Ryzen AI Max+ 395 | 128 GB Unified (LPDDR5X-8000, bis 96 GB VRAM) | 256 GB/s | 3.799,99 $ (2 TB); 3.999,99 $ (4 TB) | 2026-11-13 | [GMKtec](https://www.gmktec.com/products/gmktec-evo-x3-ai-mini-pc-amd-ryzen-ai-max-395) |
| Minisforum | MS-S1 Max, Ryzen AI Max+ 395 | 128 GB Unified (LPDDR5X-8000, 2 TB SSD) | 256 GB/s | 2.919,90 $ (128 GB, 2 TB SSD); derzeit nicht lieferbar | 2026-11-13 | [Minisforum](https://www.minisforum.com/products/ms-s1-max) |
| NVIDIA | DGX Spark (GB10) | 64 / 128 GB Unified (LPDDR5X, 256-Bit-Interface) | 273 GB/s | 128 GB: 6.950 $; 64 GB: ab 4.999 $ über die OEM-Partner | 2026-11-13 | [NVIDIA DGX Spark](https://www.nvidia.com/en-us/products/workstations/dgx-spark/), [Preisübersicht](https://physicalailab.io/en/nvidia-dgx-spark-price-specs-buy/) |
| Apple | Mac Studio M5 Max | 36 / 48 / 64 / 128 GB Unified (LPDDR5X) | 614 GB/s (40-Core-GPU), 460 GB/s (32-Core-GPU) | ab 2.499 $ (36 GB); 128 GB mit 1 TB ab 5.937 € (deutscher Handel, inkl. USt.) | 2026-11-13 | [Apple Tech Specs](https://www.apple.com/mac-studio/specs/), [Apple Newsroom](https://www.apple.com/newsroom/2026/09/the-new-mac-mini-and-mac-studio-are-available-today/), [billiger.de](https://www.billiger.de/pricelist/5903968352-apple-mac-studio-m5-max-mini-pc-2026-128-gb-ram-1-tb-ssd) |

Aus diesen Werten: Die **höchste** Bandbreite hat der Mac Studio M5 Max mit **614 GB/s**
(40-Core-GPU), die **niedrigste** der GMKtec EVO-X3 und der Minisforum MS-S1 Max mit je
**256 GB/s**.

### Regal-/Server-Klasse (ab 256 GB Speicher)

Deckt die Ausbaustufen 256 GB, 512 GB und ≥ 1 TB ab. Ausbaustufen über 768 GB sind heute
praktisch nur als Rack-Server (8-GPU) turnkey erhältlich; im Desk-Side-Format endet das
Angebot bei der NVIDIA DGX Station (748 GB kohärent) und dem Mac Studio M5 Ultra
(256 / 512 GB). NVIDIA vermarktet die 8-GPU-RTX-PRO-6000-Klasse als „RTX PRO Server"
(2 / 4 / 8 Karten, Acht-Karten-Ausbau im 4U-Chassis, laut NVIDIA 13 TB/s
Gesamtbandbreite) — einen belegten Listenpreis gibt es dafür über die Systempartner,
hier über Supermicro. Dell (PowerEdge XE9680/XE9685), HPE (ProLiant Compute XD685),
Lenovo (ThinkSystem SR685a V3), GIGABYTE (G593), Lambda und Aivres bauen in derselben
Klasse, veröffentlichen aber keine Listenpreise — deshalb stehen sie hier nicht in der
Tabelle, solange keine belegte Zahl vorliegt. Dasselbe gilt für die NVIDIA DGX B200/DGX
B300, die NVIDIA nur über Systempartner und ohne öffentlichen Listenpreis anbietet; die
B200-Listung ist bei den Partnerkatalogen inzwischen verschwunden.

| Anbieter | System | Speicher | Bandbreite | Bauform | Preis | Stand | Quelle |
|---|---|---|---|---|---|---|---|
| Apple | Mac Studio M5 Ultra | 256 GB Unified (Klasse 256 GB) | 1,2 TB/s | Desk-Side | 9.499 $ (96-GB-Basis 5.499 $ + 4.000 $ Aufpreis für 256 GB) | 2026-11-13 | [Apple Tech Specs](https://www.apple.com/mac-studio/specs/), [Apple Newsroom](https://www.apple.com/newsroom/2026/09/the-new-mac-mini-and-mac-studio-are-available-today/), [Fello AI](https://felloai.com/m5-ultra-mac-studio/) |
| Apple | Mac Studio M5 Ultra | 512 GB Unified (Klasse 512 GB) | 1,2 TB/s | Desk-Side | 22.299 $ (512 GB mit 1 TB SSD; 16 TB SSD: 29.799 $) | 2026-10-28 | [Apple Tech Specs](https://www.apple.com/mac-studio/specs/), [MacRumors](https://www.macrumors.com/2026/10/28/mac-studio-m5-ultra-512gb-ram/), [9to5Mac](https://9to5mac.com/2026/10/28/apple-reveals-pricing-for-mac-studio-with-512gb-of-ram/) |
| NVIDIA / OEM (Supermicro) | DGX Station (GB300 Grace Blackwell Ultra), als Super AI Station ARS-511GD-NB-LCC-01-G2 | 748 GB kohärent (252 GB HBM3e + 496 GB LPDDR5X; Klasse 512 GB) | 7,1 TB/s (HBM3e) | Desk-Side (Tower, optional 5U-Rack) | 93.409 $ Supermicro-Listenpreis; OEM-Listings 92.887 $ (Supermicro) bis 159.283 $ (Dell) | 2026-11-13 | [NVIDIA DGX Station](https://www.nvidia.com/en-us/products/workstations/dgx-station/), [SparkThai](https://www.sparkthai.com/de/gpu-server-film/super-ai-station-gb300), [BetterClaw](https://www.betterclaw.io/blog/dgx-station-alternative) |
| Supermicro | SYS-422GA-NRT, 8× RTX PRO 6000 Blackwell Server Edition | 768 GB GDDR7 (8× 96 GB; Klasse 512 GB) | 12,8 TB/s (8× 1.597 GB/s) | Rack (4U) | 177.430,31 $ netto (Listenpreis 201.625,35 $); pro GPU 22.178,79 $ | 2026-11-03 | [UpStation](https://ai.upstation.io/p/UPS-GPU-RTXPRO-8), [NVIDIA RTX PRO 6000 SE](https://www.nvidia.com/en-us/data-center/rtx-pro-6000-blackwell-server-edition/) |
| Supermicro | SYS-821GE-TNHR, 8× H200 (Hopper-Generation) | 1.128 GB HBM3e (8× 141 GB; Klasse ≥ 1024 GB) | 38,4 TB/s (8× 4,8 TB/s) | Rack (8U) | 318.117,39 $ netto (Listenpreis 361.497,03 $); pro GPU 39.764,67 $ | 2026-11-03 | [UpStation](https://ai.upstation.io/p/UPS-GPU-H200-8), [NVIDIA H200](https://www.nvidia.com/en-us/data-center/h200/) |
| Supermicro | SYS-822GS-NB3RT, 8× B300 (HGX B300 NVL8) | 2.304 GB HBM3e (8× 288 GB; Klasse ≥ 1024 GB) | 64 TB/s (8× 8 TB/s) | Rack (8U) | 537.196,40 $ netto (Listenpreis 610.450,46 $); pro GPU 67.149,55 $ | 2026-11-03 | [UpStation](https://ai.upstation.io/p/UPS-GPU-B300-8), [NVIDIA GB300 NVL72](https://www.nvidia.com/en-us/data-center/gb300-nvl72/) |

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

Hinweis: Hardwarepreise sind stark schwankend (Speichermangel 2026). Enterprise-Systeme
werden oft nur auf Anfrage angeboten; die genannten Preise sind Listenpreise, Distributor-
oder Händler-Netto- bzw. als solche gekennzeichnete Straßenpreise. Vor einer Beschaffung
aktuelle Angebote des Händlers einholen.

---

**Wichtig:** Preise ändern sich schnell. Prüfe vor einer Entscheidung immer beim Anbieter
selbst nach — die Angaben hier sind Momentaufnahmen mit Datum.

---

Zurück zur [Startseite](#/) · [Status](status.md) · [Milestones](milestones.md)
