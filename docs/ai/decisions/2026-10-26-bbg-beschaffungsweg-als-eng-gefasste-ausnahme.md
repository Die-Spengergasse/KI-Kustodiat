---
type: Decision
title: "BBG-Beschaffungsweg als eng gefasste Ausnahme auf der öffentlichen Angebotsseite (Issue #32)"
description: "BBG-Beschaffungsweg als eng gefasste Ausnahme auf der öffentlichen Angebotsseite (Issue #32)"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-10-26T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-32
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/32
    title: Issue #32
---

**BBG-Beschaffungsweg als eng gefasste Ausnahme auf der öffentlichen Angebotsseite (Issue #32):** Die Seite enthält einen Abschnitt „Beschaffungsweg über die BBG" — **fester, datierter Block** im Skill `update-offers`, vom Job **wortgleich** übernommen und nicht recherchiert. Inhalt ausschließlich öffentliche Fakten: Zugang (kostenfreie Grundsatzvereinbarung, 2 e-Shop-Zugänge), „Preise nur im e-Shop", PC/Workstation-Position GZ 3401.04830, SSN-Verfahrenstermine, Nachweisgrenze bei GPU. **Reasons:** (a) Beschaffbarkeit ist für Leser:innen der Angebotsseite unmittelbar relevant; (b) Automatik scheidet aus — das Vergabeportal ist eine hCaptcha-SPA, der Runner erlaubt nur **eine** geänderte Datei und hat 30 Minuten Timeout, und der Job kann die Wahrheit einer Aussage nicht verifizieren; (c) Verhandlungen, Kontakte, Preise und Beschaffungsstrategie bleiben **intern** (`KI-Kustodiat-intern:docs/extern/`). Der „Grenzen"-Absatz der Skill wurde entsprechend präzisiert statt aufgehoben.
