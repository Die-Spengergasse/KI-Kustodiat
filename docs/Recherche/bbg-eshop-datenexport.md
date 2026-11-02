# BBG e-Shop — Datenexport & Agenten-Zugriff

Stand: 2026-11-02 · Issue #34 · Frage: „Ist ein Vollexport des BBG-Kataloges
grundsätzlich möglich, und wie kommt ein KI-Agent an die Daten?"

## Kurzfassung

Ein **Ein-Klick-Vollexport aller Produkte aller Kataloge ist nicht dokumentiert**
und wäre auch nicht sinnvoll (3 Mio. Produkte, Rechte pro Produktfamilie). Ein
**vollständiger Export ist aber grundsätzlich möglich** — dokumentiert und
technisch vorhanden — über drei Wege:

1. **BMEcat 1.2 / veenion Staging (Excel)** je Katalog, inkl. Multimedia-ZIP →
   die vollständigste Form (Produkte + Preise), dokumentiert im Katalog-Admin.
2. **„Alle Kataloge exportieren"** → eine Excel-Datei (Katalogliste), plus
   **`/print/list/exportpro?catId=…`** → Produktliste eines Katalogs als Excel.
3. **Such-Exporte** `/search/export/{catalog,lot,tender,supplier,productgroup,themeworld}`
   → Ergebnislisten als Datei.

Alles hängt an der **Buyer-Session** und an den freigeschalteten
Produktfamilien — der Export liefert genau das, was die Schule ohnehin sieht.

## Architektur-Befund

| Ebene | Befund |
|---|---|
| Shop | `https://www.e-shop.gv.at/e-shopx/` — Angular-SPA, Software **veenion (impact ordering)** |
| API | `https://www.e-shop.gv.at/e-shop/jax/ux/…`, JSONP (`callback({…})`), Base aus `e-shopx/server-config.js` |
| Portal | `https://meine.bbg.gv.at` ist **Microsoft Power Pages** (Konto, Berechtigungen, Dokumente) — nicht der Shop |
| Ohne Login | HTTP 200 mit `{"authErrors":[{"error":"Bitte melden Sie sich an, um Zugriff auf Ihre Daten zu erhalten."}]}` |

Verifiziert am 2026-11-02 per `curl` (GET, ohne Anmeldung):

```
GET /e-shop/jax/ux/catalogexport/view
→ 200 {"criticalErrors":[],"errors":[],"authErrors":[{"error":"Bitte melden Sie sich an …"}]}
GET /e-shop/jax/ux/tender/55747
→ 500 + Meta-Refresh auf https://meine.bbg.gv.at/
```

Die API antwortet also strukturell — sie braucht nur Session-Cookie und
(für POST) `__RequestVerificationToken` aus `/_layout/tokenhtml`.

## Belege (öffentliche Hersteller-Doku)

Die veenion-Hilfe des Shops ist **ohne Login lesbar** — das ist die belastbare
Quelle, nicht Foren:

- `e-shop.gv.at/e-shop/help/de/39029.htm` — „Kataloge drucken und exportieren":
  *„Einzelne Kataloge können in der Liste der Benutzerkataloge oder in der Liste
  der Lieferantenkataloge als pdf-Datei oder als Excel-Datei exportiert werden."*
  Und: *„Um alle Kataloge als Excel-Datei zu exportieren, nutzen Sie die
  entsprechende Funktion in der Liste der Benutzerkataloge."*
- `e-shop.gv.at/e-shop/help/de/_exportallselect.htm` — „Alle Kataloge exportieren":
  *„In diesem Dialog können Sie einen Export aller Kataloge in eine Excel-Datei
  vornehmen"* (Optionen: Bilder, Benutzerkataloge, Lieferantenkataloge).
- `e-shop.gv.at/e-shop/help/de/_catalogexport.htm` — „Katalogexport":
  *„Hier können Sie die in impact ordering enthaltenen Kataloge im Format
  BMECat 1.2 oder im veenion Staging Format exportieren. Außerdem ist es
  möglich, die im Katalog enthaltenen Multimedia-Dateien als zip-Archiv zu
  exportieren."* Transaktionstypen `T_New_Katalog`, `T_Update_Prices`,
  `T_Update_Products`; Hintergrund-Export für große Kataloge.
- Schul-Anleitung der Bildungsdirektion Burgenland
  (`bildung-bgld.gv.at/…/BBG_e-Shop_Anleitung.pdf`): Vertragsliste per
  **„DRUCKEN"** → *„Sie erhalten so eine Excelliste mit all Ihren abrufbaren
  Verträgen"* (alle GZ + Laufzeiten). Außerdem: Die Suche zeigt Verträge,
  Ausschreibungen, Kataloge, Lieferanten und Produkte; innerhalb eines
  Katalogs/Loses gibt es ein Produkt-Suchfeld.
- Frontend-Bundle `e-shopx/main.js`: `exportEndpoint` je Listenansicht
  (`/search/export/…`) und `POST /print/list/exportpro` mit `catId` — der
  Produkt-Export eines Katalogs.
- Berechtigungen: laut BBG-FAQ sind Produktfamilien/Kataloge freischaltbar und
  *„auch Einschränkungen auf bestimmte Beschaffungsgruppen und Kataloge sind
  möglich"* — der Exportumfang folgt also dem Konto.

## Forenlage

**Keine.** Suchen nach Erfahrungsberichten („BBG e-Shop Katalog exportieren
Excel", veenion/impact ordering, Schulverwaltungs-Foren) liefern ausschließlich
die offizielle Doku und Schul-Anleitungen, keine Community-Diskussion. Für
dieses Thema ist die Hersteller-Hilfe die Primärquelle; Foren tragen nichts bei.

## Empfohlener Weg für den Agenten

1. **Erst fragen, dann bauen:** BBG-Vertragsmanager um einen **BMEcat- oder
   Staging-Excel-Export** der relevanten Kataloge bitten (ein Satz in der
   bestehenden BBG-Anfrage, `KI-Kustodiat-intern:docs/extern/provider-anfragen.md`).
   Ein Download → Agent indexiert lokal (SQLite/ripgrep), keine Session nötig.
2. **Fallback Session-Export:** Agent an ein eingeloggtes Chrome hängen
   (CDP, `chrome-devtools-mcp`) oder Playwright mit persistentem Profil;
   je Katalog `POST /print/list/exportpro` bzw. den Excel-Export aus der
   Katalogliste auslösen, Dateien sammeln, lokal indexieren.
3. **Kein Klick-Bot im Bestellprozess:** read-only; Warenkorb/Bestellung
   bleiben manuell. Zugangsdaten nur über Browserprofil oder
   `KI-Kustodiat-intern:infra/hosts/secrets.local.md` — nie im Prompt, nie im
   public Repo. Preise sind login-gebunden → Ergebnisse gehören nach
   `KI-Kustodiat-intern:docs/extern/`.
4. **Rate-Limit:** zwei e-Shop-Zugänge pro Schule. Sequenziell, wenige Requests,
   kein Polling — sonst Sperrgefahr.

## Offen

- [ ] BBG-Antwort zu maschinenlesbarem Katalog-/Preisexport (Frage in der
      BBG-Mail ergänzen).
- [ ] Prüfen, ob der BMEcat-Export auch für **fremde** (Lieferanten-)Kataloge
      im Buyer-Konto verfügbar ist oder nur für eigene/administrierte.
- [ ] Discovery: `catId`-Liste + `exportpro`-Antwort einmal mit Session
      mitschneiden (Format, Spalten, Preisgruppen).
