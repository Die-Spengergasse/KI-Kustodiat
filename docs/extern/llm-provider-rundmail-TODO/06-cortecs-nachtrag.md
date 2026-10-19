# 06 — Cortecs: Anfrage Bildungseinrichtung (Bestandskunde privat)

**Versand-Position:** 6 von 6 (separierte Mail, kein Teil der eigentlichen Rundmail)
**Abhängigkeit:** ⏳ **Idealerweise nach erster substanzieller Antwort von 01
(ACOmarket) senden.** Die Kernfrage der Mail — ob und mit welchem Volumen wir
Cortecs institutionell brauchen — hängt an der Academic-AI-Frage über OCRE. Mit
einer Erstantwort in der Hand kann der Transparenz-Absatz konkret benennen, wo die
Dinge stehen (zugesagt/offen), statt vage zu bleiben. Sonst keine Abhängigkeit.
**Status:** versandfertig (Tonalität an die gesendeten Mails 01/02/04 angeglichen)

**An:** `enterprise@cortecs.ai`
**Betreff:** Anfrage Bildungseinrichtung — LLM-API für HTL Spengergasse

---

Sehr geehrtes Cortecs-Team,

ich schreibe Ihnen als Kustode des KI-Kustodiates der HTL Spengergasse (HTBLVA
Wien V, ~2.600 Schüler:innen, ~280 Lehrkräfte, 97 Klassen). Wir bauen gerade
eine schuleigene KI-Infrastruktur auf (eigener Whisper-STT-, LiteLLM- und
Open-WebUI-Stack, Anmeldung über das Schul-AD), siehe
<https://kik.spengergasse.at>.

Und gleich vorweg: Ich bin seit Frühsommer selbst Kunde bei Ihnen und mit den
Diensten sehr zufrieden. Cortecs war damit der naheliegende Kandidat, als wir
für die Schule EU-souveräne Provider gesucht haben - die EU-native
Cloud-Infrastruktur, ISO 27001 und DSGVO by default passen genau zu unseren
datenschutzseitigen Anforderungen.

Aber ich will auch ehrlich mit Ihnen sein: Parallel verhandeln wir über den
Wissenschaftsnetz-Kanal mit ACOmarket über deren Academic-AI-Plattform (das
läuft auf Azure, beschafft über OCRE), und wir prüfen GPU-Inferenz-Rechenleistung
über denselben Rahmenvertrag. Wenn diese Wege einschlagen, läuft ein großer
Teil des Volumens darüber - und Ihr Anteil schrumpft womöglich auf das, was
jene Wege nicht abdecken. Ich will nicht, dass Sie sich auf Basis von Zahlen
ins Zeug legen, die sich dann in Luft auflösen. Betrachten Sie meine
Volumen-Kalkulation deshalb als Szenario, nicht als Zusage.

Mit der Ausweitung auf den regulären Schulbetrieb (alle Klassen, Lehrkräfte und
Verwaltung) ergeben sich für mich nun eine handvoll konkrete Punkte:

1. **Bildungs-/Schul-Rabatt:** Gibt es spezielles Pricing für öffentliche
   Bildungseinrichtungen (HTL, nicht kommerziell, Bundesschule)?
2. **Modellangebot und Preise:** Welche Konditionen gelten pro Mio Tokens
   (Input/Output) für DeepSeek V4 Flash, GLM-5.2, Qwen 3.6; optional Claude
   Opus 4.8, GPT-5.6?
3. **Gern mit einem einzigen Token:** Am liebsten wäre mir ein einziger
   institutioneller Master-Token. Unser LiteLLM-Proxy erzeugt daraus
   individuelle Tokens für Schüler:innen und Lehrkräfte, samt Budgets und
   Rate-Limits - Sie müssten keine 2.600 Accounts verwalten, und es fließen
   keine Schüler-Identitäten zu Ihnen (Datensparsamkeit im Sinne der DSGVO).
   Das ist für uns eine technische Möglichkeit, kein Muss. Relevant dafür:
   Welche Rate-/Volumen-Limits (RPM/TPM, gleichzeitige Requests) gelten auf
   Masterebene, und bekommen wir den Verbrauch pro Schlüssel ausgewertet?
4. **Formales:** DPA-Dokument für Unterzeichnung seitens der Schule / des
   Schulträgers (BM für Bildung)? Standard-Aufbewahrungsfristen für
   API-Inputs/Outputs - ist Zero-Data-Retention möglich? Rechnungsstellung
   auf eine österreichische öffentliche Schule (UID-pflichtig,
   Rechnungsadresse: HTL Spengergasse, 1050 Wien)?
5. **Volumen & Pilot:** Kalkuliert ist ein mittleres Szenario von ~325 Mio
   Output-Tokens/Monat (30 % aktive Schüler), Worst-Case ~2,2 Mrd/Monat - wie
   gesagt ein Szenario, nicht als Zusage und nicht als Prognose. Für den
   Einstieg dächte ich an einen 30-tägigen Pilot mit 1-2 Klassen - wäre das
   möglich, und stellen Sie dafür ein reduziertes Test-Kontingent bereit?

Mit freundlichen Grüßen
Georg Graf
HTL Spengergasse, Spengergasse 20, 1050 Wien

---

## Herkunft der Punkte

> Referenz-Draft vom 2026-08-13, hier vollständig eingearbeitet: Rabatt,
> Modellpreise, DPA, Datenlöschung, Volumen-Kalkulation, Auth-Integration,
> Test-Phase, Rechnungsstellung. Punkt 6 des Referenz-Drafts („Virtual-Keys pro
> Schülergruppe") ist auf den Master-Token-Baustein umgestellt — die
> individuellen Tokens erzeugt inzwischen die Schule selbst.
>
> Hintergrund: `docs/extern/cortecs-provider-evaluation.md`,
> `docs/extern/on-premise-vs-api-kalkulation.md`
