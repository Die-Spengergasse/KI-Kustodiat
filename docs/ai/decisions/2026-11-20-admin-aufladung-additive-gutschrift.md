---
type: Decision
title: "Admin-Aufladung: additive max_budget-Gutschrift mit Ledger, kein Spend-Reset (Issue #64)"
description: "Wie das Guthaben eines Kontos über die GUI erhöht wird, warum es dafür einen Ledger braucht und warum spend nie zurückgesetzt wird."
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-11-20T14:10:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-20T14:10:00Z }
status: stable
sources:
  - id: issue-64
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/64
    title: "feat(portal): admin credit top-up GUI"
  - id: issue-49
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/49
    title: "feat(portal): quota policy, requests, reconciliation"
---

**Admin-Aufladung ist `max_budget += X` über die LiteLLM-Admin-API, verbucht als einmalige Gutschrift in `portal.credit_grant`; `spend` wird nie zurückgesetzt (Issue #64):** Das Gateway hat kein Guthabenkonto — durchgesetzt wird `max_budget` minus `spend`, und `spend` nullt der monatliche `reset_budget_job` bei `budget_reset_at`. Die GUI (`/tokens/admin`, Rolle `admin` aus `portal.users.role`) bietet deshalb genau eine Operation: das Monatskontingent erhöhen. `spend`, `budget_reset_at` und `budget_duration` bleiben unangetastet; weil `updateUserBudget` kein `budget_duration` sendet, verschiebt sich der Monatswechsel nicht, und ein an `ExceededBudget` hängendes Konto (Fall `grafg`, 2026-11-20) ist danach wieder offen. Jede Erhöhung landet mit Betrag, neuem Kontingent, `resets_at` (= `budget_reset_at` zum Zeitpunkt), Notiz und Admin in `portal.credit_grant`: ohne diesen Ledger wäre die Erhöhung eine stille Dauererhöhung, mit ihm ist sie eine Gutschrift **für diese Periode**, die der Reconcile aus #49 auf die Rollen-Policy zurücknehmen kann. Ein „Guthaben zurücksetzen"-Knopf (`spend: 0`) ist bewusst nicht Teil der Oberfläche — er würde zwischen zwei Monaten neu starten, die Gutschrift unsichtbar machen und die Kostenwahrheit verzerren. Konten ohne `max_budget` (noch kein API-Key) sind nicht aufladbar (**409**), und ein fehlgeschlagener Ledger-Insert rollt die Erhöhung best effort zurück (**502**), damit keine unverbuchte Gutschrift entsteht. Der API-Pfad heißt `/api/credit`, nicht `/api/admin` — nginx blockt `/api/admin*` bewusst mit 403.
