---
name: update-homepage
description: >-
  Baut die Übersichtsseiten der Kustodiat-Homepage (Status, Milestones) aus
  dem Repository, den Git-Milestones/Issues und den GitHub-Discussions neu.
  Nutze diesen Skill, wenn es heißt „update homepage", „Homepage aktualisieren",
  „Status/Milestones neu bauen", „Übersichtsseiten aktualisieren",
  "Seiten der Website aus dem Repo erzeugen".
license: MIT
compatibility: opencode
metadata:
  category: workflow
  scope: website
---

# Skill: update-homepage

Erzeugt die Übersichtsseiten der Website unter `website/content/` aus den aktuellen
Projektquellen. Der Skill schreibt **nur generierte Seiten** — die handgeschriebene
`openwebui-anleitung.md` und die Startseite bleiben unangetastet.

## Generierte Seiten (Ziel)

| Datei | Quelle |
|---|---|
| `website/content/status.md` | `docs/ai/STATE.md`, `docs/ai/HANDOFF.md` |
| `website/content/milestones.md` | `gh api repos/$R/milestones` + zugeordnete Issues |
| `website/content/faq.md` | **nur anlegen, wenn fehlend** — nie füllen (bleibt leer, bis echte Fragen kommen) |

Nicht anfassen: `website/content/openwebui-anleitung.md`, `website/index.html`,
`website/app.js`, `website/vendor/`, `website/assets/`.

## Ablauf

1. **Frische Quellen.** Im Repository-Wurzelverzeichnis:
   ```bash
   git pull --ff-only
   R=$(gh repo view --json nameWithOwner -q .nameWithOwner)
   ```
   Ist der Pull nicht möglich (lokale Änderungen), zuerst klären statt zu überschreiben.

2. **Quellen lesen.**
   - `docs/ai/STATE.md` → was läuft, was fehlt, nächste Schritte.
   - `docs/ai/HANDOFF.md` → gerade Abgeschlossenes, offene Punkte.
   - `docs/ai/DECISIONS.md` → Phasen-/Richtungsentscheidungen.
   - `gh issue list --state open --limit 100` → offene Tickets.
   - `gh api repos/$R/milestones --jq '.[] | {title,description,open_issues,closed_issues}'` → Meilensteine.
   - `gh api repos/$R/milestones/<nr>/issues --jq '.[].number'` → Tickets je Meilenstein.
   - Discussions: `gh api graphql -f query='{repository(owner:"…",name:"…"){discussions(first:20){nodes{number,title,url}}}}'`.

3. **Seiten schreiben.** In den bestehenden Ton und die Struktur der Dateien
   hineinschreiben (Zusammenfassungen auf Deutsch, angenehm lesbar, kurz).
   **Ansprache: durchgehend informell (Du)** — kein „Sie/Ihre/Ihnen".
   - **Status:** „Stand: <heutiges Datum>", Kurzfassung, *Was schon läuft*,
     *Was noch fehlt/eingeschränkt ist*, *Nächste Schritte*.
   - **Milestones:** je Milestone Kurztext + Links auf die beteiligten Issues
     (`https://github.com/$R/issues/<n>`); erreichte Milestones mit ✅.
   - Alle Seiten mit Querlinks (`[Status](status.md)`, `[Milestones](milestones.md)` …)
     und dem „Zurück zur Startseite"-Fußzeilenblock abschließen.

4. **Verifizieren** (Pflicht, bricht bei Fehler ab). Stellt sicher, dass jede
   Markdown-Datei rendert und **jeder `*.md`-Link** auf eine existierende Seite zeigt:
   ```bash
   cd website && node -e '
     const fs=require("fs"),p=require("path");const m=require("./vendor/marked.umd.js");const marked=m.marked||m.parse||m;
     const PAGES=[...fs.readFileSync("app.js","utf8").match(/var PAGES = \{([\s\S]*?)\};/)[1].matchAll(/\x27([^\x27]+)\x27:/g)].map(x=>x[1]);
     let bad=0;
     for(const f of fs.readdirSync("content").filter(x=>x.endsWith(".md"))){
       const html=marked.parse(fs.readFileSync("content/"+f,"utf8"));
       for(const h of [...html.matchAll(/href="([^"]*\.md)"/g)].map(x=>x[1])){
         const s=h.replace(/^\.?\/*/,"").replace(/\.md$/,"");
         if(!PAGES.includes(s)||!fs.existsSync("content/"+s+".md")){console.log("BROKEN LINK",f,"->",h);bad++;}
       }
     }
     process.exit(bad?1:0);'
   ```

5. **Abschließen.** Commit und Push der geänderten `website/content/*.md`,
   Commit-Message mit Issue-Verweis (`… (#<issue>)`). Danach den Deploy anstoßen
   (siehe unten) oder dem Menschen nennen.

## Deploy

Die Website wird **nicht** über GitHub Pages, sondern aus dem Schulserver bedient:
```bash
rsync -a --delete --exclude='*.rsync' website/ kik:/var/www/kik/
```
(`kik` ist die Management-VM; Docroot laut `infra/nginx/sites-available/kik.spengergasse.at`.)

## Neue Seite ergänzen

Soll eine weitere Markdown-Seite dazukommen: Datei `website/content/<slug>.md`
anlegen **und** den Slug in `PAGES` in `website/app.js` eintragen, sonst liefert die
Route „Seite nicht gefunden".
