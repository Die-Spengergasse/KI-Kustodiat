# Angebote

_Aktualisiert: 2026-10-17._

Übersicht über Token-Preise, Gratis- und Bildungsangebote sowie Optionen für eigene
Hardware. Stand: Token-/Gratis-Angaben vom 2026-10-12, Hardware-Klassen vom 2026-10-17
(genaues Datum je Zeile). Es werden ausschließlich **turnkey**-Systeme gelistet — fertig
montiert, vom Hersteller/OEM geliefert, Linux-supportet.

## Token-Preise (API)

Preise je 1 Mio. Token (Input / Output), Standard-Tarif, USD.

| Anbieter | Angebot | Preis | Stand | Quelle |
|---|---|---|---|---|
| OpenAI | GPT-6.1 Sol (Standard); GPT-6 Astra (Premium); GPT-6 Luna (günstig) | Sol: 2 $ / 10 $; Astra: 10 $ / 50 $; Luna: 0,10 $ / 0,50 $ (Short Context ≤ 272K) | 2026-10-12 | [Preisseite](https://developers.openai.com/api/docs/pricing) |
| Anthropic | Claude Opus 5.5 / Sonnet 5.5 / Haiku 5.5; Fable 5.1 (Flagschiff) | Opus 5.5: 4 $ / 20 $; Sonnet 5.5: 2 $ / 10 $; Haiku 5.5: 0,10 $ / 0,50 $ (Prompts ≤ 100K); Fable 5.1: 10 $ / 50 $ | 2026-10-12 | [Preisseite](https://platform.claude.com/docs/en/about-claude/pricing) |
| Google | Gemini 3.1 Pro Preview; Gemini 3.8 Flash; Gemini 3.5 Flash-Lite | 3.1 Pro: 2 $ / 12 $ (Prompts ≤ 200K); 3.8 Flash: 0,75 $ / 3,75 $ (bis 31.12.2026, danach 1,50 $ / 7,50 $); Flash-Lite: 0,30 $ / 2,50 $ | 2026-10-12 | [Preisseite](https://ai.google.dev/gemini-api/docs/pricing) |
| Mistral (EU/FR) | Large 4 / Large 3 / Medium 3.5 / Small 4 | Large 4: 0,68 $ / 2,09 $ (Aktionspreis, regulär 1,36 $ / 4,18 $); Large 3: 0,50 $ / 1,50 $; Medium 3.5: 1,50 $ / 7,50 $; Small 4: 0,15 $ / 0,60 $ | 2026-10-12 | [Preisseite](https://docs.mistral.ai/inference/pricing) |
| Groq | GPT-OSS 120B / 20B; Qwen3.8 27B; Whisper large-v3 | 120B: 0,15 $ / 0,60 $; 20B: 0,075 $ / 0,30 $; Qwen3.8 27B: 0,80 $ / 4,00 $; Whisper: 0,111 $ / Std. | 2026-10-12 | [Modell-/Preisseite](https://console.groq.com/docs/models) |
| xAI | Grok 4.7 | 2 $ / 6 $ (Prompts < 200K); 4 $ / 12 $ (Prompts ≥ 200K) | 2026-10-12 | [Preisseite](https://docs.x.ai/docs/models) |
| Cortecs (EU/AT) | Gateway mit EU-Datenresidenz, 150+ Modelle, 10+ EU-Anbieter; EUR-Abrechnung, DPA | Anbieterpreis + 5 % pauschale Servicegebühr (Modellpreise im Katalog) | 2026-10-12 | [Preisseite](https://cortecs.ai/pricing) |

Mistral (Frankreich) und Cortecs (Wien) bieten einen Auftragsverarbeitungsvertrag (DPA) und
EU-Datenresidenz; Cortecs routet über einen EU-Gateway und rechnet in EUR ab. Für einen
Multi-Modell-Zugang bündelt ein Gateway wie OpenRouter (international) oder Cortecs (EU)
viele Anbieter hinter einem Schlüssel.

## Gratis- und Bildungsangebote

| Anbieter | Angebot | Preis | Stand | Quelle |
|---|---|---|---|---|
| Anthropic | Kein dauerhaftes Gratis-Tier für die API, nur ein kleines Startguthaben zum Testen | 0 € (Start-Credits) | 2026-10-12 | [Preisseite](https://platform.claude.com/docs/en/about-claude/pricing) |
| Google AI Studio / Gemini | Kostenloser Zugang mit Rate-Limits. Achtung Datenschutz: Inhalte im Free Tier werden laut Anbieter zur Produktverbesserung genutzt | 0 € (Rate-Limits) | 2026-10-12 | [Preisseite](https://ai.google.dev/gemini-api/docs/pricing) |
| Groq | Free Plan mit Tages-/Minuten-Limits, z. B. GPT-OSS 120B 30 RPM / 1.000 RPD / 8K TPM / 200K TPD | 0 € (Rate-Limits) | 2026-10-12 | [Rate-Limits](https://console.groq.com/docs/rate-limits) |
| OpenRouter | 19 kostenlose Modelle (u. a. NVIDIA Nemotron 3, Google Gemma 4), ohne Kreditkarte | 0 € (Rate-Limits) | 2026-10-12 | [Modellkatalog](https://openrouter.ai/models) |
| Mistral | Pro Education Plan für verifizierte Studierende (max. 12 Monate, inkl. 25,5 $ API-Guthaben/Monat); die FAQ nennt zusätzlich 5,99 $/Monat für verifizierte Studierende | 14,99 $ / Monat (zzgl. Steuern) | 2026-10-12 | [Preisseite](https://mistral.ai/pricing) |
| Apple | Bildungs-/Education-Preise (US): Mac mini M6 ab 799 $, Mac Studio M5 Max ab 2.299 $ | US-Bildungspreise, in AT über den Education Store abweichend | 2026-09-22 | [Apple Newsroom](https://www.apple.com/newsroom/2026/09/the-new-mac-mini-and-mac-studio-are-available-today/) |

## Hardware für eigene Inferenz

Nur **turnkey**-Systeme: fertig montiert, vom Hersteller/OEM geliefert, Linux-supportet.
DIY-Bausätze, Eigenbau aus Einzel-GPUs und Gebraucht-Selbstbau sind bewusst **nicht**
gelistet.

### Kompaktklasse (bis ca. 192 GB Speicher)

| Anbieter | Angebot | Preis | Stand | Quelle |
|---|---|---|---|---|
| AMD | Ryzen AI Halo (Entwicklerbox), 128 GB Unified Memory | 3.999 $ (Marktstart 29.09.2026, laut Pressebericht) | 2026-09-29 | [Ai Miracle](https://www.aimiracle.ai/ai-news/amd-ryzen-ai-halo-launch/) |
| Strix Halo 128 GB (turnkey-Mini-PCs) | GMKtec EVO-X2, Bosgame M5, Minisforum MS-S1 Max, Beelink GTR9 Pro | EVO-X2 3.499,99 $ (1 TB) / 3.649,99 $ (2 TB); M5 3.599 $ (2 TB); MS-S1 Max 3.879 $ (2 TB); GTR9 Pro 4.349 $ (2 TB) | 2026-10-10 | [ComputingForGeeks](https://computingforgeeks.com/ryzen-ai-max-395-mini-pc-comparison/) |
| NVIDIA | DGX Spark, 64 GB / 128 GB | 64 GB: 4.999 $ (ab 23.10.2026 über OEM-Partner); 128 GB: k. A. (NVIDIA nennt keinen Preis), Marktmeldungen bis ca. 6.950 $ | 2026-10-02 | [NVIDIA](https://www.nvidia.com/en-us/products/workstations/dgx-spark/), [Layer3Labs](https://www.layer3labs.io/guides/dgx-spark-explained) |
| Apple | Mac Studio M5 Max, bis 128 GB Unified Memory | ab 2.499 $ (Bildung 2.299 $); 128-GB-Konfiguration ca. 5.099 $ (laut Händler-Listing) | 2026-09-22 | [Apple Newsroom](https://www.apple.com/newsroom/2026/09/the-new-mac-mini-and-mac-studio-are-available-today/) |

### Regal-/Server-Klasse (ab 256 GB Speicher)

Deckt die Ausbaustufen 256 GB, 512 GB und ≥ 1 TB ab. Größere Ausbaustufen sind heute
praktisch nur als Rack-Server (8-GPU) turnkey; im Desk-Side-Format endet das Angebot bei
der NVIDIA DGX Station (748 GB kohärent).

| Anbieter | System | Speicher | Bauform | Preis | Stand | Quelle |
|---|---|---|---|---|---|---|
| NVIDIA | DGX Station (GB300 Grace Blackwell Ultra) | 252 GB HBM3e + 496 GB LPDDR5X = 748 GB kohärent; bis 1-B-Parameter-Modelle | Desk-Side (1.600 W) | ca. 99.000–188.500 $ (Distributor-Range; NVIDIA nennt keinen Preis) | 2026-10-08 | [NVIDIA](https://www.nvidia.com/en-us/products/workstations/dgx-station/), [Aquanode/pi3g](https://www.aquanode.io/blog/nvidia-dgx-station-gb300-guide) |
| Apple | Mac Studio M5 Ultra | 96 / 256 / 512 GB Unified Memory (512 GB ab Ende Okt. 2026) | Desk-Side | ab 5.499 $ (96 GB); 512-GB-Konfiguration ≈ 20.000 $+ (Schätzung, kein Apple-Preis) | 2026-09-22 | [Apple Newsroom](https://www.apple.com/newsroom/2026/09/the-new-mac-mini-and-mac-studio-are-available-today/) |
| Supermicro (via Händler) | SYS-422GA-NRT, 8× RTX PRO 6000 Blackwell (je 96 GB) | 768 GB GPU-Speicher (1 TB RAM) | Rack | 191.888 $ (Händler-Konfigurator) | 2026-09-22 | [Upstation](https://ai.upstation.io/p/UPS-GPU-RTXPRO-8) |
| NVIDIA | DGX B200 (8× B200) bzw. DGX B300 (8× Blackwell Ultra) | B200: 1,44 TB GPU; B300: 2,1 TB GPU | Rack | B200: k. A. (NVIDIA nennt keinen Preis); B300 8-GPU: ca. 300.000–350.000 $ (Industrie-Schätzung) | 2026-10-08 | [NVIDIA](https://www.nvidia.com/en-us/data-center/dgx-b300/), [Telnyx](https://telnyx.com/resources/nvidia-b300-pricing) |
| OEM (z. B. Dell PowerEdge XE9680, GIGABYTE G593) | 8× H200 HGX | 1,1 TB GPU-Speicher (8× 141 GB) | Rack | Node ca. 293.000 $ (Händler-Listing); Einzelkarte (H200 NVL) 32.000–47.500 $ | 2026-10-16 | [ThunderCompute](https://www.thundercompute.com/blog/nvidia-h200-pricing) |

Hinweis: Hardwarepreise sind stark schwankend (Speichermangel 2026). Enterprise-Systeme
werden oft nur auf Anfrage angeboten; die genannten Preise sind Distributor-/Händler-Ranges
bzw. Industrie-Schätzungen. Vor einer Beschaffung aktuelle Angebote des Händlers einholen.

---

**Wichtig:** Preise ändern sich schnell. Vor einer Entscheidung immer beim Anbieter selbst
prüfen — die Angaben hier sind Momentaufnahmen mit Datum.

---

Zurück zur [Startseite](#/) · [Status](status.md) · [Milestones](milestones.md)
