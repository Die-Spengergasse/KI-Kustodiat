# Angebote

_Aktualisiert: 2026-10-19._

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
| OpenAI | GPT-6 Astra (Flagschiff); GPT-6.1 Sol; GPT-6 Luna | Astra: 10 $ / 50 $; Sol: 2 $ / 10 $; Luna: 0,10 $ / 0,50 $ (Standard, Eingabe ≤ 272 K Token) | 2026-10-19 | [Preisseite](https://developers.openai.com/api/docs/pricing) |
| Anthropic | Claude Fable 5.1 (Flagschiff); Opus 5.5; Sonnet 5.5; Haiku 5.5 | Fable 5.1: 10 $ / 50 $; Opus 5.5: 4 $ / 20 $; Sonnet 5.5: 2 $ / 10 $; Haiku 5.5: 0,10 $ / 0,50 $ (Prompts ≤ 100 K) | 2026-10-19 | [Preisseite](https://platform.claude.com/docs/en/about-claude/pricing) |
| Google | Gemini 4 Argon (Flagschiff); Gemini 3.8 Flash; Gemini 3.5 Flash-Lite | Argon: 2 $ / 10 $ (bis 30.11.2026, danach 4 $ / 20 $); 3.8 Flash: 0,75 $ / 3,75 $ (bis 31.12.2026, danach 1,50 $ / 7,50 $); Flash-Lite: 0,30 $ / 2,50 $ | 2026-10-19 | [Preisseite](https://ai.google.dev/gemini-api/docs/pricing) |
| Mistral (EU/FR) | Large 4 (Flagschiff); Large 3; Medium 3.5; Small 4 | Large 4: 0,68 $ / 2,09 $ (Aktionspreis, regulär 1,36 $ / 4,18 $); Large 3: 0,50 $ / 1,50 $; Medium 3.5: 1,50 $ / 7,50 $; Small 4: 0,15 $ / 0,60 $ | 2026-10-19 | [Preisseite](https://docs.mistral.ai/inference/pricing) |
| Groq | GPT-OSS 120B / 20B; Qwen3.8 27B; Whisper large-v3 / Turbo | 120B: 0,15 $ / 0,60 $; 20B: 0,075 $ / 0,30 $; Qwen3.8 27B: 0,80 $ / 4,00 $; Whisper: 0,111 $ / Std. (Turbo 0,04 $ / Std.) | 2026-10-19 | [Modell-/Preisseite](https://console.groq.com/docs/models) |
| xAI | Grok 4.7 (Flagschiff) | 2 $ / 6 $ (Prompt < 200 K); 4 $ / 12 $ (Prompt ≥ 200 K) | 2026-10-19 | [Preisseite](https://docs.x.ai/docs/models) |
| Cortecs (EU/AT) | Gateway mit EU-Datenresidenz, 150+ Modelle von 10+ EU-Anbietern; EUR-Abrechnung, DPA, ISO 27001 | Anbieterpreis + 5 % pauschale Servicegebühr (Modellpreise im Katalog) | 2026-10-19 | [Preisseite](https://cortecs.ai/pricing) |

Mistral (Frankreich) und Cortecs (Wien) bieten einen Auftragsverarbeitungsvertrag (DPA)
und EU-Datenresidenz; Cortecs routet über einen EU-Gateway und rechnet in EUR ab. Für
einen Multi-Modell-Zugang hinter einem Schlüssel bündelt ein Gateway wie OpenRouter
(international) oder Cortecs (EU) viele Anbieter.

## Gratis- und Bildungsangebote

| Anbieter | Angebot | Preis | Stand | Quelle |
|---|---|---|---|---|
| Anthropic | Kein dauerhaftes Gratis-Tier für die API, nur ein kleines Startguthaben zum Testen | 0 $ (Start-Credits) | 2026-10-19 | [Preisseite/FAQ](https://platform.claude.com/docs/en/about-claude/pricing) |
| Google AI Studio / Gemini | Kostenloser Zugang mit Rate-Limits (Gemini 3.8 Flash im Free Tier „free of charge", Argon nicht im Free Tier). Achtung Datenschutz: Inhalte im Free Tier werden laut Anbieter zur Produktverbesserung genutzt | 0 $ (Rate-Limits) | 2026-10-19 | [Preisseite](https://ai.google.dev/gemini-api/docs/pricing) |
| Groq | Free Plan mit Tages-/Minuten-Limits, z. B. GPT-OSS 120B: 30 RPM / 1.000 RPD / 8K TPM / 200K TPD | 0 $ (Rate-Limits) | 2026-10-19 | [Rate-Limits](https://console.groq.com/docs/rate-limits) |
| OpenRouter | 17 kostenlose Modelle (u. a. NVIDIA Nemotron 3 Ultra, Google Gemma 4, Thinking Machines Inkling), ohne Kreditkarte; 20 Anfragen/Min. und 200 Anfragen/Tag je Modell | 0 $ (Rate-Limits) | 2026-10-19 | [Modellkatalog](https://openrouter.ai/models) |
| Mistral (EU/FR) | Education-/Pro-Plan für verifizierte Studierende (max. 12 Monate, inkl. 25,50 $ API-Guthaben/Monat); die FAQ nennt zusätzlich 5,99 $/Monat für verifizierte Studierende | 14,99 $ / Monat (zzgl. Steuern) | 2026-10-19 | [Preisseite](https://mistral.ai/pricing) |
| Apple | Bildungs-/Education-Preise (US): Mac mini M6 ab 799 $, Mac Studio M5 Max ab 2.299 $, Mac Studio M5 Ultra ab 5.099 $ | US-Bildungspreise, in AT über den Education Store abweichend | 2026-10-19 | [Apple Newsroom](https://www.apple.com/newsroom/2026/09/the-new-mac-mini-and-mac-studio-are-available-today/) |

## Hardware für eigene Inferenz

Nur **turnkey**-Systeme: fertig montiert, vom Hersteller/OEM geliefert, Linux-supportet.

### Kompaktklasse (bis ca. 192 GB Speicher)

| Anbieter | Angebot | Preis | Stand | Quelle |
|---|---|---|---|---|
| AMD | Ryzen AI Halo (Entwickler-Mini-PC, Linux-Version), Ryzen AI Max+ PRO 495, 192 GB Unified Memory | 7.299,99 $ (Vorgängermodell mit 128 GB: 3.999,99 $) | 2026-10-12 | [VideoCardz](https://videocardz.com/newz/amd-ryzen-ai-halo-with-ryzen-ai-max-pro-495-launches-at-7299-with-192gb-memory) |
| AMD Strix Halo (turnkey-Mini-PCs, 128 GB) | GMKtec EVO-X2, Bosgame M5, Minisforum MS-S1 Max, Beelink GTR9 Pro | EVO-X2: 3.499,99 $ (1 TB) / 3.649,99 $ (2 TB); Bosgame M5: 3.599 $ (2 TB); MS-S1 Max: 3.879 $ (2 TB); GTR9 Pro: 4.349 $ (2 TB) | 2026-10-10 | [ComputingForGeeks](https://computingforgeeks.com/ryzen-ai-max-395-mini-pc-comparison/) |
| NVIDIA | DGX Spark, 64 GB bzw. 128 GB Unified Memory | 64 GB: 4.999 $; 128 GB: 6.950 $ (laut Suchergebnis/Händlerangaben — NVIDIA selbst nennt keinen Listenpreis; 64 GB ab 23.10.2026 über OEM-Partner) | 2026-10-19 | [NVIDIA](https://www.nvidia.com/en-us/products/workstations/dgx-spark/), [acecloud.ai](https://acecloud.ai/blog/nvidia-dgx-spark-price/) |
| Apple | Mac Studio M5 Max, bis 128 GB Unified Memory | ab 2.499 $ (Bildung 2.299 $); 128-GB-Konfiguration ab 5.099 $ (laut Fachpresse) | 2026-09-24 | [Apple](https://www.apple.com/newsroom/2026/09/the-new-mac-mini-and-mac-studio-are-available-today/), [ComputingForGeeks](https://computingforgeeks.com/ryzen-ai-max-395-mini-pc-comparison/) |

### Regal-/Server-Klasse (ab 256 GB Speicher)

Deckt die Ausbaustufen 256 GB, 512 GB und ≥ 1 TB ab. Größere Ausbaustufen sind heute
praktisch nur als Rack-Server (8-GPU) turnkey erhältlich; im Desk-Side-Format endet das
Angebot bei der NVIDIA DGX Station (748 GB kohärent) und dem Mac Studio M5 Ultra.
Vendoren wie Dell (PowerEdge XE9680), HPE (ProLiant Compute XD685), Lenovo
(ThinkSystem SR675/SR685) und GIGABYTE (G593) bauen in derselben Klasse, veröffentlichen
aber keine Listenpreise — deshalb stehen sie hier nicht, solange keine belegte Zahl
vorliegt.

| Anbieter | System | Speicher | Bauform | Preis | Stand | Quelle |
|---|---|---|---|---|---|---|
| NVIDIA / OEM (MSI) | DGX Station (GB300 Grace Blackwell Ultra) | 252 GB HBM3e + 496 GB LPDDR5X = 748 GB kohärent | Desk-Side | 85.000 $ (MSI XpertStation WS300, publizierter Listenpreis; andere OEMs ohne Listenpreis) | 2026-10-08 | [NVIDIA](https://www.nvidia.com/en-us/products/workstations/dgx-station/), [Spheron](https://www.spheron.network/blog/dgx-station-gb300-vs-renting-gb300-nvl72-break-even-guide-20/) |
| Apple | Mac Studio M5 Ultra | 256 / 512 GB Unified Memory | Desk-Side | 256 GB ≈ 9.499 $ (5.499 $ + 4.000 $ Speicher-Upgrade); 512 GB: Preis noch nicht veröffentlicht (Auslieferung ab Ende Okt. 2026) | 2026-09-24 | [Apple](https://www.apple.com/mac-studio/specs/), [Fello AI](https://felloai.com/m5-ultra-mac-studio/) |
| Supermicro | SYS-821GE-TNHR, 8× H200 | 1,13 TB GPU-Speicher (8× 141 GB) | Rack | 284.770 $ (Listenpreis 323.603 $) | 2026-10-13 | [UpStation](https://ai.upstation.io/p/UPS-GPU-H200-8) |
| Supermicro | SYS-422GA-NRT, 8× RTX PRO 6000 Blackwell Server Edition | 768 GB GPU-Speicher (8× 96 GB) | Rack | 173.031 $ (Listenpreis 196.626 $) | 2026-10-13 | [UpStation](https://ai.upstation.io/p/UPS-GPU-RTXPRO-8) |
| NVIDIA / OEM | DGX B300 (8× B300) | 2,3 TB GPU-Speicher (8× 288 GB) | Rack | 475.000–500.000 $ (Tier-2-Systembauer, NDA-Range); Supermicro-Angebot netto 499.937 $ (Liste 568.110 $) | 2026-10-13 | [UpStation](https://ai.upstation.io/p/UPS-GPU-B300-8) |
| NVIDIA / OEM | DGX B200 (8× B200) | 1,44 TB GPU-Speicher (8× 180 GB) | Rack | 390.000–410.000 $ (Tier-2-Systembauer, NDA-Range) | 2026-10-13 | [UpStation](https://ai.upstation.io/p/UPS-GPU-B200-8-T2) |

Hinweis: Hardwarepreise sind stark schwankend (Speichermangel 2026). Enterprise-Systeme
werden oft nur auf Anfrage angeboten; die genannten Preise sind Listenpreise, Distributor-
oder Händler-Ranges bzw. als solche gekennzeichnete Industrie-/NDA-Ranges. Vor einer
Beschaffung aktuelle Angebote des Händlers einholen.

---

**Wichtig:** Preise ändern sich schnell. Prüfe vor einer Entscheidung immer beim Anbieter
selbst nach — die Angaben hier sind Momentaufnahmen mit Datum.

---

Zurück zur [Startseite](#/) · [Status](status.md) · [Milestones](milestones.md)
