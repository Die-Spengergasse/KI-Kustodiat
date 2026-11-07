---
type: Pitfalls
title: "Pitfalls — Recherche, Markt und Preise"
description: "Anbieter-, Preis-, Lizenz- und Datenschutz-Recherche veraltet schnell."
tags: [ki-kustodiat, pitfalls, research-market]
generated: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
---

# Recherche, Markt und Preise — Pitfalls

- **GitHub Discussions: Kategorien via GraphQL nicht verwaltbar** — das Schema kennt keine `create/update/deleteDiscussionCategory`-Mutationen (nur Discussion-/Kommentar-Operationen). Umbenennen/Anlegen/Sortieren nur über die Web-UI (`discussions/categories`, Admin-Rechte nötig).
- **Cisco-`secure-web`-Proxy-URLs in Dokumenten verrotten**: Links, die per Mail/E2 aus Proxy-Redirects kopiert werden (`secure-web.cisco.com/<token>/https%3A//...`), sind an das eigene Konto gebunden und funktionieren für niemanden sonst — immer die echte Ziel-URL dekodieren und eintragen.
- **Hardware-Entscheidung blockiert Setup**: Ohne finale Hardware kann vLLM-Konfiguration nicht abgeschlossen werden
- **ROCm vs. CUDA**: AMD-Optionen sind günstiger, aber ROCm-Ökosystem ist weniger ausgereift als CUDA
- **Gemma 4 Lizenz**: Apache 2.0, aber SuperGemma 4 Uncensored ist ein Community-Derivat – Policy für Schulumgebung klären
- **SSO-Integration**: Auth hängt an Schul-IdM – Koordination mit ZID nötig
- **Tool Calling Zuverlässigkeit**: Nicht alle Modelle liefern konsistentes Function Calling für SearXNG – evaluieren vor Deployment
- **Preise veralten schnell**: Hardware- und API-Preise ändern sich monatlich. Alle Preisangaben mit Datum versehen (DOMAIN.md). Stand 2026-06-24 als Referenz notiert.
- **China-Datenschutz**: DeepSeek, SiliconFlow, Kimi, GLM sind chinesische Anbieter. DSGVO-konformer Betrieb ungeklärt. On-Premise oder EU-Anbieter (Hetzner, OVHcloud, Gcore, Mistral) sind der sichere Weg.
- **China-Datenschutz — Lösung via EU-Router (2026-08-13)**: Direkt-APIs von DeepSeek/SiliconFlow/Kimi/GLM sind **Tier 4** (nicht DSGVO-konform): Daten auf chinesischen Servern, kein EU-Controller/Zwischenstufe, italienische Garante-Sperre bei DeepSeek. Lösung: EU-Router wie **Cortecs** (Tier 1, Wien, EU-native Clouds Scaleway/OVH/IONOS, ISO 27001, DPA, No-Training) hostet dieselben Modelle EU-souveran. Siehe `docs/Recherche/cortecs-provider-evaluation.md` für vollständige DSGVO-Tier-Klassifikation (Tier 1: Cortecs, Azure OpenAI; Tier 2: Anthropic/OpenAI/Together/Fireworks; Tier 3: OpenRouter; Tier 4: Direct-China).
- **ChatGPT Edu-Preis unsicher**: Quellen widersprechen sich ($10/Schüler/Jahr vs. $10/Schüler/Monat). Letzteres angenommen für Berechnungen. Vor Vertrag klären.
- **GPU-DRAM-Preisschock**: LPDDR5x-Knappheit hat DGX-Spark- und Hetzner-Preise 2025/26 steigen lassen. Temporär, aber aktuell real.
- **Gemma-4-Kontextlängen sind Architektur-Eigenschaft**: e4b/e2b = 128K nativ; 12b/26b/31b = 256K. `PARAMETER num_ctx` über die Trainings-Grenze hinaus → Qualitätsverfall jenseits der Grenze (RoPE-Positionen ungesehen in Training) + verschwendeter KV-Cache.
