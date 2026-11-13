# Persistence Log

## 2026-11-13
* **Update**: [pitfalls/tooling-git-ops.md](pitfalls/tooling-git-ops.md) — „Agent-Job ohne Artefakt-Gate endet mit `rc=0` ohne Ergebnis": `git diff --quiet` ist kein Erfolgsnachweis, Schreibvorgang per `stat -c %y` prüfen (#63).
* **Update**: [HANDOFF.md](HANDOFF.md) — Punkt 0g (Durchsatz-Angabe) erledigt und aus den offenen Aufgaben entfernt; [STATE.md](STATE.md) Fokus auf #63; [state/completed-2026.md](state/completed-2026.md) ergänzt.
* **Creation**: [decisions/2026-11-13-angebotsseite-zeigt-bandbreite-und-parallelitaet.md](decisions/2026-11-13-angebotsseite-zeigt-bandbreite-und-parallelitaet.md) — Bandbreiten-Spalte und fester Parallelitäts-Block liegen im Generator (`.opencode/skills/update-offers/SKILL.md`), nicht in der wöchentlich neu erzeugten Seite (#62).
* **Update**: [DOMAIN.md](DOMAIN.md) — Hardware-Tabelle von 2026-06-24 (Strix Halo 96 GB, M4 Pro, M3 Ultra, 4× Mac Mini) auf den Stand der Angebotsseite 2026-11-13 gezogen (PRO 495, EVO-X3, MS-S1 Max, DGX Spark, M5 Max, M5 Ultra) plus Parallelitäts-Regel; `generated`/`verified` gebumpt.
* **Update**: [decisions/index.md](decisions/index.md), [DECISIONS.md](DECISIONS.md) (Datums-Link), [state/completed-2026.md](state/completed-2026.md) (Abschluss-Eintrag).

## 2026-11-07
* **Creation**: [tips/](tips/index.md) — [TIPS.md](TIPS.md) in 6 Themen-Buckets gruppiert (317 Zeilen wortgleich, Schnitt an Abschnittsgrenzen); TIPS.md ist jetzt Overview (#61).
* **Creation**: [state/completed-2026.md](state/completed-2026.md) — 85 Completed-Bullets unverändert aus [STATE.md](STATE.md) ausgelagert; STATE bleibt narrativ (Focus/Pending/Blockers/Next) und verweist aufs Archiv (Stufe 2, Phase 3, #60).
* **Creation**: [pitfalls/](pitfalls/index.md) — 95 Fallstricke in 10 Themen-Buckets verteilt (Bullets wortgleich); [PITFALLS.md](PITFALLS.md) ist jetzt Overview (Stufe 2, Phase 2, #60).
* **Creation**: [decisions/](decisions/index.md) — 52 Entscheidungen als je eigenes Concept (`type: Decision`, Datum-Slug, Issue-Sources); [DECISIONS.md](DECISIONS.md) ist jetzt Overview mit Datums-Links, „In Evaluierung" bleibt dort (Stufe 2, Phase 1, #60).
* **Update**: Migration aller 9 Concept-Files auf OKF v0.2 (Frontmatter-Envelope je Datei; Body unverändert).
* **Creation**: Established [log.md](log.md) und [index.md](index.md) als OKF-reservierte Filenames.
* **Update**: Persistence-Run nach der Umstellung — [STATE.md](STATE.md), [DECISIONS.md](DECISIONS.md) (2 Einträge), [CONVENTIONS.md](CONVENTIONS.md) (Section „Wissensbasis"), [PITFALLS.md](PITFALLS.md) (2 Einträge), [ARCHITECTURE.md](ARCHITECTURE.md) (Knowledge-Tabelle), [HANDOFF.md](HANDOFF.md); [index.md](index.md) regeneriert (Inhalt unverändert gültig).
* **Update**: [CONVENTIONS.md](CONVENTIONS.md) — Split-Kriterien und weiche Größenmarke für die Wissensbank verankert (opencode-helpers#129, Issue #59).
