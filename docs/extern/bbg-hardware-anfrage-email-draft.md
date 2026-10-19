# Entwurf — BBG: Beschaffung großer GPU-/KI-Server (256 GB+ VRAM) für eine Bundesschule

> **Issue:** #34 · **Ergänzt:** `docs/Recherche/provider-anfragen.md` (dort Draft 4 = KI-/LLM-Positionen)
> **An:** `office@bbg.gv.at` — Zweitkontakt/CC: `kundenmanagement@bbg.gv.at`
> **Ansprechperson Bundesschulen (optional direkt):** Barbara Weinmann, KAM Bund /
> Bundesschulen / PH / Bildungsdirektionen, `barbara.weinmann@bbg.gv.at`
> **Status:** Entwurf — vor Versand von Georg überarbeiten. URLs bewusst text-only
> (Outlook rendert kein Markdown).

---

**Betreff:** Anfrage Bundesschule — Beschaffung großer GPU-/KI-Server (256 GB+ VRAM) über die BBG

Sehr geehrtes BBG-Team,

die HTL Spengergasse (HTBLVA Wien V, ~2.600 Schüler:innen, ~280 Lehrkräfte,
97 Klassen) ist als Bundesschule BBG-Abnehmerin (e-Shop, Grundsatzvereinbarung) und
baut eine schuleigene, datenschutzkonforme KI-Infrastruktur auf (on-premise Inferenz,
siehe https://kik.spengergasse.at). Für den nächsten Ausbauschritt planen wir
**turnkey-Systeme mit 256 GB, 512 GB und bis zu ≥ 1 TB GPU-/Unified-Speicher**
(Desk-Side oder Rack, Linux, fertig vom OEM) und möchten klären, ob und wie wir diese
über die BBG beschaffen können.

Unsere Fragen:

1. **Bestand — Katalogposition:** Gibt es im e-Shop eine abrufbare Rahmenvereinbarung
   oder Katalogposition für GPU-Server bzw. KI-Workstations mit **≥ 256 GB GPU-Speicher**?
   Im Portfolio finden wir „leistungsstarke Server und Netzwerke" sowie die Position
   „PCs & 13 Zoll 2 in 1 — GZ 3401.04830" (individuell konfigurierte PCs, Notebooks,
   Workstations). Deckt das auch GPU-Konfigurationen dieser Größenordnung ab?

2. **Neubedarf — Weg in die Beschaffung:** Falls nicht, über welchen Weg bringen wir
   einen konkreten Bedarf ein — **Bedarfsmeldung** in einer Beschaffungsgruppe oder
   **„Projekt im besonderen Auftrag"** über das Vergabekompetenzcenter? Wer ist die
   fachliche Ansprechperson für diese Systemklasse?

3. **Bedarfsmeldung Bundesschulen:** Erfolgt die Bedarfsmeldung direkt durch die Schule,
   über die Bildungsdirektion oder gebündelt über das BMBWF?

4. **Marktlage:** Wir nehmen Ihre Information zu den Speicherchip-/Halbleiter-Engpässen
   (Stand Mai 2026) ernst. Welche **Lieferzeiten und Preisbindungen** sind für solche
   Systeme derzeit realistisch, und welche Hinweise geben Sie für die Budgetierung?

5. **Alternative über Rahmenvertrag:** Gibt es für Bundesschulen statt eigener GPU-Hardware
   eine Rahmenvereinbarung für KI-Infrastruktur/-Plattformen (z. B. im Umfeld von
   GovGPT/Public AI bzw. souveräne Cloud-Plattformen mit österreichischem Rechenzentrumsbezug)?

6. **Angebotslegung:** Welche Angaben benötigen Sie für ein konkretes Angebot
   (Speicherklasse, Bauform Rack/Desk-Side, Linux-Support, Betreuung/Garantie)?

Einen ersten Überblick über die von uns angestrebten Konfigurationen haben wir als
Anhang beigefügt.

Wir würden eine solche Position gern aktiv anstoßen, da wir annehmen, dass viele
Bundesschulen denselben Bedarf haben. Besten Dank für Ihre Auskunft.

Mit freundlichen Grüßen
Georg Graf
HTL Spengergasse, Spengergasse 20, 1050 Wien
https://kik.spengergasse.at

---

## Anhang (als Mail-Anlage mitsenden)

**Angestrebte Zielkonfigurationen — Mengen sind ein Vorschlag zur Freigabe.**

| Klasse | Menge | Bauform | Speicher | Anforderungen |
|---|---|---|---|---|
| Einstieg | 2 *(Vorschlag)* | Desk-Side | 256 GB GPU-/Unified-Speicher | Linux, OEM-fertig (turnkey), CUDA-tauglich, 2× 10 GbE |
| Mittel | 1 *(Vorschlag)* | Rack (2U–4U) | 512 GB GPU-Speicher | Linux, redundantes Netzteil, 10 GbE, Remote-Management (BMC) |
| Groß | 1 *(Vorschlag)* | Rack | ≥ 1 TB GPU-Speicher | Linux, 8-GPU-tauglich, Vor-Ort-Service/Support |

Zweck: schuleigene Inferenz für den Unterricht (open-weight Modelle), datenschutzkonform,
Anbindung an das bestehende on-prem-Setup. Gewünscht sind Angebote je Klasse — falls
wirtschaftlicher, alternativ ein Gesamtangebot.

---

## Verwendungs-Hinweis

Vor dem Versand prüfen:

- [ ] Adressat/Anrede final wählen (Helpcenter `office@bbg.gv.at` vs. direkt KAM Weinmann)
- [ ] Projekt-/Statusseite aktuell: https://kik.spengergasse.at
- [ ] **Mengen im Anhang bestätigen** und Klassen/Bauform final festlegen
      (Orientierung: die Regal-/Server-Klasse der Angebots-Übersicht)
- [ ] Mit Direktion / IT-Leitung abstimmen (dieser Draft kann einen echten
      Beschaffungsvorgang auslösen)
- [ ] BBG-Marktlagenseite vor Versand erneut prüfen (Stand kann aktueller sein)
- [ ] Gesendete Fassung nach `docs/extern/mail-archiv-sent/` archivieren
      (→ `YYYY-MM-DD_aus_bbg-hardware-anfrage.md`)
