# Persistence Log

## 2026-11-20
* **New**: [decisions/2026-11-20-admin-aufladung-additive-gutschrift.md](decisions/2026-11-20-admin-aufladung-additive-gutschrift.md) — Admin-Aufladung ist `max_budget += X` über `/user/update`, verbucht in `portal.credit_grant`, kein Spend-Reset; API unter `/api/credit`, weil nginx `/api/admin*` blockt (#64).
* **Update**: [pitfalls/litellm-gateway.md](pitfalls/litellm-gateway.md) — „Die Admin-GUI schreibt denselben Weg, nicht daneben": `updateUserBudget` ohne `budget_duration`, Ledger mit `resets_at`, 409/502-Verhalten, `/api/credit` statt `/api/admin` (#64).
* **Update**: [pitfalls/whisper-stt.md](pitfalls/whisper-stt.md) — Entsperren primär über `/tokens/admin`, Curl-Runbook nur noch Notfall (#64).
* **Update**: [index.md](index.md) — Concept-Zähler `decisions/` von 53 auf 54.
* **Update**: [pitfalls/whisper-stt.md](pitfalls/whisper-stt.md) — „Ein erschöpftes Monatsbudget sperrt den ganzen Account, nicht nur das Diktat": belegter Fall `grafg` (5,0006 $ / 5 $ → 429 auf allen Keys bis `budget_reset_at`) plus SDK-Retry-Loop als Lastquelle (#49).
* **Update**: [pitfalls/litellm-gateway.md](pitfalls/litellm-gateway.md) — „Budget nur über die Admin-API, nie per SQL": warmer Cross-Pod-Zähler `spend:user:<id>` in Redis, Invalidation durch `/user/update`, Reconcile-Vorbehalt aus #49.
* **Update**: [index.md](index.md) — Concept-Zähler `decisions/` von 52 auf 53 nachgezogen (Eintrag 2026-11-13 kam nach der letzten Regenerierung).

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
