# Kollegium-Ideenaufruf — E-Mail-Entwurf

Erstellt: 2026-09-28
An: Kollegium (Lehrkräfte-Verteiler)
Betreff: KI-Kustodiat — Ihre Ideen, Wünsche und Anforderungen

---

Betreff: KI-Kustodiat — Ihre Ideen, Wünsche und Anforderungen

Liebe Kolleginnen und Kollegen,

ich möchte das KI-Kustodiat der Spengergasse gemeinsam mit Ihnen
weiterentwickeln. Dafür brauche ich Ihre **Ideen, Wünsche und Anforderungen** —
nicht nur, was ein solches Kustodiat können soll, sondern auch, was Sie sich
persönlich für Ihren Unterricht davon erwarten.

## Vorhandene Infrastruktur

Eine kleine, schuleigene Infrastruktur läuft bereits: Auf dem Host `gregor`
laufen ein Chat-Frontend (Open WebUI, Anmeldung mit den Schul-Accounts), ein
API-Gateway (LiteLLM) und eine lokale Suchinstanz (SearXNG). Einen Überblick
über das Projekt finden Sie in der Präsentation:

  https://die-spengergasse.github.io/KI-Kustodiat/

Sobald der sichere Zugang über HTTPS eingerichtet ist, stelle ich Ihnen hier den
direkten Link zur Verfügung:

  <Open-WebUI-URL — wird nach HTTPS-Freigabe ergänzt>

## Die zwei zentralen Entscheidungsfragen

1. **Compute on-premise oder Token-Kontingente zukaufen?**
2. **Welche Ressourcen benötigen wir langfristig?**

## Bitte um Ihre Rückmeldung

Die Hauptdiskussion findet auf **GitHub Discussions** statt. Bitte bringen Sie
sich dort mit Ihren Ideen, Wünschen und Anforderungen ein:

- Ideenaufruf & Willkommen:
  https://github.com/Die-Spengergasse/KI-Kustodiat/discussions/27
- Entscheidungsfrage 1 — Compute on-premise oder Token-Kontingente zukaufen?:
  https://github.com/Die-Spengergasse/KI-Kustodiat/discussions/25
- Entscheidungsfrage 2 — Welche Ressourcen benötigen wir langfristig?:
  https://github.com/Die-Spengergasse/KI-Kustodiat/discussions/26

Eigene Themen können Sie gern in der Kategorie **Ideas** als neuen Thread
anlegen. Wenn GitHub für Sie ungewohnt ist, helfe ich Ihnen gerne beim Einstieg.

## Zeitschiene

In etwa **zwei bis drei Wochen** treffe ich Entscheidungen und lasse sie in eine
konkretisierte **Budgetforderung an die Direktion** einfließen. Bis dahin haben
Sie Gelegenheit, auf GitHub mitzuwirken und zu diskutieren. Anschließend erstelle
ich ein **Stimmungsbild** aus Ihren Rückmeldungen und leite daraus den
Budgetforderungsentwurf ab.

Vielen Dank für Ihre Mitwirkung!

Mit freundlichen Grüßen,
Georg Graf
HTL Spengergasse, Spengergasse 20, 1050 Wien
grafg@spengergasse.at

---

## Verwendungs-Hinweis

Dieser Entwurf ist eine Vorlage. Vor Versand:
- [ ] **Open-WebUI-URL einsetzen** — erst nach ZID-VM + HTTPS (Issue #3);
      Platzhalter ersetzen. Der Link nicht vorher teilen.
- [ ] **Rückmeldefrist konkretisieren** (Bezug: Budgetforderung an die Direktion,
      in etwa zwei bis drei Wochen)
- [ ] Verteiler / An-Feld festlegen
- [ ] Mit Direktion abstimmen
- [ ] Discussion-Threads #25/#26 und Anker #27 prüfen; #27 anpinnen
      (manuell auf GitHub — Automatisierung nicht verfügbar)
- [ ] Nach Versand: gesendete Fassung ins Archiv legen
      (`docs/extern/mail-archiv/`)

## Verwandte Dokumente

- Issue #24 — Call for ideas (dieser Vorgang)
- Issue #3 — Management-VM / internetfähige ZID-VM + Let's Encrypt
- Issue #14 — Token-/Auth-Konzept
- `docs/extern/cortecs-anfrage-email-draft.md` — verwandter Entwurf (Provider)
