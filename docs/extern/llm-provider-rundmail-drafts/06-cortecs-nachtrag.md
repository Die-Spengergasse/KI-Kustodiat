# 06 — Cortecs: Nachtrag (Bestandskunde)

**Versand-Position:** 6 von 6 (separierte Mail, kein Teil der eigentlichen Rundmail)
**Abhängigkeit:** ✅ keine — jederzeit möglich. Anders als die übrigen Drafts ist
diese Mail **manuell zusammenzusetzen**: Einstiegsparagraph (unten) + passende Punkte
aus dem Referenz-Draft. Kein vollständiger Pitch nötig (positives Kundenverhältnis).

**An:** `enterprise@cortecs.ai`
**Betreff:** Anfrage Bildungseinrichtung — LLM-API für HTL Spengergasse

---

## Teil 1 — Einstiegsparagraph (zufriedener Kunde)

Sehr geehrtes Cortecs-Team,

ich schreibe Ihnen als Kustode des KI-Kustodiates der HTL Spengergasse — und
gleich vorweg: Wir sind bereits zufriedener Kunde und nutzen Cortecs-Modelle
produktiv in unserer schuleigenen KI-Infrastruktur (LiteLLM-Routing, Open WebUI,
Anmeldung über das Schul-AD). Die Zusammenarbeit läuft zuverlässig und
datenschutzseitig unproblematisch. Mit der Ausweitung auf den regulären
Schulbetrieb (alle Klassen, Lehrkräfte und Verwaltung) ergeben sich für mich nun
eine handvoll konkrete Punkte — siehe unten.

*(Rest des Mail-Texts: relevanten Punkte aus Teil 2 zusammenstellen.)*

---

## Teil 2 — Referenz-Draft (2026-08-13)

> Nur als Zulieferung für die finale Mail; die Punkte unten stammen aus der
> ursprünglichen Einzelanfrage. Punkt 6 ist an das Master-Token-Setup angepasst
> (die individuelle Token-Verwaltung machen wir inzwischen selbst).

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
6. **Auth-Integration** — Wir arbeiten mit einem einzigen institutionellen
   Master-Token und erzeugen die individuellen Tokens samt Budgets pro
   Schülergruppe selbst über unseren LiteLLM-Proxy. Welche Rate-/Volumen-Limits
   (RPM/TPM, gleichzeitige Requests) gelten auf Masterebene und was müssen wir
   beim Hochskalieren kennen? Die Verbrauchsauswertung pro Schlüssel wäre
   ebenfalls hilfreich.
7. **Test-Phase** — 30-tägiger Pilot-Zugang für 1–2 Klassen?
8. **Rechnungsstellung** — auf österreichische öffentliche Schule?
   (UID-pflichtig, Rechnungsadresse: HTL Spengergasse, 1050 Wien)
