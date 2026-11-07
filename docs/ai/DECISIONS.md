---
type: Decisions
title: Decisions
description: Aktive Architektur- und Technologie-Entscheidungen noch in Kraft, mit Status und Begründung.
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
---

# DECISIONS — KI-Kustodiat

Übersicht der aktiven Entscheidungen. Jede Entscheidung liegt als
eigenes Concept unter [decisions/](decisions/index.md) (OKF-Granularität,
Spec §10.1).

## Beschlossen
- 2026-05-15 — [Management-VM mit LiteLLM + Open WebUI + SearXNG als feste Architektur](decisions/2026-05-15-management-vm-mit-litellm-open-webui.md)
- 2026-05-15 — [AI-Backend nicht öffentlich erreichbar, nur via Proxy](decisions/2026-05-15-ai-backend-nicht-oeffentlich-erreichbar-nur.md)
- 2026-05-15 — [Auth durch Schul-Infrastruktur (SSO/IdM), keine eigene Auth-Lösung](decisions/2026-05-15-auth-durch-schul-infrastruktur-sso-idm.md)
- 2026-05-15 — [Zugriff neben Browser auch via Coding-Tools (OpenCode, Kilo Code) über OpenAI-ko](decisions/2026-05-15-zugriff-neben-browser-auch-via-coding.md)
- 2026-06-24 — [Open-Source-Modelle als primäre Modellbasis (GLM-5.2, DeepSeek V4, Qwen 3.6) – M](decisions/2026-06-24-open-source-modelle-als-primaere-modellbasis.md)
- 2026-06-24 — [Phasen-Strategie: Phase 1 (2026/27) API-lastig, Phase 2 (2027/28) HW-Nachkauf be](decisions/2026-06-24-phasen-strategie-phase-1-2026-27.md)
- 2026-06-24 — [Hardware-Favoriten: Apple Mac Mini Pro + AMD Strix Halo (DGX Spark durch Preiser](decisions/2026-06-24-hardware-favoriten-apple-mac-mini-pro.md)
- 2026-06-24 — [Hybrid-Ansatz: On-Premise für DSGVO-kritische Daten, API (DeepSeek/SiliconFlow) ](decisions/2026-06-24-hybrid-ansatz-on-premise-fuer-dsgvo.md)
- 2026-07-02 — [RTX 2070-Host (dev-rig-01) als Dev/Test-Rig, nicht als vLLM-Backend (8 GB VRAM z](decisions/2026-07-02-rtx-2070-host-dev-rig-01.md)
- 2026-07-02 — [Power-Fix dev-rig-01: 6→8 Pin PCIe-Adapter am zweiten VX550-Strang; kein Y-Split](decisions/2026-07-02-power-fix-dev-rig-01-6.md)
- 2026-07-02 — [Präsentation vom 2026-06-24 (ZID-Pitch, detailliert/technisch) archiviert unter ](decisions/2026-07-02-praesentation-vom-2026-06-24-zid.md)
- 2026-07-02 — [Neue Eröffnungskonferenz-Präsentation (4 Folien, High-Level/Bird's-Eye): Zweck =](decisions/2026-07-02-neue-eroeffnungskonferenz-praesentation-4-folien-high.md)
- 2026-07-05 — [LiteLLM (Docker, bundled Postgres 16, `api_base`=gregors WireGuard-IP `<WG_IP_GR](decisions/2026-07-05-litellm-docker-bundled-postgres-16-api.md)
- 2026-07-05 — [SingleGpuGuard-Plugin (`/opt/litellm/single_gpu_guard.py`) implementiert Single-](decisions/2026-07-05-singlegpuguard-plugin-opt-litellm-single-gpu.md)
- 2026-07-05 — [opencode-Modell-Discovery über models.dev-Merging-Proxy (`:11436`, `OPENCODE_MOD](decisions/2026-07-05-opencode-modell-discovery-ueber-models-dev.md)
- 2026-07-05 — [`gemma4:e4b-128k` (e4b-it-qat @128K) als Sweet-Spot für die 8-GB-Mappe; die ~1,4](decisions/2026-07-05-gemma4-e4b-128k-e4b-it-qat.md)
- 2026-07-05 — [Firewall-Regeln (ufw) bewusst NICHT umgesetzt — `:11435` (ollama) bleibt direkt ](decisions/2026-07-05-firewall-regeln-ufw-bewusst-nicht-umgesetzt.md)
- 2026-07-05 — [LiteLLM-Katalog auf Max-Context-only reduziert: nur `gemma4:e2b-128k` + `gemma4:](decisions/2026-07-05-litellm-katalog-auf-max-context-only.md)
- 2026-07-05 — [5 ungewollte Tags aus ollama entfernt + Blobs inventarisiert](decisions/2026-07-05-5-ungewollte-tags-aus-ollama-entfernt.md)
- 2026-07-05 — [Virtual Keys ohne `models`-Restriction](decisions/2026-07-05-virtual-keys-ohne-models-restriction.md)
- 2026-07-05 — [qwen3:4b als sole LLM](decisions/2026-07-05-qwen3-4b-als-sole-llm.md)
- 2026-07-05 — [Open WebUI mit LDAP (Session 3)](decisions/2026-07-05-open-webui-mit-ldap-session-3.md)
- 2026-07-05 — [Modell-Swap: qwen3:4b (4B, 2,5 GB) → qwen3:1.7b (1,7B, 1,4 GB) via Modelfile-Tag-Override](decisions/2026-07-05-modell-swap-qwen3-4b-4b-2.md)
- 2026-07-05 — [24K Kontext mit Q8-KV-Cache](decisions/2026-07-05-24k-kontext-mit-q8-kv-cache.md)
- 2026-07-05 — [Generation-Parameter](decisions/2026-07-05-generation-parameter.md)
- 2026-07-05 — [Builtin-Tools deaktiviert + tool_choice=none](decisions/2026-07-05-builtin-tools-deaktiviert-tool-choice-none.md)
- 2026-08-13 — [Cortecs (Wien, AT) als EU-souveräner LLM-Router evaluiert](decisions/2026-08-13-cortecs-wien-at-als-eu-souveraener.md)
- 2026-08-13 — [Framework Desktop Strix Halo 128 GB (~€1.850) als On-Prem-Hardware-Favorit bestätigt](decisions/2026-08-13-framework-desktop-strix-halo-128-gb.md)
- 2026-09-17 — [gregors VPN-IP `<WG_IP_GREGOR>` als canonical URL-Basis](decisions/2026-09-17-gregors-vpn-ip-wg-ip-gregor.md)
- 2026-09-17 — [LiteLLM 1.91.0 → 1.101.0 + Image-Digest-Pin](decisions/2026-09-17-litellm-1-91-0-1-101.md)
- 2026-09-17 — [Open WebUI: direkte Ollama-Connection + `qwen3:8b-search` für Web Search](decisions/2026-09-17-open-webui-direkte-ollama-connection-qwen3.md)
- 2026-09-24 — [Open WebUI LDAP-only (Issue #22)](decisions/2026-09-24-open-webui-ldap-only-issue-22.md)
- 2026-10-07 — [GPU exklusiv für Whisper, Ollama aus, LiteLLM-Reserve](decisions/2026-10-07-gpu-exklusiv-fuer-whisper-ollama-aus.md)
- 2026-10-11 — [Headless-Agenten-Jobs pinnen ihr Modell (Issue #33)](decisions/2026-10-11-headless-agenten-jobs-pinnen-ihr-modell.md)
- 2026-10-18 — [Master-Token-Paradigma: Token-Verwaltung bleibt in der Schule (Issue #34)](decisions/2026-10-18-master-token-paradigma-token-verwaltung-bleibt.md)
- 2026-10-18 — [Transparenz gegenüber Cortecs über konkurrierende OCRE-Wege (Issue #34)](decisions/2026-10-18-transparenz-gegenueber-cortecs-ueber-konkurrierende-ocre.md)
- 2026-10-19 — [Implementationsdetails gehören ausschließlich ins private Schwester-Repo, GitHub Pages wird auf einen reinen Website-Verweis reduziert (Issues #37, #38)](decisions/2026-10-19-implementationsdetails-gehoeren-ausschliesslich-ins-private-schwester.md)
- 2026-10-19 — [SearXNG-Instanz-Trennung: Schule=gregor, private Operator-Instanz extern (Issue #36)](decisions/2026-10-19-searxng-instanz-trennung-schule-gregor-private.md)
- 2026-10-17 — [Angebots-Hardware: zwei Klassen, ausschließlich turnkey (Issue #32)](decisions/2026-10-17-angebots-hardware-zwei-klassen-ausschliesslich-turnkey.md)
- 2026-10-26 — [BBG-Beschaffungsweg als eng gefasste Ausnahme auf der öffentlichen Angebotsseite (Issue #32)](decisions/2026-10-26-bbg-beschaffungsweg-als-eng-gefasste-ausnahme.md)
- 2026-10-29 — [Eine App für Website und Token-Portal (`app/` im public Repo) (Issue #35)](decisions/2026-10-29-eine-app-fuer-website-und-token.md)
- 2026-10-29 — [Ein Design-System, Pico wird abgelöst (Issue #35)](decisions/2026-10-29-ein-design-system-pico-wird-abgeloest.md)
- 2026-10-29 — [Rollen werden aus den LDAP-CNs abgeleitet (Issue #35)](decisions/2026-10-29-rollen-werden-aus-den-ldap-cns.md)
- 2026-10-29 — [Zielkonfiguration: Gateway auf der Management-VM, gregor nur Whisper + SearXNG (Issue #35)](decisions/2026-10-29-zielkonfiguration-gateway-auf-der-management-vm.md)
- 2026-10-29 — [Requests aus einer View, Kontingent in USD intern / Prozent + Tokens in der Anzeige (Issue #35)](decisions/2026-10-29-requests-aus-einer-view-kontingent-in.md)
- 2026-10-29 — [Portal-Auth: LDAP search-then-bind, Sessions in Postgres, eigene DB-Rolle `portal` (Issue #47)](decisions/2026-10-29-portal-auth-ldap-search-then-bind.md)
- 2026-10-29 — [Datenschutz ist ein Go-Live-Gate, kein Bau-Gate (Issue #35)](decisions/2026-10-29-datenschutz-ist-ein-go-live-gate.md)
- 2026-10-29 — [Speech-to-Text über das Gateway: ein Gateway, sprechende VHosts, keine zweite Instanz (Issue #55)](decisions/2026-10-29-speech-to-text-ueber-das-gateway.md)
- 2026-10-29 — [Paritätstests: Struktur statt Pixel (Issue #35/#44/#45)](decisions/2026-10-29-paritaetstests-struktur-statt-pixel-issue-35.md)
- 2026-10-30 — [Tokenverwaltung unter `/tokens`, Anleitungen unter `/anleitung/…`, Startseite als Kacheln (Issue #57)](decisions/2026-10-30-tokenverwaltung-unter-tokens-anleitungen-unter-anleitung.md)
- 2026-11-07 — [Die Wissensbasis folgt dem Open Knowledge Format (OKF) v0.2 (Issues #58, opencode-helpers#127)](decisions/2026-11-07-die-wissensbasis-folgt-dem-open-knowledge.md)
- 2026-11-07 — [OKF-Migration progressiv „on touch", Stufe 2 (Konzept-Granularität) zurückgestellt (Issues #58, opencode-helpers#127)](decisions/2026-11-07-okf-migration-progressiv-on-touch-stufe.md)

## In Evaluierung
- Hardware-Optionen (AMD Strix Halo, Mac Mini Pro, DGX Spark) — siehe Issues #2, #5, #7
- Modell-Routing-Strategie (LiteLLM Access Groups) — siehe Issue #6
- Gemma 4 Family als VIP-Modell — siehe Issue #7
- Netzwerk-Isolation der Backend-Knoten — siehe Issue #4
- ROCm vs. CUDA für AMD-Hardware – Strix Halo erfordert ROCm-Kompatibilität mit vLLM
- Externes KI-Kursangebot (pup-consulting.at) – fachliche Klärung offen — siehe KI-Kustodiat-intern:docs/extern/pup-priglinger/pup-ki-kursangebot.md
