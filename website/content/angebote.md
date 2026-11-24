# Angebote

_Aktualisiert: 2026-11-24._

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
| OpenAI | GPT-6 Astra (Flaggschiff); GPT-6.1 Sol; GPT-6.1 Terra; GPT-6 Luna | Astra: 10 $ / 50 $; Sol: 2 $ / 10 $; Terra: 1 $ / 5 $; Luna: 0,10 $ / 0,50 $. Batch je −50 %, Cache-Input 1 $ / 0,10 $ / 0,05 $ / 0,01 $ | 2026-11-24 (Seite ohne Datum) | [Preisseite](https://developers.openai.com/api/docs/pricing) |
| Anthropic | Claude Fable 5.2 (Flaggschiff); Opus 5.5; Sonnet 5.5; Haiku 5.5 | Fable 5.2: 8 $ / 40 $ (Cache-Hit 0,20 $); Opus 5.5: 4 $ / 20 $; Sonnet 5.5: 2 $ / 10 $; Haiku 5.5: 0,10 $ / 0,50 $ bei Prompts ≤ 100 K Token, darüber 0,50 $ / 2,50 $. Batch je −50 % | 2026-11-24 (Seite ohne Datum) | [Preisseite](https://platform.claude.com/docs/en/about-claude/pricing) |
| Google | Gemini 4 Carbon und Gemini 4 Argon (Flaggschiffe, reasoning); Gemini 4 Hydrogen; Gemini 3.8 Flash | Carbon/Argon: **2 $ / 10 $ nur bis 30.11.2026**, ab 01.12.2026 **4 $ / 20 $** (Cache 0,10 $ → 0,20 $); Hydrogen: 1,50 $ / 7,50 $; 3.8 Flash: 0,75 $ / 3,75 $ bis 31.12.2026, ab 01.01.2027 1,50 $ / 7,50 $ | Stichtage auf der Seite | [Preisseite](https://ai.google.dev/gemini-api/docs/pricing) |
| Mistral (EU/FR) | Mistral Large 4 (Flaggschiff); Mistral Small 4; Ministral 3 3B | Large 4: 0,70 $ / 2,10 $ (Cache-Input 0,07 $); Small 4: 0,15 $ / 0,60 $; Ministral 3 3B: 0,10 $ / 0,10 $ | 2026-11-24 (Seite ohne Datum) | [Preisseite](https://docs.mistral.ai/inference/pricing) |
| Groq | GPT-OSS 120B / 20B; Qwen3.8 27B (Preview); Whisper large-v3 | 120B: 0,15 $ / 0,60 $; 20B: 0,075 $ / 0,30 $; Qwen3.8 27B: 0,80 $ / 4,00 $ | 2026-11-24 (Seite ohne Datum) | [Modell-/Preisseite](https://console.groq.com/docs/models) |
| xAI | Grok 4.7 (Flaggschiff); Grok 4.3 | Grok 4.7: 2 $ / 6 $ bis 200 K Prompt-Token, darüber 4 $ / 12 $; Grok 4.3: 1,25 $ / 2,50 $ | 2026-11-24 (Seite ohne Datum) | [Preisseite](https://docs.x.ai/docs/models) |
| OpenRouter (Gateway) | 600+ Modelle von 80+ Anbietern über einen Schlüssel | Auf Token **kein** Aufschlag (Provider-Listenpreis); Gebühr beim Guthaben-Kauf: 5,5 % Standard, 8 % Business; EU-In-Region-Routing erst ab Business | 2026-11-24 | [Preisseite](https://openrouter.ai/pricing) |
| Cortecs (EU/AT) | EU-Gateway mit Datenresidenz, EUR-Abrechnung, DPA, ISO 27001 | 5 % pauschal auf die Upstream-Tokenpreise, in EUR — z. B. GPT-6 Astra 11,14 € / 55,69 €, Gemini 4 Carbon 2,00 € / 10,01 €, Claude Haiku 5.5 0,10 € / 0,51 € | 2026-11-24 | [Preisliste](https://api.cortecs.ai/v1/models), [Preisseite](https://cortecs.ai/pricing) |

Cortecs (Wien) tritt als dein Auftragsverarbeiter auf, führt die Modellanbieter als
Subprozessoren und routet EU-intern; damit hast du einen DPA für alle Anbieter und
Rechnungen in EUR. Mistral sitzt in Frankreich und bietet EU-Datenresidenz-Optionen; auf
derselben Preisseite finden sich auch gehostete Fremdmodelle, etwa DeepSeek V4.1 Flash mit
0,30 $ / 1,20 $, GLM 5.3 Flash mit 0,15 $ / 0,50 $ und GLM 5.3 mit 1,40 $ / 4,40 $. Bei
den Gateways liegt der Aufschlag unterschiedlich: OpenRouter verlangt nichts auf Token,
sondern 5,5 % (Business 8 %) auf gekauftes Guthaben, Cortecs 5 % auf die Tokenkosten.

Zwei Preisänderungen stehen unmittelbar an: Geminis Flaggschiffe Carbon und Argon
verdoppeln sich am **1.12.2026** von 2 $ / 10 $ auf 4 $ / 20 $, und Geminis 3.8 Flash
verdoppelt sich am **1.1.2027**. Wer für das zweite Semester kalkuliert, sollte mit den
höheren Sätzen rechnen.

## Gratis- und Bildungsangebote

| Anbieter | Angebot | Preis | Stand | Quelle |
|---|---|---|---|---|
| Google AI Studio / Gemini | Free Tier ohne Kosten für Gemini 4 Hydrogen, 3.8 Flash, 3.6 Flash, 3.5 Flash-Lite und 3.1 Flash-Lite; **nicht** enthalten sind die Flaggschiffe Carbon und Argon, auch Batch und Caching fehlen. Achtung Datenschutz: Inhalte im Free Tier werden laut Anbieter zur Produktverbesserung genutzt (im bezahlten Tier nicht) | 0 $ (Rate-Limits) | 2026-11-24 | [Preisseite](https://ai.google.dev/gemini-api/docs/pricing), [Rate-Limits](https://ai.google.dev/gemini-api/docs/rate-limits) |
| Google AI Studio / Gemini | Die Rate-Limits gelten pro Projekt (nicht pro Key) und werden in RPM / TPM / RPD gemessen; die genauen Free-Tier-Zahlen stehen nur noch eingeloggt in AI Studio — öffentlich dokumentiert sind sie nicht mehr | 0 $ (Rate-Limits) | 2026-11-24 | [Rate-Limits](https://ai.google.dev/gemini-api/docs/rate-limits) |
| Groq | Free Plan mit Tages-/Minuten-Limits, z. B. GPT-OSS 120B: 30 RPM / 1.000 RPD / 8 K TPM / 200 K TPD | 0 $ (Rate-Limits) | 2026-11-24 | [Rate-Limits](https://console.groq.com/docs/rate-limits) |
| OpenRouter | Kostenlose Modellvarianten (`:free`): laut Preisseite 25+ Modelle von 4 Free-Providern, kein Prompt-Caching, kein EU-In-Region-Routing | 0 $; 20 Anfragen/Min. und 50 Anfragen/Tag, ab 10 $ gekauftem Guthaben 1.000/Tag | 2026-11-24 | [Preisseite](https://openrouter.ai/pricing), [Limits](https://openrouter.ai/docs/api-reference/limits) |
| GitHub Education | Copilot Student kostenlos für verifizierte Schüler:innen und Studierende — High School zählt ausdrücklich, Mindestalter 13, Nachweis über Schul-ID, Stundenplan oder Zeugnis, Berechtigung wird monatlich neu geprüft. Einschränkung: nur automatische Modellauswahl, keine Third-Party-Agents | 0 $ (Copilot Student) | 2026-11-24 | [Copilot Student](https://docs.github.com/en/copilot/how-tos/copilot-on-github/set-up-copilot/enable-copilot/set-up-for-students), [Education-Bewerbung](https://docs.github.com/en/education/about-github-education/github-education-for-students/apply-to-github-education-as-a-student) |
| GitHub Education | Copilot Pro kostenlos für verifizierte Lehrkräfte und Maintainer populärer Open-Source-Projekte, ebenfalls mit monatlicher Neubewertung | 0 $ (Copilot Pro) | 2026-11-24 | [GitHub Docs](https://docs.github.com/en/copilot/how-tos/manage-your-account/get-free-access-to-copilot-pro) |
| GitHub Copilot | Copilot Free ohne Verifikation: 2.000 Completions pro Monat, Chat eingeschränkt, nur automatische Modellauswahl — der Fallback für alle, die die Education-Verifikation nicht schaffen | 0 $ | 2026-11-24 | [Plans](https://docs.github.com/en/copilot/get-started/plans) |
| Mistral (EU/FR) | Vibe/Le Chat Free-Plan: begrenzte Nachrichten, Web-Suchen und Coding-Sessions; Modelltraining nur mit Opt-out | 0 $ | 2026-11-24 | [Preisseite](https://mistral.ai/pricing) |
| Apple | Store Bildung: rund 8 % unter dem Listenpreis, Verifikation über Schul-E-Mail oder Unterlagen. Für Lehrkräfte klar nutzbar, für Schüler:innen nennt die AT-Seite nur „Studierende und Lehrkräfte“ | z. B. Mac Studio M5 Max 36 GB: 2.759 € statt 2.999 € | 2026-11-24 | [Store Bildung AT](https://www.apple.com/at-edu/shop/buy-mac/mac-studio) |

Zwei Programme passen **nicht** für eine HTL, auch wenn sie in einschlägigen Listen stehen:
**Azure for Students** (100 $ Guthaben für 12 Monate, keine Kreditkarte) ist laut
Anbieterseite ausdrücklich „available only to full-time university students“, also
Hochschulstudierenden vorbehalten. **Mistral Education** (5,99 $ statt 14,99 $ im Monat,
maximal 12 Monate, nur für Erstnutzer:innen) verlangt eine akkreditierte Hochschule.

## Hardware für eigene Inferenz

Nur **turnkey**-Systeme: fertig montiert, vom Hersteller/OEM geliefert, Linux-supportet.
Die **Speicherbandbreite** steht in beiden Tabellen mit, weil sie bestimmt, wie viele
Sitzungen ein System parallel trägt — nicht die Speicherkapazität (siehe unten).

### Kompaktklasse (bis ca. 192 GB Speicher)

| Anbieter | System | Speicher | Bandbreite | Preis | Stand | Quelle |
|---|---|---|---|---|---|---|
| AMD | „Ryzen AI Halo" Developer Platform, Ryzen AI Max+ PRO 495, Linux-Edition | 192 GB Unified (LPDDR5X-8533, 256 bit, bis 160 GB als Grafikspeicher) | 273 GB/s¹ | 7.299,99 $ Listenpreis (Handel ab 8.799,95 $) | 2026-11-24 | [AMD](https://www.amd.com/en/products/processors/laptop/ryzen-ai-halo.html), [Micro Center](https://www.microcenter.com/product/717068/amd-ryzen-ai-halo-developer-platform-with-ryzen-ai-max-pro-495-processor-linux-os) |
| TOPC | TXA2 Workstation, Ryzen AI Max+ PRO 495, 2 TB SSD | 192 GB Unified (LPDDR5X-8533, 256 bit) | 273 GB/s¹ | ab 6.499 $ (Herstellerstore) | 2026-11-24 | [TOPC](https://en.tbtopc.com/product/topc-txa2-ai-max-pro-495-workstation-192gb/) |
| MINISFORUM | MS-S1 MAX-P495, Ryzen AI Max+ PRO 495 | 192 GB Unified (LPDDR5X-8533, 256 bit) | 273 GB/s¹ | 7.399 $ (Herstellerstore) | 2026-11-24 | [MINISFORUM](https://store.minisforum.com/products/minisforum-ms-s1-max-p495-ai-workstation) |
| MINISFORUM | MS-S1 MAX 128 GB, Ryzen AI Max+ 395 | 128 GB Unified (LPDDR5X-8000, 256 bit) | 256 GB/s¹ | 3.959 $ Aktionspreis (regulär 4.949 $) | 2026-11-24 | [MINISFORUM](https://store.minisforum.com/products/minisforum-ms-s1-max-mini-pc) |
| GMKtec | EVO-X2, Ryzen AI Max+ 395, 1 TB SSD | 128 GB Unified (LPDDR5X-8000, verlötet) | 256 GB/s¹ | 3.499,99 $ (Herstellerstore) | 2026-11-24 | [GMKtec](https://www.gmktec.com/products/amd-ryzen-ai-max-395-evo-x2-ai-mini-pc) |
| NVIDIA / ASUS | DGX Spark (GB10), Ascent GX10, 64 GB + 1 TB | 64 GB Unified (LPDDR5X, 256 bit, kohärent) | 273 GB/s | 5.959,88 € (Straßenpreis AT) | 2026-11-24 | [NVIDIA](https://www.nvidia.com/en-us/products/workstations/dgx-spark/), [Geizhals](https://geizhals.at/asus-ascent-dgx-spark-gx10-a3551306.html) |
| NVIDIA / Lenovo | DGX Spark (GB10), ThinkStation PGX, 128 GB + 1 TB | 128 GB Unified (LPDDR5X, 256 bit, kohärent) | 273 GB/s | 6.158 € (Straßenpreis AT) | 2026-11-24 | [NVIDIA](https://www.nvidia.com/en-us/products/workstations/dgx-spark/), [Geizhals](https://geizhals.at/lenovo-thinkstation-pgx-dgx-spark-30kl0073gf-a3959977.html) |
| Apple | Mac Studio M5 Max, 18-Core CPU / 32-Core GPU | 36 GB Unified | 460 GB/s | 2.999 € (Store AT) | 2026-11-24 | [Apple Tech Specs](https://www.apple.com/at/mac-studio/specs/) |
| Apple | Mac Studio M5 Max, 18-Core CPU / 40-Core GPU | 64 GB Unified | 614 GB/s | ab 3.993,99 € (Straßenpreis) | 2026-11-24 | [Apple Tech Specs](https://www.apple.com/at/mac-studio/specs/) |
| Apple | Mac Studio M5 Max, 18-Core CPU / 40-Core GPU, 512 GB SSD | 128 GB Unified | 614 GB/s | ab 5.509 € (Straßenpreis) | 2026-11-24 | [Apple Tech Specs](https://www.apple.com/at/mac-studio/specs/) |

Die höchste Bandbreite dieser Tabelle hat der **Mac Studio M5 Max mit 40-Core-GPU
(614 GB/s)**, die niedrigste der **GMKtec EVO-X2 und der MINISFORUM MS-S1 MAX 128 GB
(je 256 GB/s)**.

¹ AMD nennt für die Ryzen-AI-Max-Plattform keine GB/s-Zahl, sondern nur die Transferrate
(LPDDR5X-8533 bzw. -8000 bei 256 bit). Die Werte sind daraus gerechnet und decken sich
mit NVIDIAs publizierten 273 GB/s für dieselbe 8533-MT/s-Konfiguration.

### Regal-/Server-Klasse (ab 256 GB Speicher)

Deckt die Ausbaustufen 256 GB, 512 GB und ≥ 1 TB ab. Die **512-GB-Klasse ist praktisch ein
Desk-Side-Monopol**: 4× RTX PRO 6000 ergeben 384 GB, 8× schon 768 GB, H200-/B200-Systeme
liegen bei 1,1–2,1 TB. Ab 1 TB gibt es heute nur Rack-Server mit acht GPUs — und deren
Speicher ist über NVLink verteiltes HBM, kein zusammenhängender Adressraum; ein 2-TB-Modell
läuft dort nur mit Tensor- oder Pipeline-Parallelismus.

| Anbieter | System | Speicher | Bandbreite | Bauform | Preis | Stand | Quelle |
|---|---|---|---|---|---|---|---|
| NVIDIA / OEM | DGX Station (GB300) | 748 GB kohärent — 252 GB HBM3e + 496 GB LPDDR5X (Klasse 512 GB) | 7,1 TB/s HBM3e; LPDDR-Tier 396 GB/s über NVLink-C2C mit 900 GB/s | Desk-Side (Tower) | 93.277 € Einstieg; 107.500 € bis 204.000 € je OEM (Distributor-Listenpreise) | 2026-11-24 | [NVIDIA](https://www.nvidia.com/en-us/products/workstations/dgx-station/), [buyzero.de](https://buyzero.de/en/collections/nvidia-dgx-station-gb300) |
| Apple | Mac Studio M5 Ultra, 30-Core CPU / 64-Core GPU | 256 GB Unified (Klasse 256 GB) | 1,2 TB/s | Desk-Side | ab 10.800 € (Straßenpreis AT) | 2026-11-24 | [Apple Tech Specs](https://www.apple.com/at/mac-studio/specs/), [Geizhals](https://geizhals.at/?fs=mac+studio+m5+ultra) |
| Apple | Mac Studio M5 Ultra, 36-Core CPU / 80-Core GPU, 2 TB SSD | 512 GB Unified (Klasse 512 GB) | 1,2 TB/s | Desk-Side | 25.629 € (Cyberport.at, Preisupdate 24.11.2026) | 2026-11-24 | [Geizhals](https://geizhals.at/apple-mac-studio-z1u4-z1u5-a3998168.html) |
| Supermicro | SYS-422GA-NRT-02-G2, 8× RTX PRO 6000 Blackwell Server Edition („RTX PRO Server") | 768 GB GPU-Speicher (8× 96 GB) — zwischen 512 GB und 1 TB | 8× 1.597 GB/s, in Summe 12,8 TB/s (PCIe, kein NVLink) | Rack (4U) | 205.871,76 $ netto (Distributor-Listenpreis) | 2026-11-24 | [Supermicro](https://www.supermicro.com/en/products/system/gpu/4u/sys-422ga-nrt), [serverparts.cz](https://www.serverparts.cz/en/sys-422ga-nrt-02-g2-i13251) |
| NVIDIA | DGX B200, 8× B200 | 1,44 TB HBM3e (8× 180 GB; Klasse ≥ 1024 GB) | 8× 8 TB/s pro GPU, in Summe ≈ 64 TB/s | Rack (10U) | 591.114,20 $ (Broadberry-Konfigurator, RRP 738.892,75 $) | 2026-11-12 | [NVIDIA](https://docs.nvidia.com/dgx/dgxb200-user-guide), [Broadberry](https://www.broadberry.com/) |
| NVIDIA | DGX B300, 8× Blackwell Ultra SXM | 2,1 TB HBM3e (8× 288 GB; Klasse ≥ 1024 GB) | 8× 8 TB/s pro GPU, in Summe ≈ 64 TB/s | Rack (10U) | ab 522.559 $ (günstigstes datiertes Listing) | 2026-11-12 | [NVIDIA](https://www.nvidia.com/en-us/data-center/dgx-b300/), [Enzu](https://www.enzu.com/nvidia-b300.php) |

Die höchste Bandbreite dieser Tabelle haben der **DGX B300 und der DGX B200 mit je
8 TB/s pro GPU (≈ 64 TB/s über acht GPUs)**, die niedrigste der **Mac Studio M5 Ultra mit
1,2 TB/s**.

Nicht in der Tabelle, weil kein belastbarer Preis vorliegt: Dell (PowerEdge XE9680 mit
8× H200, XE9685L mit 8× B200), HPE (ProLiant Compute XD685), Lenovo (ThinkSystem SR675 und
SR685a V3), GIGABYTE (G593) und NVIDIA DGX Station for Windows. Diese Systeme liegen
technisch in derselben Klasse — 1,1 bis 2,1 TB HBM3e, 8× 4,8 TB/s (H200) bzw. 8× 8 TB/s
(B200/B300) pro GPU — aber die Hersteller nennen keinen Listenpreis, sondern verweisen auf
Angebote. Die in Umlauf befindlichen Preisrahmen (rund 320.000–420.000 $ für ein 8×-H200-
System, 447.000–650.000 $ für B200/B300) sind Industrie-Schätzungen ohne Primärquelle.
**Lambda** verkauft keine Systeme, sondern Kapazität: die Preisseite listet Stundensätze
(HGX B200 ab 7,69 $ je GPU-Stunde) und für den Kauf ein „talk to our team“.

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

Hinweis: Hardwarepreise schwanken stark (Speichermangel 2026), und Enterprise-Systeme
werden oft nur auf Anfrage angeboten. Die genannten Preise sind Listen-, Distributor- oder
als solche gekennzeichnete Straßenpreise, teils ohne Umsatzsteuer. Vor einer Beschaffung
aktuelle Angebote des Händlers einholen.

---

**Wichtig:** Preise ändern sich schnell. Prüfe vor einer Entscheidung immer beim Anbieter
selbst nach — die Angaben hier sind Momentaufnahmen mit Datum.

---

Zurück zur [Startseite](#/) · [Status](status.md) · [Milestones](milestones.md)
