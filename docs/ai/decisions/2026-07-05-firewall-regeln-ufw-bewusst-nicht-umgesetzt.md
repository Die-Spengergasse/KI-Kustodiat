---
type: Decision
title: "Firewall-Regeln (ufw) bewusst NICHT umgesetzt — `:11435` (ollama) bleibt direkt "
description: "Firewall-Regeln (ufw) bewusst NICHT umgesetzt — `:11435` (ollama) bleibt direkt "
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-07-05T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: draft
sources:
  - id: issue-4
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/4
    title: Issue #4
---

Firewall-Regeln (ufw) bewusst NICHT umgesetzt — `:11435` (ollama) bleibt direkt erreichbar (Known Gap, Bypass um LiteLLM-Auth möglich); auf Issue #4 verschoben. `:11434` ist Container-Port → ufw kann ihn ohnehin nicht filtern.
