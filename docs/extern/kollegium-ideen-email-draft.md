# Kollegium-Ideenaufruf — E-Mail-Entwurf

Erstellt: 2026-09-28 (rev. 2, Meta-first)
Überarbeitet: 2026-10-11 (rev. 3, kurz & bündig, text-only, echte URLs)
An: Kollegium (Lehrkräfte-Verteiler)
Betreff: KI-Kustodiat – Ideen und Wünsche gesucht

---

Liebe Kollegin, lieber Kollege,

Wie schon in der Eröffnungskonferenz erwähnt, habe ich das KI-Kustodiat
umhängen. Eigentlich wollte ich ja nur spielen, ... aber da sind wir jetzt
und so ist das eben. ich sollte auch versuchen, das Beste draus zu machen.

Es stehen einige Entscheidungen an und diese will ich weder - noch kann ich -
alleine treffen.

Ich soll einen Budgetwunsch ausarbeiten - in Absprache mit dem ZID -
was wir uns da kaufen wollen (Tokens, Hardware), weiß aber nicht was
wir (also auch Du) brauchen oder uns davon erwarten.

Ich habe eine Diskussions-Seite aufgemacht (sorry man braucht einen github account):

https://github.com/Die-Spengergasse/KI-Kustodiat/discussions/27

Ich würde mir sehr wünschen, dass es bis zu den Herbstferien (und natürlich darüber hinaus)  dort



 gibt, weil ich dann meinen Budgetvorschlag gegen Ende
der Herbstferien an die Direktion übermitteln möchte, Und auch die Anliegen der
Lehrerschaft.






Schon läuft eine kleine schuleigene Infrastruktur: Open WebUI, ein
Chat-Frontend mit Anmeldung über eure Schul-Accounts. Probiert es aus:
https://openwebui.kik.spengergasse.at

Alles zum Projekt findet ihr auf der Homepage:
https://kik.spengergasse.at

In etwa zwei bis drei Wochen treffe ich Entscheidungen und leite daraus
die Budgetforderung an die Direktion ab – eure Rückmeldungen fließen
direkt ein. Wenn GitHub für euch ungewohnt ist, helfe ich gerne beim
Einstieg.

Danke fürs Mitmachen!

Liebe Grüße
Georg Graf
HTL Spengergasse

---

## Outlook-Einfüge-Hinweis

- **Text-only:** Die Fassung oben ist reiner Text (bewusst ohne Markdown —
  Outlook rendert kein Markdown, einfügen würde Syntax-Müll zeigen).
- URLs als bare Links → Outlook verwandelt sie automatisch in klickbare
  Links. Nicht als Rich-Text-Link von Hand formatieren.
- Einfügen: Textblock markieren → in Outlook ins Mail-Feld einfügen
  (Klartext-Format behalten).

## Versand-Checkliste

- [x] **Open-WebUI-URL einsetzen** — erledigt 2026-10-08 (Issue #3:
      nginx-TLS-Front live, Let's Encrypt), URL: `https://openwebui.kik.spengergasse.at`
- [ ] #27 manuell anpinnen (GitHub-Weboberfläche — GraphQL-Schema bietet
      kein `pinDiscussion`)
- [ ] Verteiler / An-Feld festlegen
- [ ] Mit Direktion abstimmen
- [ ] Discussion-Threads #25/#26 und Anker #27 prüfen
- [ ] Nach Versand: gesendete Fassung ins Archiv legen
      (`docs/extern/mail-archiv/`)

## Tonalitäts-Regel

Die Frage, ob das Kustodiat überhaupt gebraucht wird, wird **nie explizit**
gestellt — immer nur subtil über Wofür/Erwartung/Hoffnung formuliert.
(Begründung siehe `docs/ai/HANDOFF.md`, Abschnitt „Politischer Rahmen".)

In rev. 3 wird durchgängig **Du/Ihr** verwendet (freundlich, nah am
Kollegium); rev. 2 nutzte „Sie".

## Rev. 3 Änderungen ggü. rev. 2

- Von ~100 Zeilen auf ~40 Zeilen Text gekürzt (freundlich, kurz & bündig).
- Sinnfrage-Erklärblock (custos/„Wächter") gestrichen.
- Detail-Threads #25/#26 aus dem Mail-Main-Body gestrichen — sie werden
  in Discussion #27 verlinkt statt per Mail verstreut.
- Infrastruktur-Aufzählung (gregor/LiteLLM/SearXNG) auf Open WebUI
  reduziert (Kurz-Erwähnung, wie gewünscht).
- Alle drei Links (Discussion, Open WebUI, Homepage) mit echten URLs.
- Betreff: „KI-Kustodiat – Ideen und Wünsche gesucht".

## Verwandte Dokumente

- Issue #24 — Call for ideas (dieser Vorgang)
- Issue #3 — kik nginx-TLS-Front (2026-10-08 erledigt, Blocker entfällt)
- Issue #14 — Token-/Auth-Konzept
- `docs/extern/mail-archiv/README.md` — Archiv-Konvention für die gesendete Fassung
