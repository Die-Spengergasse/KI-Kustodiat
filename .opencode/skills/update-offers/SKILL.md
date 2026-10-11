---
name: update-offers
description: >-
  Erzeugt die Angebots-Übersicht auf der Kustodiat-Homepage (Route #/angebote) per
  Websuche neu: Token-Preise, Gratis-/Bildungsangebote bei KI-Anbietern und
  Hardware-Optionen. Nutze diesen Skill, wenn es heißt „update offers",
  „Angebote aktualisieren", „Preise/Angebote recherchieren", „Angebotsseite neu bauen".
license: MIT
compatibility: opencode
metadata:
  category: workflow
  scope: website
---

# Skill: update-offers

Recherchiert den Markt und schreibt die Übersicht nach `website/content/angebote.md`.
Nur diese eine Datei wird geschrieben — nicht committen (das macht der Runner) und keine
anderen Seiten anfassen.

## Ablauf

1. **Recherche.** Führe **mehrere** Websuchen durch (Metasuche). Decke ab:
   - **Token-Preise** wichtiger Anbieter (z. B. OpenAI, Anthropic, Google, Mistral, Groq,
     OpenRouter, xAI, EU-Anbieter wie Cortecs) — grobe Preisklasse pro Million Token.
   - **Gratis-/Bildungsangebote** (Free Tiers, Education-Rabatte, Kontingente).
   - **Hardware-Optionen** für eigene Inferenz (z. B. AMD Strix Halo 128/256 GB,
     DGX Spark, Gebraucht-GPUs) mit grober Preisspanne.
   Für die Schul-/Datenschutz-Perspektive relevant: **EU-Anbieter mit DPA** (z. B. Cortecs, Wien).

   Ziel sind **Angebote und Preise**, nicht technische Details der Anbieter.

   **Anspruch an die Zahlen:** Für jeden gelisteten Anbieter soll **mindestens eine konkrete
   Zahl** stehen (Preis pro 1 Mio. Input-/Output-Token für das Flaggschiff-Modell). Dafür auch
   offizielle Preisseiten direkt abrufen und die Preise aus dem HTML ziehen; ist eine Seite
   nicht maschinell auslesbar, die in den Suchergebnissen zitierten Preise übernehmen und mit
   „laut Suchergebnis" kennzeichnen. „k. A." ist der Notnagel, nicht der Normalfall.

   **Quellen:** offizielle Anbieter-/Hersteller-Seiten oder etablierte Händler. Als **alleinige**
   Quelle keine SEO-Blogs/Aggregatoren. Wenn Zahlen aus zweiter Hand kommen, das dazuschreiben;
   ist der Stand unklar, „Stand unklar" statt eines geratenen Datums.

2. **Datei schreiben.** Schreibe `website/content/angebote.md` mit:
   - H1 `# Angebote` und eine Zeile **`_Aktualisiert: <ISO-Datum>._`**
   - je Abschnitt eine Markdown-**Tabelle**: `Anbieter | Angebot | Preis | Stand | Quelle`
     (Quelle als Link). Eine Tabelle pro Kategorie (Token-Preise, Gratis/Bildung, Hardware).
   - einen kurzen Hinweis, dass Preise Momentaufnahmen sind und vor einer Entscheidung
     beim Anbieter zu prüfen sind.
   - Abschlusszeile mit Querlinks: `Zurück zur [Startseite](#/) · [Plan](plan.md) · [Milestones](milestones.md)`.
   - **Nur belegte Zahlen.** Findest du etwas nicht, lasse die Zelle leer bzw. „k. A." —
     erfinde keine Preise.

3. **Verifizieren.** Die Datei muss rendern und ihre `*.md`-Links müssen auflösbar sein
   (Prüfung wie im Skill `update-homepage`, Abschnitt Verifizieren).

## Grenzen

- **Öffentlich** ist nur diese Angebots-Übersicht. Beschaffungs-/BBG-Vorgänge, Verhandlungen
  und Kontakte gehören **nicht** hierher, sondern ins interne Schwester-Repo.
- Kein Commit, kein Deploy im Skill — das erledigt `scripts/run-offers-job.sh`.
