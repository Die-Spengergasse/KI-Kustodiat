# Kollegium-Ideenaufruf — E-Mail-Entwurf

Erstellt: 2026-09-28 (rev. 2, Meta-first)
An: Kollegium (Lehrkräfte-Verteiler)
Betreff: KI-Kustodiat — Ihre Ideen, Wünsche und Erwartungen

---

Betreff: KI-Kustodiat — Ihre Ideen, Wünsche und Erwartungen

Liebe Kolleginnen und Kollegen,

ein Geständnis vorweg: Eigentlich wollte ich nur spielen. Weil ich das einmal
zu laut gesagt habe, betreue ich heute das KI-Kustodiat. Genau deshalb frage
ich Sie zuerst nicht nach Technik und Budget, sondern nach dem Fundament.

## Wofür soll das Kustodiat da sein?

Ein *Kustodiat* (von lateinisch *custos*, „Wächter") ist eine Einrichtung, die
etwas bewahrt und pflegt — hier: die KI-Infrastruktur der Spengergasse.
Damit es nicht nur mein Spielzeug bleibt, möchte ich von Ihnen wissen:

1. **Wofür** soll das Kustodiat Ihrer Meinung nach da sein — im Unterricht,
   in der Verwaltung, in Projekten?
2. **Was erwarten Sie** von einer schulischen KI-Infrastruktur?
3. **Was erhoffen Sie sich** — für sich selbst, für Ihre Fächer, für die
   Schülerinnen und Schüler?

Ihre Rückmeldungen — auch die kritischen — bestimmen, in welche Richtung und
in welcher Größenordnung das Kustodiat wächst.

## Bitte um Ihre Rückmeldung

Die Hauptdiskussion findet auf **GitHub Discussions** statt:

- Ideenaufruf & Diskussion:
  https://github.com/Die-Spengergasse/KI-Kustodiat/discussions/27

Zur Ausgestaltung gibt es zudem zwei konkrete Fragen:

- Compute on-premise oder Token-Kontingente zukaufen?:
  https://github.com/Die-Spengergasse/KI-Kustodiat/discussions/25
- Welche Ressourcen benötigen wir langfristig?:
  https://github.com/Die-Spengergasse/KI-Kustodiat/discussions/26

Eigene Themen können Sie gern in der Kategorie **Ideas** als neuen Thread
anlegen. Wenn GitHub für Sie ungewohnt ist, helfe ich Ihnen gerne beim Einstieg.

## Vorhandene Infrastruktur

Eine kleine, schuleigene Infrastruktur läuft bereits: Auf dem Host `gregor`
laufen ein Chat-Frontend (Open WebUI, Anmeldung mit den Schul-Accounts), ein
API-Gateway (LiteLLM) und eine lokale Suchinstanz (SearXNG). Einen Überblick
über das Projekt finden Sie auf der Projekt-Homepage:

  https://kik.spengergasse.at

Sobald der sichere Zugang über HTTPS eingerichtet ist, stelle ich Ihnen hier
den direkten Link zur Verfügung:

  <Open-WebUI-URL — wird nach HTTPS-Freigabe ergänzt>

## Zeitschiene

In etwa **zwei bis drei Wochen** treffe ich Entscheidungen und lasse sie in
eine konkretisierte **Budgetforderung** einfließen. Bis dahin haben Sie
Gelegenheit, auf GitHub mitzuwirken und zu diskutieren. Anschließend erstelle
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
- [ ] **Rückmeldefrist konkretisieren** (Bezug: Budgetforderung, in etwa zwei
      bis drei Wochen)
- [ ] Verteiler / An-Feld festlegen
- [ ] Mit Direktion abstimmen
- [ ] Discussion-Threads #25/#26 und Anker #27 prüfen; #27 anpinnen
      (manuell auf GitHub — Automatisierung nicht verfügbar)
- [ ] Nach Versand: gesendete Fassung ins Archiv legen
      (`docs/extern/mail-archiv/`)

## Tonalitäts-Regel

Die Frage, ob das Kustodiat überhaupt gebraucht wird, wird **nie explizit**
gestellt — immer nur subtil über Wofür/Erwartung/Hofflung formuliert.
(Begründung siehe `docs/ai/HANDOFF.md`, Abschnitt „Politischer Rahmen".)

## Verwandte Dokumente

- Issue #24 — Call for ideas (dieser Vorgang)
- Issue #3 — Management-VM / internetfähige ZID-VM + Let's Encrypt (kritischer Pfad)
- Issue #14 — Token-/Auth-Konzept
- `docs/extern/cortecs-anfrage-email-draft.md` — verwandter Entwurf (Provider)
