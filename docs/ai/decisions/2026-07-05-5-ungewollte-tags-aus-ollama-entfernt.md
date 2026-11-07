---
type: Decision
title: "5 ungewollte Tags aus ollama entfernt + Blobs inventarisiert"
description: "5 ungewollte Tags aus ollama entfernt + Blobs inventarisiert"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-07-05T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-2
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/2
    title: Issue #2
  - id: issue-5
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/5
    title: Issue #5
  - id: issue-7
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/7
    title: Issue #7
---

**5 ungewollte Tags aus ollama entfernt + Blobs inventarisiert** (Session 2; revidiert den „Blob bleibt in ollama"-Teil des ursprünglichen Plans): `ollama rm gemma4:{e2b,e4b,e4b-it-qat,12b,12b-it-qat}`, aber ZUERST die 11 zu den Tags uniqueen Blobs (~22,6 GiB; shared Weight-Blobs überleben via der behaltenen `-128k`-Tags) + 5 Manifeste nach `/opt/litellm/blob-inventory/` (NICHT git; README + tag-digest-map.json mit Restore-Anleitung) kopiert und sha256-verifiziert. Grund: die Tags mussten aus ollama raus, sonst tauchen sie (falls ein Key sie erlaubt) weiter im Picker auf. Restore bei >8 GB-HW (Issues #2/#5/#7): Blobs+Manifeste zurückkopieren + `systemctl restart ollama`.
