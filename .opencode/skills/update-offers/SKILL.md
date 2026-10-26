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
   - **BBG-Block:** Setze nach den Hardware-Tabellen den Abschnitt „Beschaffungsweg über die
     BBG" **wortgleich und vollständig** aus dem Abschnitt „BBG-Block (fest)" dieses Skills ein.
     Diesen Block **nicht recherchieren, nicht umformulieren, nicht kürzen** — er ist datiert
     und wird bei Bedarf manuell nachgezogen.
   - einen kurzen Hinweis, dass Preise Momentaufnahmen sind und vor einer Entscheidung
     beim Anbieter zu prüfen sind.
   - Abschlusszeile mit Querlinks: `Zurück zur [Startseite](#/) · [Status](status.md) · [Milestones](milestones.md)`.
   - **Nur belegte Zahlen.** Findest du etwas nicht, lasse die Zelle leer bzw. „k. A." —
     erfinde keine Preise.
   - **Ansprache: durchgehend informell (Du)** — kein „Sie/Ihre/Ihnen".

3. **Verifizieren.** Die Datei muss rendern und ihre `*.md`-Links müssen auflösbar sein
   (Prüfung wie im Skill `update-homepage`, Abschnitt Verifizieren).

## BBG-Block (fest)

Dieser Block wird **wortgleich** in die Seite übernommen. Er wird **nicht** vom Job recherchiert
und bei Änderungen (neue SSN-Verfahren, neue GZ) manuell nachgezogen. Faktenbasis: öffentliche
BBG-Daten (Vertrags-/Ausschreibungsliste, Vergabeportal), Stand 2026-10-26.

```markdown
### Beschaffungsweg über die BBG

_Stand: 2026-10-26._

| Thema | Stand |
|---|---|
| Zugang | Bundesschulen sind BBG-Abnehmerin. Die Grundsatzvereinbarung ist kostenfrei und enthält zwei e-Shop-Zugänge. |
| Preise | Katalogpreise gibt es ausschließlich im e-Shop nach Login. Öffentlich sind nur Vertrags- und Ausschreibungslisten (GZ-Nummern, Termine). |
| PCs & Workstations | „PCs & 13 Zoll 2 in 1" (GZ 3401.04830) — individuell konfigurierte PCs, Notebooks und Workstations. |
| Server | Eigene Rahmenvereinbarung „Serversysteme, Netzwerkkomponenten und Storagesysteme" (GZ 3401.03804). Neuvergabe als SSN 2026-2 (neun Hersteller-Lose, u. a. Supermicro; abrufbar ab 2026-11-20) und SSN 2026-3 (Palo Alto, Cisco; ab 2027-01-22). |
| GPU ab 256 GB | Nicht belegt. Das laufende Verfahren SSN 2026-3 hat nur zwei Lose (Palo Alto, Cisco) und nennt weder im Vertrag noch im Preisblatt eine GPU-Position; das Preisblatt von SSN 2026-2 ist nach Fristablauf nicht mehr abrufbar. |

Quellen: [Aktuelle Verträge](https://www.bbg.gv.at/information/aktuelle-vertraege) · [Aktuelle Ausschreibungen](https://www.bbg.gv.at/information/aktuelle-ausschreibungen) · [SSN 2026-3 im Vergabeportal](https://bbg.vergabeportal.at/Detail/257753)
```

## Grenzen

- **Öffentlich** ist nur diese Angebots-Übersicht. **Verhandlungen, Kontakte, Preise und
  Beschaffungsstrategie** gehören **nicht** hierher, sondern ins interne Schwester-Repo.
  Der obige BBG-Block ist die eng gefasste Ausnahme: **ausschließlich** öffentliche Fakten
  (GZ-Nummern, Verfahrenstermine, Nachweisgrenzen) — keine Preise, keine Absichten.
- Kein Commit, kein Deploy im Skill — das erledigt `scripts/run-offers-job.sh`.
