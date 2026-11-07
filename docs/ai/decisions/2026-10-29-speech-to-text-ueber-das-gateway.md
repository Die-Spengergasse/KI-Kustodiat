---
type: Decision
title: "Speech-to-Text über das Gateway: ein Gateway, sprechende VHosts, keine zweite Instanz (Issue #55)"
description: "Speech-to-Text über das Gateway: ein Gateway, sprechende VHosts, keine zweite Instanz (Issue #55)"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-10-29T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-52
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/52
    title: Issue #52
  - id: issue-55
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/55
    title: Issue #55
---

**Speech-to-Text über das Gateway: ein Gateway, sprechende VHosts, keine zweite Instanz (Issue #55):** Whisper läuft weiter auf gregor, ist aber über `https://whisper.kik.spengergasse.at/v1/` nur noch mit **Portal-Keys** erreichbar; der geteilte `WHISPER_API_KEY` liegt nur noch auf den beiden Servern (gregor: Env + Open-WebUIs SQLite-Config, kik: `/etc/litellm/litellm.env`) und in keinem Client mehr. Die Trennung „Coding" vs. „Diktat" passiert am **Edge** (`api.kik` vs. `whisper.kik`), nicht an der Prozessgrenze: **eine** LiteLLM-Instanz, **eine** DB. Reasons: (a) ein zweiter Proxy erhöht den Durchsatz nicht — der Engpass ist die eine GPU auf gregor mit einem seriellen Prozess; (b) zwei Instanzen mit **gemeinsamer** DB teilen ohnehin Version, Redis-Zähler und Key-Raum (beide migrieren beim Start, `LiteLLM_ProxyModelTable` ist gemeinsam) — man zahlt die Pflege ohne die Unabhängigkeit; (c) zwei Instanzen mit **getrennten** DBs zerschneiden den Key-Raum und damit das Ziel „ein Token für alles". Der Weg zu zwei Instanzen mit gemeinsamer DB/Redis bleibt ausdrücklich offen und ist ein **nicht-brechender Zusatz** (zweiter Container + eigener VHost, gleiche Keys, rolling restart, Prozess-Isolation auf 2 vCPU) — Trigger: Chat-Lastspitze oder Upgrade bremst Diktat, oder #52 zwingt dem Chat-Gateway Guardrails auf, die STT nicht treffen sollen. Der Modellname ist **`whisper-large-v3`** (der Kompatibilitätsalias `large-v3` existierte nur für die Bestandsconfigs und wurde am 2026-10-29 nach der Client-Migration wieder entfernt), weil die STT-Discovery in Polished Recognition `/v1/models` auf `whisper`/`asr` filtert und sonst auf **alle** Modelle zurückfällt — dann stünden die Coding-Modelle im Diktat-Picker. Open WebUI bleibt bewusst am direkten Backend (`http://whisper:9000/v1`, Docker-Netz, ohne Token und ohne Abrechnung).
