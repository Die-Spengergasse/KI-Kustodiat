---
type: Decision
title: "Requests aus einer View, Kontingent in USD intern / Prozent + Tokens in der Anzeige (Issue #35)"
description: "Requests aus einer View, Kontingent in USD intern / Prozent + Tokens in der Anzeige (Issue #35)"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-10-29T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-35
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/35
    title: Issue #35
---

**Requests aus einer View, Kontingent in USD intern / Prozent + Tokens in der Anzeige (Issue #35):** Verbrauchsdaten kommen read-only aus dem `litellm`-Schema (Views auf `LiteLLM_SpendLogs`/`LiteLLM_DailyUserSpend`) hinter einer Repository-Schicht — keine eigene Request-Tabelle (Split-Brain-Regel). LiteLLM bleibt die einzige Wahrheit für Budgets (Monatsbudget am **User**, `budget_duration: 1mo`, `timezone: Europe/Vienna`). SuS/Lehrkräfte sehen **Prozent des Monatskontingents plus Tokens**, keine Pseudo-Währung und keinen USD-Betrag im Vordergrund.
