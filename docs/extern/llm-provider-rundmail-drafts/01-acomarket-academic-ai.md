# 01 — ACOmarket: Academic AI für eine ACOnet-Teilnehmerschule

**Versand-Position:** 1 von 6
**Abhängigkeit:** ✅ keine — Start der Rundmail

**An:** `office@acomarket.ac.at` (Ansprechpartner Academic AI: Mag. Michael Pisecki, +43 670 354 8193)
**Betreff:** Academic AI für eine ACOnet-Teilnehmerschule — Pionieranfrage HTL Spengergasse

---

Sehr geehrter Herr Mag. Pisecki, sehr geehrtes ACOmarket-Team,

Ich schreibe Ihnen als Kustode des soeben aus der Taufe gehobenen
KI-Kustodiates unserer Schule: die HTL Spengergasse (HTBLVA Wien V, ~2.600
Schüler:innen, ~280 Lehrkräfte, 97 Klassen) ist ACOnet-Teilnehmerorganisation
und Mitglied der ACOnet Identity Federation.

Wir bauen gerade eine schuleigene KI-Infrastruktur auf (eigener Whisper-STT-,
LiteLLM- und Open-WebUI-Stack, Anmeldung über das Schul-AD), siehe
<https://kik.spengergasse.at>.

Damit diese schöne Infrastruktur auch zum Leben erwacht, benötigen wir
selbstverständlich auch Inference Provider. Somit suchen wir für den
Breitband-Einsatz im Unterricht eine datenschutzkonforme, EU-gehostete
LLM-Plattform - und Academic AI erscheint uns dafür als der offenkundige Weg.

Meine Fragen:

1. **Schulen als Abonnenten:** Bisher nutzen 32 Hochschulen Academic AI. Nimmt
   ACOmarket auch österreichische Schulen (Sekundarstufe II, Schulerhalter
   Bund) als Abonnenten an? Wir wären gern Pionierschule — ggf. als Pilot mit
   reduzierter Skala (1–2 Klassen, ~30 Tage), danach Ausweitung. Stellen Sie für
   einen solchen Pilot ein (reduziertes) Test-Kontingent bereit, oder läuft er
   regulär über Verbrauch?
2. **Modelle & Konditionen:** Welche Modelle sind in v3.0 konkret verfügbar
   (OpenAI/Google/Mistral/Anthropic), und wie sind die Token-Preise? Wie sieht
   es mit Open Source Modellen aus? China, Frankreich, USA? Wichtig wäre mir
   eine institutsweite Budget-Obergrenze pro Monat (Orientierung: Referenz u:ai
   €20/User/Monat, auf unsere aktive Schülerschaft hochgerechnet) — die
   Feinsteuerung darunter übernehmen wir selbst.
3. **API-Zugang — gern mit einem einzigen Token:** Am liebsten wäre mir, Sie
   stellen uns einen einzigen institutionellen Master-Token zur Verfügung. Unser
   LiteLLM-Proxy erzeugt daraus individuelle Tokens für Schüler:innen und
   Lehrkräfte, samt Budgets und Rate-Limits — Sie müssten keine 2.600 Accounts
   verwalten, und es fließen keine Schüler-Identitäten zu Ihnen (Datensparsamkeit
   im Sinne der DSGVO). Das ist für uns eine technische Möglichkeit, kein Muss.
   Relevant dafür: Umfang des API-Zugangs (Chat Completions,
   Tailored-AI-/Wissensbasis-Management), Authentifizierung
   (X-Client-ID/X-Client-Secret), welche Rate-/Volumen-Limits auf dem Master-Token
   gelten, und ob wir den Verbrauch pro API-Key ausgewertet bekommen.
4. **Formales:** Können Sie bitte bestätigen, dass kein eigenes Vergabeverfahren
   notwendig ist (Beschaffung der Azure Secure Landing Zone durch ACOmarket
   über OCRE), und senden Sie ein Muster des Nutzungsvertrags sowie Ihr
   Datenschutzkonzept zu. Abrechnung monatlich nach tatsächlichem Tokenverbrauch
   — ist das korrekt? Und eine Detailfrage zur Auftragsverarbeitung: Wer wird
   unser AVV-Vertragspartner — ACOmarket oder Microsoft als Teil der
   Azure-Kette?

Da SSO über die ACOnet Identity Federation bei uns bereits gegeben wäre, wäre
eine Aufnahme technisch für uns ohne Reibungsverluste denkbar.

Mit freundlichen Grüßen
Georg Graf
HTL Spengergasse, Spengergasse 20, 1050 Wien
