---
type: Decision
title: "Ein Design-System, Pico wird abgelöst (Issue #35)"
description: "Ein Design-System, Pico wird abgelöst (Issue #35)"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-10-29T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-35
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/35
    title: Issue #35
---

**Ein Design-System, Pico wird abgelöst (Issue #35):** Tailwind 4 + explizite CSS-Tokens für **öffentlichen und authentifizierten Teil**; die heutige Homepage wird in React-Komponenten nachgebaut (`Button`, `Card`, `Table`, `Prose`, `PageHeader`, `Shell`). Markdown-Inhalte laufen über eine `MarkdownContent`-Component-Map, damit sie dieselben Bausteine erben wie das Portal. Radix nur für Verhalten (Dialog/Menü/Tooltip), nie für Optik. **Parität statt Neugestaltung:** Abnahme per Screenshot-Diff gegen die Live-Seite plus Checkliste für das, was Pico bisher gratis lieferte (`:focus-visible`, Tabellen-Scroll, Typo-Rhythmus, `prefers-reduced-motion`, kein Theme-Flackern). Politur nur nach ausdrücklicher Freigabe.
