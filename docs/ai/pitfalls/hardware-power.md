---
type: Pitfalls
title: "Pitfalls — Hardware und Stromversorgung"
description: "Stromanschlüsse, Adapter und Netzteil-Alterung."
tags: [ki-kustodiat, pitfalls, hardware-power]
generated: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
---

# Hardware und Stromversorgung — Pitfalls

- **6+2-Pin ist ein 8-Pin**: Die 2-Pin-Sektion wird auf den 6-Pin aufgesteckt – das ist der bestimmte, sichere 8-Pin-PCIe-Anschluss. Kein Adapter nötig, kein „Hack".
- **Keine Y-Splitter von einem PSU-Anschluss auf zwei Kartensockel**: Überlastet die einzelne Leitung → Schmelz-/Brandgefahr. Lieber beide separaten PCIe-Stränge des Netzteils nutzen (je einen pro Sockel).
- **PCIe- vs. EPS/CPU-6→8-Adapter**: Pinout unterschiedlich. EPS-Adapter in eine GPU gesteckt = Karte zerstört. Nur PCIe-Adapter verwenden.
- **Netzteil-Alterung**: VX550W (CMPSU-550VX, ~2008) – Kondensatoralterung, fehlende moderne Schutzschaltungen. Für unattended-Betrieb langfristig austauschen.
