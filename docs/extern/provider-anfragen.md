# Provider-Anfragen — E-Mail-Drafts & Recherche (Issue #34)

> **Status:** Sammlung → Entwürfe. Georg überarbeitet vor Versand gründlich.
> **Priorität:** Sammel-Mail an die *vielen* Adressaten (OCRE/BBG/Provider).
> Cortecs ist ein separater, kurzer Nachtrag (siehe unten).

## Recherche-Links

- **Exoscale — Concrete AI, Dedicated Inference** (Quick-Start):
  <https://community.exoscale.com/product/concrete_ai/dedicated_inference/quick-start/>
- **OCRE-2024-Framework gestartet** (GEANT, News):
  <https://clouds.geant.org/news/ocre-2024-framework-officially-starts-empowering-european-research-and-education-with-extensive-cloud-service-offering/>
- **OCRE-2024-Katalog** (welche Provider/Services überhaupt Call-Off-fähig sind):
  <https://clouds.geant.org/ocre-2024-catalogue/>
- **GEANT-Ressourcen** (Übersicht):
  <https://clouds.geant.org/resources/>
- **Bechtle — Digitale Souveränität / OCRE / Azure**:
  <https://www.bechtle.com/public-sector/digitale-souveraenitaet/ocre/azure>
- **ACOnet — OCRE-2024 für österreichische Teilnehmerorganisationen**:
  <https://www.aco.net/ocre-2024.html>

## Adressaten (Kurzliste)

- OCRE-Provider aus dem Katalog (konkrete Selektion — aus OCRE-Katalog ermitteln)
- **BBG** (Bundesbeschaffung GmbH) — bestehende Katalogpositionen / Aufnahme
- **Exoscale** (Concrete AI / Dedicated Inference)
- **Cortecs** — bestehender Kontakt, `enterprise@cortecs.ai` (separater kurzer Nachtrag)
- Ergebnis erweiterter Websuche — offen

---

## Priorität: Sammel-Mail an die vielen Adressaten

> Ein Draft für alle Anbieter/Rahmenvertragsstellen, die kein bestehendes
> Kundenverhältnis mit uns haben. Vor Versand: Adressaten selektieren,
> Personalisierung (Anrede + 1 Satz je Firma), Georg überarbeitet gründlich.

**Betreff:** Anfrage Bildungseinrichtung — LLM-API-Kostenvoranschlag & Kooperation (HTL Spengergasse)

Sehr geehrtes Team,

die HTL Spengergasse (Wien, ~2.600 Schüler:innen, ~280 Lehrkräfte, 97 Klassen)
baut eine schuleigene, hybride LLM-Infrastruktur auf: on-premise Backend plus
API-Zukauf bei EU-souveränen Providern. Wir suchen Anbieter, die öffentliche
Bildungseinrichtungen mit LLM-API-Dienstleistungen versorgen können —
bevorzugt im Rahmen bestehender öffentlicher Beschaffungswege (OCRE/GEANT
Call-Off via ACOnet, BBG-Katalog, oder direkt).

Uns interessieren folgende Punkte:

1. **Bildungs-/Schul-Rabatt** — gibt es gesondertes Pricing für öffentliche,
   nicht-kommerzielle Bildungseinrichtungen (HTL, Bundesschule)?
2. **Modellangebot & Preise** — LLM-API pro Mio. Tokens (Input/Output),
   idealerweise inkl. europäischer und Open-Weight-Modelle.
3. **Datenschutz** — DPA/Auftragsverarbeitung, Serverstandort EU, keine
   Trainingsnutzung der Kunden Daten, Aufbewahrungsfristen / Zero-Retention.
4. **Beschaffungsweg** — ist Ihre Dienstleistung über OCRE-2024 (GEANT,
   Call-Off via ACOnet) bzw. BBG-Katalog beziehbar? Falls nicht: wegweisender
   Standard-Vertragsweg für eine öffentliche Schule?
5. **Volumen** — grobe Schätzung mittleres Szenario: ~325 Mio. Output-Tokens/
   Monat bei 30 % aktiven Schüler:innen; Worst-Case-Skalierung Richtung
   ~2,2 Mrd./Monat. Bitte einen Preisvorschlag für beide Größenordnungen.
6. **Technische Anbindung** — OpenAI-kompatible API (Routing über LiteLLM),
   Virtual Keys / Rate-Limits pro Gruppe wünschenswert.
7. **Pilot** — Möglichkeit eines begrenzten Testzeitraums (z. B. 1–2 Klassen,
   30 Tage) vor einer Budgetforderung an die Schulaufsicht.

Ein Projektüberblick: <https://kik.spengergasse.at>

Wir freuen uns auf Ihr Angebot bzw. einen kurzen Erstkontakt.

Mit freundlichen Grüßen
Georg Graf
HTL Spengergasse, Spengergasse 20, 1050 Wien

### OCRE/BBG-spezifische Ergänzung (in die Sammel-Mail bei diesen Adressaten)

> Diese beiden Punkte zusätzlich in die Mail bei Rahmenvertragsstellen:

- Können österreichische Bildungseinrichtungen (Schulträger: Stadt Wien bzw.
  BM für Bildung) direkt aus dem OCRE-2024-Rahmenvertrag Call-Offs tätigen,
  oder läuft der Zugang über Teilnehmerorganisationen (z. B. ACOnet/Universitäten)?
- Welche LLM-/Inference-Dienste sind konkret im OCRE-2024-Katalog gelistet,
  und zu welchen Konditionen (Preisbänder, Kombinationen mit Education-Rabatten)?

---

## Cortecs — Extra-Paragraph (zufriedener Kunde)

> Cortecs-Anfrage ist ein kurzer Nachtrag auf Basis des bestehenden, positiven
> Kundenverhältnisses — kein vollständiger Pitch nötig. Georg baut die finale
> Mail manuell zusammen (alter Draft unten als Referenz + dieser Paragraph):

Sehr geehrtes Cortecs-Team,

wir sind bereits zufriedener Kunde und nutzen Cortecs-Modelle produktiv in
unserer schuleigenen KI-Infrastruktur (LiteLLM-Routing, Open WebUI, Anmeldung
über das Schul-AD). Die Zusammenarbeit läuft zuverlässig und datenschutzseitig
unproblematisch. Mit der Ausweitung auf den regulären Schulbetrieb (alle
Klassen, Lehrkräfte und Verwaltung) ergeben sich für uns nun eine
handvoll konkrete Punkte — siehe unten.

*(Rest des Mail-Texts: Georg setzt manuell die relevanten Punkte aus dem
Referenz-Draft zusammen.)*

---

## Cortecs — vollständiger Einzel-Draft (Referenz, 2026-08-13)

> Nur noch als Referenz/Zulieferung für die finale Mail; die Punkte unten
> stammen aus der ursprünglichen Einzelanfrage.

Betreff: Anfrage Bildungseinrichtung — LLM-API für HTL Spengergasse

Die HTL Spengergasse (Wien, ~2.600 Schüler, 280 Lehrer, 97 Klassen) baut
aktuell eine hybride LLM-Infrastruktur auf (On-Premise + API) und evaluiert
EU-souveräne Provider als Alternative zu direkten China-basierten APIs
(DeepSeek, SiliconFlow).

Cortecs ist aufgrund der EU-native-Cloud-Infrastruktur, ISO 27001-Zertifizierung
und DSGVO-by-default für uns ein bevorzugter Kandidat. Details zur Evaluation
finden Sie unter `docs/extern/cortecs-provider-evaluation.md` (ggf. auf Anfrage).

1. **Bildungs-/Schul-Rabatt** — spezielles Pricing für öffentliche
   Bildungseinrichtungen (HTL, nicht kommerziell, Bundesschule)?
2. **Modellangebot und Preise** — pro Mio Tokens (Input/Output):
   DeepSeek V4 Flash, GLM-5.2, Qwen 3.6; optional Claude Opus 4.8, GPT-5.6.
3. **DPA und Auftragsverarbeitung** — DPA-Dokument für Unterzeichnung seitens
   der Schule / des Schulträgers (BM für Bildung).
4. **Datenlöschung und Aufbewahrung** — Standard-Aufbewahrungsfristen für
   API-Inputs/Outputs? Zero-Data-Retention möglich?
5. **Volumen-Kalkulation** — ~325 Mio Output-Tokens/Monat (mittleres Szenario,
   30 % aktive Schüler), Worst-Case ~2,2 Mrd/Monat.
   Details: `docs/extern/on-premise-vs-api-kalkulation.md`.
6. **Auth-Integration** — LiteLLM-kompatibles Routing (OpenAI-API-Format)?
   Virtual-Keys / Rate-Limits pro Schülergruppe möglich?
7. **Test-Phase** — 30-tägiger Pilot-Zugang für 1–2 Klassen?
8. **Rechnungsstellung** — auf österreichische öffentliche Schule?
   (UID-pflichtig, Rechnungsadresse: HTL Spengergasse, 1050 Wien)

---

## Verwendungs-Hinweis

Vor Versand je Adressat:
- [ ] Adressaten-Selektion finalisieren (OCRE-Katalog, BBG-Katalog, Websuche)
- [ ] Anrede + persönlicher Einstiegssatz je Firma
- [ ] Aktuelle Schülerzahl / Schultage verifizieren
- [ ] Volumen-Zahlen gegen `docs/extern/on-premise-vs-api-kalkulation.md` abgleichen
- [ ] Schul-UID / Rechnungsadresse offiziell bestätigen
- [ ] Mit Direktion / IT-Leitung abstimmen
- [ ] Gesendete Fassung nach `docs/extern/mail-archiv/` archivieren
