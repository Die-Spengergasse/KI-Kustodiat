---
type: Decision
title: "Angebotsseite zeigt Speicherbandbreite und Parallelität je Hardware (Issue #62)"
description: "Hardware-Tabellen auf #/angebote führen die Speicherbandbreite als Spalte und erklären in einem festen Block, was Parallelität begrenzt."
tags: [ki-kustodiat, decisions, website, hardware]
generated: { by: opencode/knowledge-persistence, at: 2026-11-13T09:20:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-13T09:20:00Z }
status: stable
sources:
  - id: issue-62
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/62
    title: "web: Angebotsseite zeigt Speicherbandbreite und Parallelität je Hardware"
---

**Angebotsseite zeigt Speicherbandbreite und Parallelität je Hardware (Issue #62):** Beide
Hardware-Tabellen auf `#/angebote` führen eine Spalte `Bandbreite` (Kompaktklasse:
`Speicher | Bandbreite | Preis`; Regal-/Server-Klasse: `Speicher | Bandbreite | Bauform |
Preis`), darunter je eine aus den Zellenwerten abgeleitete Zeile mit höchster und niedrigster
Bandbreite, danach der feste Block „Was Parallelität begrenzt". Die Änderung liegt im
**Generator** (`.opencode/skills/update-offers/SKILL.md`), nicht in der Markdown-Datei: die
Seite wird wöchentlich vollständig neu erzeugt, manuelle Edits überleben den nächsten Lauf
nicht. Reasons: (a) die Beschaffungsfrage lautet nicht „wie viel Speicher", sondern „wie
viele gleichzeitige Sessions trägt das System" — und das entscheidet die Speicherbandbreite,
weil pro Token das Modell einmal durch den Speicher gelesen wird und alle Sessions sich
diesen Topf teilen; (b) die Zahl stand längst in `DOMAIN.md`, fehlte aber genau dort, wo
entschieden wird; (c) ein fester, datierter Block verhindert, dass der Job die Mechanik jede
Woche neu formuliert oder Zahlen erfindet. Considered: Bandbreite nur in `DOMAIN.md` lassen —
verworfen, weil die Seite die öffentliche Entscheidungsgrundlage ist; freie Formulierung durch
den Job — verworfen, weil die Mechanik zeitlos ist und nur die Zellenwerte sich ändern.
Tradeoff: die Bandbreite der AMD-Strix-Halo-Systeme ist aus Busbreite (256 Bit) und
Speicherdatenrate gerechnet (256 GB/s bei LPDDR5X-8000, 273 GB/s bei -8533), weil die
Herstellerseiten die Zahl nicht immer explizit nennen; das steht als Rechenweg auf der Seite.
Nebenbefund, separat offen: `docs/Recherche/on-premise-vs-api-kalkulation.md` nennt
„70B Q4, 32 tok/s" — bei 40 GB pro Token bräuchte das ~1,3 TB/s, realistisch sind auf
256 GB/s ~6 tok/s.
