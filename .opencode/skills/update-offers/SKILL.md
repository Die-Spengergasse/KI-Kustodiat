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
   - **Hardware-Optionen** für eigene Inferenz, in zwei Stufen — nur **turnkey**
     (fertig montiert vom Hersteller/OEM geliefert, Linux-supportet; „vom Regal
     nehmen, aufstellen, Linux installieren, läuft"):
     - **Kompaktklasse** (bis ca. 192 GB): AMD Strix Halo (turnkey-Mini-PCs),
       NVIDIA DGX Spark, Apple Mac Studio (Unified Memory).
     - **Regal-/Server-Klasse ab 256 GB** (ausdrücklich gewünscht): Systeme mit
       **256 GB, 512 GB und ≥ 1 TB** GPU-/Unified-Speicher, Desk-Side **und** Rack.
       Pflicht-Stichworte/Vendoren: NVIDIA DGX Station (GB300), DGX B200/B300,
       „NVIDIA RTX PRO Server" (8× RTX PRO 6000), Dell PowerEdge XE9680/XE9685,
       Supermicro SYS-422GA & 8-GPU-HGX, HPE ProLiant/GX, Lenovo ThinkSystem
       SR675/SR685, GIGABYTE G593, Lambda, Apple Mac Studio M5 Ultra (256/512 GB).
       Je Eintrag **Speicherklasse** (256 / 512 / ≥ 1024 GB) und **Bauform**
       (Desk-Side / Rack) angeben; benennen, dass ≥ 1 TB praktisch nur als
       8-GPU-Rack turnkey ist.
     **Ausgeschlossen:** DIY-Bausätze (z. B. Framework Desktop im Bausatz),
     Eigenbau aus Einzel-GPUs, Gebraucht-GPU-Selbstbau, sonstige Bastellösungen.
   Für die Schul-/Datenschutz-Perspektive relevant: **EU-Anbieter mit DPA** (z. B. Cortecs, Wien).

   Ziel sind **Angebote und Preise**, nicht technische Details der Anbieter.

   **Anspruch an die Zahlen:** Für jeden gelisteten Anbieter soll **mindestens eine konkrete
   Zahl** stehen (Preis pro 1 Mio. Input-/Output-Token für das Flaggschiff-Modell). Dafür auch
   offizielle Preisseiten direkt abrufen und die Preise aus dem HTML ziehen; ist eine Seite
   nicht maschinell auslesbar, die in den Suchergebnissen zitierten Preise übernehmen und mit
   „laut Suchergebnis" kennzeichnen. „k. A." ist der Notnagel, nicht der Normalfall.

   **Enterprise-/Server-Hardware:** „Preis auf Anfrage" ist hier häufig. Zulässig **nur**,
   wenn zusätzlich eine konkrete Zahl steht (OEM-/Distributor-Listenpreis oder belegter
   Preisrahmen). Schätzungen als „Industrie-Schätzung"/„laut Distributor" kennzeichnen und
   zwei Quellen nennen. Ohne belegte Zahl: nicht aufnehmen.

   **Quellen:** offizielle Anbieter-/Hersteller-Seiten oder etablierte Händler. Als **alleinige**
   Quelle keine SEO-Blogs/Aggregatoren. Wenn Zahlen aus zweiter Hand kommen, das dazuschreiben;
   ist der Stand unklar, „Stand unklar" statt eines geratenen Datums. Die verlinkte Quelle muss
   die genannte Zahl **tatsächlich belegen** (nicht irgendeine Preis-Seite desselben Anbieters).

   **Relevanzfilter:** Zielgruppe ist eine **österreichische HTL**. Nur Angebote aufnehmen, die
   für AT/EU nutzbar sind; US-spezifische Bildungsprogramme weglassen (oder ausdrücklich als
   „nicht für AT" kennzeichnen). EU-Anbieter mit DPA sind besonders relevant.

2. **Datei schreiben.** Schreibe `website/content/angebote.md` mit:
   - H1 `# Angebote` und eine Zeile **`_Aktualisiert: <ISO-Datum>._`**
   - je Abschnitt eine Markdown-**Tabelle**: `Anbieter | Angebot | Preis | Stand | Quelle`
     (Quelle als Link). Eine Tabelle pro Kategorie (Token-Preise, Gratis/Bildung).
   - **Hardware in zwei Tabellen:** Kompaktklasse (wie oben) **und** „Regal-/Server-Klasse"
     mit den Spalten `Anbieter | System | Speicher | Bauform | Preis | Stand | Quelle`.
   - **Keine Alteinträge:** Erzeuge die Seite bei jedem Lauf vollständig neu und übernimm
     **keine** Einträge früherer Läufe. Entferne alles, was den aktuellen Regeln nicht mehr
     entspricht (Gebraucht-GPUs, DIY-/Bausatz-Lösungen, abgekündigte Modelle). Die Seite
     zeigt ausschließlich, was die heutige Recherche belegt.
   - einen kurzen Hinweis, dass Preise Momentaufnahmen sind und vor einer Entscheidung
     beim Anbieter zu prüfen sind.
   - Abschlusszeile mit Querlinks: `Zurück zur [Startseite](#/) · [Status](status.md) · [Milestones](milestones.md)`.
   - **Nur belegte Zahlen.** Findest du etwas nicht, lasse die Zelle leer bzw. „k. A." —
     erfinde keine Preise.
   - **Ansprache: durchgehend informell (Du)** — kein „Sie/Ihre/Ihnen".

3. **Verifizieren.** Die Datei muss rendern und ihre `*.md`-Links müssen auflösbar sein
   (Prüfung wie im Skill `update-homepage`, Abschnitt Verifizieren).

## Grenzen

- **Öffentlich** ist nur diese Angebots-Übersicht. Beschaffungs-/BBG-Vorgänge, Verhandlungen
  und Kontakte gehören **nicht** hierher, sondern ins interne Schwester-Repo.
- Kein Commit, kein Deploy im Skill — das erledigt `scripts/run-offers-job.sh`.
