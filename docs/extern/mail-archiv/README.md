# E-Mail-Archiv

Hier wird der E-Mail-Verkehr rund um das KI-Kustodiat archiviert — sowohl
gesendete (aus) als auch empfangene (ein) Nachrichten.

## Konvention

- **Ein File pro E-Mail bzw. pro Thread.**
- Dateiname: `YYYY-MM-DD_<ein|aus>_<thema>.md`
  - `ein` = empfangene E-Mail, `aus` = gesendete E-Mail
  - `<thema>` = kurzer Slug, z. B. `kollegium-ideenaufruf`, `zid-vm-anfrage`
  - Beispiel: `2026-09-28_aus_kollegium-ideenaufruf.md`
- Deutsch (schulinterne Kommunikation).

## Inhalt je File

```markdown
# <Betreff>

Datum: YYYY-MM-DD
Von: ...
An: ...
Betreff: ...
Richtung: ein | aus

---

<vollständiger Text der E-Mail>
```

## Regeln

- **Keine Secrets** (Passwörter, Keys, personenbezogene Daten Dritter).
- Verweise auf zugehörige Issues/Discussions sowie auf den Entwurf unter
  `docs/extern/` ergänzen.
- E-Mail-Entwürfe liegen weiterhin direkt unter `docs/extern/`; erst die
  tatsächlich versendete bzw. empfangene Fassung wandert hierher.
