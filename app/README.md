# app — Website und Tokenverwaltung

Die neue App des KI-Kustodiats (Teil von #35): **eine** React-Anwendung für die
öffentliche Website **und** die Tokenverwaltung. Die öffentlichen Seiten werden zur
**Build-Zeit vorgerendert** (SSG) und rendern den Text aus
`website/content/**/*.md`; `/tokens/*` bleibt client-gerendert.

Dieser Stand enthält alle sieben öffentlichen Seiten, die Bot-Artefakte
(`sitemap.xml`, `robots.txt`, echte 404), den **Portal-Kern** aus Issue #47
(LDAP-Login gegen das Schul-AD, serverseitige Sessions, CSRF, Login-Rate-Limit,
Auto-Provisioning nach LiteLLM, Rollen aus dem Verzeichnis-DN) sowie die
**Key-Verwaltung und Verbrauchsanzeige** aus #48 (Schlüssel erzeugen/rotieren/
widerrufen, Monatsverbrauch pro Modell). Kontingent-Policy und Anträge folgen in
#49.

## Kommandos

| Kommando                    | Zweck                                                                       |
| --------------------------- | --------------------------------------------------------------------------- |
| `npm ci`                    | Abhängigkeiten aus dem Lockfile installieren                                |
| `npm run dev`               | Vite im Middleware-Modus in Fastify auf <http://127.0.0.1:8080>             |
| `npm run build`             | Client-Bundle, SSR-Bundle und alle vorgerenderten HTML-Dateien nach `dist/` |
| `npm start`                 | gebaute App aus `dist/` ausliefern (Standard: `127.0.0.1:8080`)             |
| `npm run lint`              | ESLint (flat config, TypeScript + React Hooks)                              |
| `npm run typecheck`         | `tsc --noEmit`                                                              |
| `npm test`                  | Vitest (Routen, Inhalte, Prerender, Server: Rollen/CSRF/Sessions)           |
| `npx playwright test`       | Browser-Tests: Seitenstruktur, Metadaten, Theme, Portal-Abläufe            |
| `npm run db:generate`       | Drizzle-Migration aus `server/db/schema.ts` neu erzeugen                    |
| `npm run db:migrate`        | Migrationen auf die Portal-DB anwenden (idempotent)                         |
| `npm run db:seed`           | Admin-Konto sicherstellen (`grafg`, Rolle `admin`)                          |
| `npm run format`            | Prettier über das Projekt                                                   |

## Voraussetzungen

- Node 24 — auf kik **systemweit** unter `/usr/local/node24` (Tarball-Release,
  `/usr/local/bin`-Symlinks), in der Entwicklung egal ob systemweit oder per nvm;
  `node -v` muss `v24.*` liefern (das Deploy-Skript bricht sonst ab).
- Für die Portal-API zusätzlich: PostgreSQL-Schema `portal` und
  `/etc/portal/portal.env` (0600) — Aufbau und Inhalte stehen in
  `KI-Kustodiat-intern:infra/hosts/kik.md`. Ohne diese Konfiguration läuft die
  öffentliche Website unverändert, `/api/auth/*` antwortet `503` mit den
  fehlenden Variablennamen.

## Tokenverwaltung (#47, URL seit #57)

| Route                   | Verhalten                                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `GET /api/auth/me`      | Session-Status + frisches CSRF-Token; ohne Session **401**                                            |
| `POST /api/auth/login`  | Search-then-Bind gegen LDAP; falsche/fehlende Credentials **401**, ohne CSRF **403**, Lockout **429** |
| `POST /api/auth/logout` | Session in der DB widerrufen, Cookies löschen (**204**)                                               |
| `/tokens`               | Client-gerenderte Login-/Statusseite, `noindex` (Meta + `x-robots-tag`)                               |

Ablauf eines Logins (`server/routes/auth.ts`):

1. CSRF (`kik_csrf`-Cookie signiert + `x-csrf-token`-Header) prüfen → sonst 403.
2. Rate-Limit aus `portal.login_attempts` (pro Konto 5/15 min, pro IP 20/15 min)
   → 429 mit `Retry-After`.
3. Service-Bind, Suche nach `sAMAccountName`, dann **Bind als gefundener DN** mit
   dem eingegebenen Passwort (leeres Passwort wird vorher abgewiesen).
4. Rolle aus dem DN: `,OU=Lehrer,` → teacher, `,OU=Schueler,` → student (auch
   unter `OU=<Abteilung>`), `,OU=Verwaltung,` → staff, sonst **kein Zugang**;
   `admin` ist eine DB-Rolle und wird von einem Login nie überschrieben.
5. User in `portal.users` upserten, LiteLLM-User beim ersten Login anlegen
   (`POST /user/new`, `user_id` = `sam`, idempotent, nicht blockierend).
6. Session in `portal.sessions` (nur der SHA-256 des Tokens), Cookie
   `kik_session` (`HttpOnly`, `Secure` in Produktion, `SameSite=Lax`,
   rollierend), Audit-Zeile in `portal.audit_log`.

Konfiguration: `server/config.ts` liest `/etc/portal/portal.env` (oder
`PORTAL_ENV_FILE`) und überschreibt nichts, was schon in der Umgebung steht.
Secrets dürfen als Datei referenziert werden (`PORTAL_LDAP_BIND_PASSWORD_FILE`,
`PORTAL_LITELLM_ADMIN_KEY_FILE`) oder per systemd `LoadCredential` im
`$CREDENTIALS_DIRECTORY` liegen. Getestet wird ohne Host-Abhängigkeit; die
Integrationstests sind opt-in:

```bash
PORTAL_DB_TEST=1 PORTAL_LDAP_TEST=1 PORTAL_LITELLM_TEST=1 npm test
```

Port und Bind-Adresse sind über `PORT` und `HOST` überschreibbar
(Standard `8080` / `127.0.0.1` — bewusst kein privilegierter Port, kein `0.0.0.0`).

## Keys und Verbrauch (#48)

| Route                      | Verhalten                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `GET /api/keys`            | eigene Schlüssel (aktiv + Widerrufs-Historie), `limit` aus der Rollen-Policy; ohne Session **401**      |
| `POST /api/keys`           | Schlüssel erzeugen → **201** mit `secret` (genau einmal), `key.token` = LiteLLM-Hash; ohne CSRF **403** |
| `POST /api/keys/:t/rotate` | neuer Schlüssel mit derselben Bezeichnung, alter wird widerrufen → **201** mit neuem `secret`           |
| `DELETE /api/keys/:t`      | widerrufen → **200**; fremder/Unbekannter Token → **404** (kein Existenz-Leak)                          |
| `GET /api/usage/summary`   | laufender Monat: Tokens und Spend pro Modell, Summen, `allowance.percentUsed` (+ `monthlyUsd` intern)   |
| `/tokens/keys`             | client-gerendert, `noindex`: Liste, Erzeugen mit Einmal-Anzeige, Rotieren, Widerrufen                   |
| `/tokens/usage`            | client-gerendert, `noindex`: Prozent des Monatskontingents, Tokens gesamt und pro Modell                |

Regeln, die der Code durchsetzt:

- **Das Secret wird nie gespeichert.** LiteLLM gibt es genau einmal aus; das Portal
  persistiert nur `key_meta.token_hash` (= LiteLLMs `token`, ein SHA-256) plus
  Bezeichnung und Widerrufsspur. Audit-Zeilen enthalten keinen Schlüssel.
- **Ein Fakt, ein Owner.** Keys/Budgets/Spend gehören LiteLLM; das Portal schreibt
  ausschließlich über die Admin-API (`proxy_admin`-Key, nie den Master-Key).
- **Budget am User, nicht am Key.** Beim ersten Key setzt das Portal
  `max_budget`/`budget_duration: 1mo` per `/user/update` — nur wenn noch keins
  gesetzt ist. Sonst multipliziert sich das Monatskontingent mit der Key-Anzahl.
  LiteLLM 1.101 rechnet die Monatsgrenze in UTC (Reset 01:00 Wiener Zeit) und
  ignoriert ein `timezone`-Feld; die Anzeige schneidet den Monat trotzdem in
  `Europe/Vienna` (`server/usage/repository.ts`).
- **Weiches Limit pro Rolle** (Default 10 aktive Keys). Rotieren ist auch am Limit
  erlaubt, weil dabei ein Key wegfällt.
- **Rate-Limit am Key (Issue #55).** Jeder erzeugte Key bekommt `rpm_limit`
  (`PORTAL_RPM_LIMIT_DEFAULT`, Default **120/min**, je Rolle überschreibbar wie
  die übrigen Knöpfe). Das Limit gilt **pro Key über alle Modelle**: derselbe
  Schlüssel bedient Chat, Coding und Diktat, und agentisches Coding erzeugt
  leicht Dutzende Requests pro Minute — deshalb großzügig. Es begrenzt
  Runaway-Clients (Retry-Schleifen), nicht normale Arbeit; #49 verschärft es je
  Rolle. Für Speech-to-Text ist es **nicht** die Fairness-Mechanik: Diktat
  wird über die Dauer abgerechnet (LiteLLM-Listenpreis 0,006 $/min) und läuft
  ins selbe Monatsbudget wie Chat — oft-kurz kostet so viel wie selten-lang
  (siehe PITFALLS). `rpm_limit` begrenzt nur Schleifen.
- **Alias ≠ Bezeichnung.** LiteLLM verlangt global eindeutige `key_alias`
  (verifiziert: „Key with alias '…' already exists. Unique key aliases across all
  keys are required"), ein Label wie „Laptop" wäre also pro Person nur einmal und
  über alle Nutzer:innen eindeutig. Das Portal führt deshalb `key_alias =
kik/<sam>/<random>` und die sichtbare Bezeichnung in `portal.key_meta.label`;
  eine Rotation behält die Bezeichnung, bekommt aber einen neuen Alias.

### Read-only Fassade `litellm.*`

Der Portal-Code referenziert **kein** `public.*`. Die Views liegen in
`db/litellm-views.sql` (Owner `postgres`, `security_invoker` aus → liest mit
Owner-Rechten) und werden als eigener Schritt angewendet, **nicht** per Drizzle
(Drizzle besitzt nur `portal`):

```bash
sudo -u postgres psql -v ON_ERROR_STOP=1 -d litellm < app/db/litellm-views.sql
```

Das Skript ist idempotent (`create or replace view`) und vergibt:

```sql
GRANT USAGE ON SCHEMA litellm TO portal;
GRANT SELECT ON litellm.v_request_log, litellm.v_user_spend, litellm.v_user, litellm.v_key TO portal;
```

| View                    | Quelle                               | Zweck                                                       |
| ----------------------- | ------------------------------------ | ----------------------------------------------------------- |
| `litellm.v_request_log` | `public."LiteLLM_SpendLogs"`         | Requests/Tokens/Spend pro Aufruf (`start_time` = naive UTC) |
| `litellm.v_user_spend`  | `public."LiteLLM_DailyUserSpend"`    | Tagesaggregate pro User/Key/Modell                          |
| `litellm.v_user`        | `public."LiteLLM_UserTable"`         | Budget (`max_budget`, `budget_duration`, `budget_reset_at`) |
| `litellm.v_key`         | `public."LiteLLM_VerificationToken"` | Key-Metadaten (nur Hash, nie Secret)                        |

Nach einem LiteLLM-Upgrade mit Prisma-Schemaänderung das Skript erneut anwenden.
Die Query selbst steckt hinter `server/usage/repository.ts`; ein Wechsel der
Datenquelle berührt nur diese Datei.

### Weitere Knöpfe (Defaults in Klammern)

`PORTAL_KEY_LIMIT_DEFAULT` (10) und je Rolle `PORTAL_KEY_LIMIT_STUDENT` /
`_TEACHER` / `_STAFF` / `_ADMIN`; `PORTAL_MONTHLY_BUDGET_USD_DEFAULT` (5, vorläufig
bis #49) und je Rolle `PORTAL_MONTHLY_BUDGET_USD_STUDENT` / `_TEACHER` / `_STAFF` /
`_ADMIN`; `PORTAL_RPM_LIMIT_DEFAULT` (120) und je Rolle `PORTAL_RPM_LIMIT_STUDENT` /
`_TEACHER` / `_STAFF` / `_ADMIN`.

### Verifikation

```bash
PORTAL_DB_TEST=1 PORTAL_LITELLM_TEST=1 npm test   # inkl. Fixture-Schema und echtem Gateway
```

`server/litellm/client.test.ts` und `server/keys/service.test.ts` laufen ohne
Host-Zugriff; `server/usage/repository.test.ts` prüft die Query gegen ein
Fixture-Schema, `server/routes/keys.integration.test.ts` den HTTP-Vertrag
(401/403/404, Einmal-Secret, Limit) gegen die echte DB und das echte Gateway.

## Routen

Öffentlich, vorgerendert (je eine HTML-Datei in `dist/`):

| Pfad                   | Datei                                 |
| ---------------------- | ------------------------------------- |
| `/`                    | `dist/index.html`                     |
| `/status`              | `dist/status/index.html`              |
| `/milestones`          | `dist/milestones/index.html`          |
| `/angebote`            | `dist/angebote/index.html`            |
| `/faq`                 | `dist/faq/index.html`                 |
| `/anleitung/tokens`    | `dist/anleitung/tokens/index.html`    |
| `/anleitung/openwebui` | `dist/anleitung/openwebui/index.html` |

Die Startseite ist die einzige Seite mit eigener Gliederung: `src/pages/HomePage.tsx`
splittet `website/content/index.md` an den `##`-Überschriften
(`splitMarkdownSections` in `src/lib/markdown.ts`) und rendert jede Gruppe als
Kachel — die Links darin bleiben normale Links.

Dazu `dist/tokens.html` (leere Shell, `noindex`, wird für `/tokens/*` ausgeliefert)
und `dist/404.html` (unbekannte Pfade, HTTP-Status 404). Aus derselben Routen-Tabelle
entstehen `dist/sitemap.xml` (genau die öffentlichen Routen) und `dist/robots.txt`
(`Disallow: /tokens`, Verweis auf die Sitemap) — eine neue Route kann also nicht
vergessen werden.

Die Routen-Tabelle steht in `src/routes.ts` und ist die einzige Quelle für Client,
Server, Prerender-Skript, Canonical-URLs und Sitemap: `<title>`,
`<meta name="description">`, `heading` (muss das `<h1>` des Markdown sein) und
`description` liegen dort, `<link rel="canonical">` und der OpenGraph-Block werden
daraus abgeleitet. Die Zuordnung Pfad → Seitenkomponente in
`src/pages/registry.ts` ist per `Record<PublicRoutePath, …>` erschöpfend geprüft:
eine neue Route ohne Seite bricht den Typecheck, eine Route ohne Markdown-Datei
bricht `src/lib/content.ts`.

Alte Hash-Links (`/#/status`) werden im Browser auf den echten Pfad (`/status`)
umgeleitet — beim Laden und bei `hashchange`.

## Build-Pipeline

```
vite build                                -> dist/ (Client-Bundle + index.html-Template)
vite build --ssr src/entry-server.tsx     -> .ssr/entry-server.js
tsx scripts/prerender.ts                  -> dist/**/index.html, dist/tokens.html,
                                             dist/404.html, dist/sitemap.xml, dist/robots.txt
```

`scripts/prerender.ts` rendert jede Route über den SSR-Einstieg und schreibt die
Datei; Titel, Description, Robots-Directive, Canonical und OpenGraph kommen aus
dem Template in `index.html`. Die reinen String-Helfer dafür (`src/prerender.ts`,
`src/bots.ts`) sind ohne DOM testbar.

## Design-System

Ein Token-Satz und ein Primitives-Satz für Website **und** Portal (Issue #43).
Pico ist ersetzt, nicht importiert: die Werte in `src/styles/tokens.css` sind aus
`website/vendor/pico.min.css` und dem Inline-CSS von `website/index.html`
übernommen, jede Tokengruppe nennt im Kommentar die abgelöste Pico-Variable.

```
src/styles/tokens.css   Tailwind-4-@theme: Farben (light-dark), Typo-Skala,
                        Abstände, Radien, Container-Breiten, Breakpoints, Schatten
src/styles/global.css   Preflight + Basis-Elemente + Komponenten-Klassen
src/components/ui/      Button, Card, Table, Prose, PageHeader, Shell, ThemeToggle
src/lib/theme.ts        kik-theme (auto|light|dark), Zyklus, Storage, Labels
```

- **Farbschema:** `<html data-theme="auto|light|dark">`. `auto` folgt
  `prefers-color-scheme`, `light`/`dark` sind fest; das Attribut setzt ein
  Inline-Skript im `<head>` **vor dem ersten Paint** (kein Flackern). Die Wahl
  liegt unter `localStorage["kik-theme"]` (Schlüssel wie bisher).
- **Token-Namen** erzeugen gleichzeitig Tailwind-Utilities (`bg-canvas`,
  `text-h1`, `p-gutter`, `rounded-card`, `shadow-card`).
- **Fokus:** ein einziger `:focus-visible`-Ring (2 px, Pico-`primary-focus`).
- **`/_design`** zeigt alle Primitives in beiden Schemata nebeneinander — nur im
  Dev-Server (`import.meta.env.DEV`), nicht in der Routen-Tabelle, nicht
  vorgerendert, im Produktionsbuild nicht erreichbar (HTTP 404).
- **Logos** liegen als Kopie der bisherigen Dateien unter `public/assets/`
  (hell/dunkel), damit `website/` nicht zur Laufzeit gebraucht wird.

Die Screenshot-Baselines des Design-Systems liegen in
`tests/design.spec.ts-snapshots/` und werden mit
`npx playwright test --update-snapshots` neu erzeugt.

**Zur Parität mit der alten Seite:** Der Umzug von Pico zu React wurde 2026-10-29
mit einem Pixelvergleich gegen Screenshots der alten Live-Seite abgenommen. Dieser
Vergleich ist **ausgemustert** (`tests/reference/`, `tests/png.ts`,
`scripts/capture-reference.ts` entfernt): ein eingefrorener Schnappschuss einer
abgelösten Seite blockiert jede Inhaltsänderung, ohne mehr zu finden als die
Strukturtests (Überschriften, Linktexte, fehlende externe Requests). Was bleibt,
sind die Snapshots des Design-Systems — die prüfen die Komponenten, nicht die
Seiteninhalte.

## Verzeichnisse

```
src/
  routes.ts            Routen-Tabelle (Pfad, Titel, H1, Description), Normalisierung,
                       Canonical-URLs, Legacy-Hash-Ziel
  bots.ts              sitemap.xml + robots.txt aus der Routen-Tabelle (pur, testbar)
  prerender.ts         Dokument-Template füllen, Prerender-Ziele (pur, testbar)
  devRoutes.ts         Dev-only-Route /_design (nie öffentlich, nie vorgerendert)
  App.tsx              Layout + Routen-Auswahl (Server und Browser nutzen dieselbe)
  entry-server.tsx     SSR-Einstieg für Prerender und Dev-Server
  main.tsx             Browser-Einstieg (hydrate/createRoot, Hash-Shim)
  styles/              tokens.css (Design-Tokens) + global.css (Basis/Primitives)
  lib/theme.ts         Farbschema-Modi, Storage, Labels
  lib/content.ts       `?raw`-Importe der website/content/*.md, pro Route
  lib/markdown.ts      .md- und #/…-Links → echte Pfade, Link-Absätze erkennen
  lib/portalApi.ts     Fetch-Hülle + Auth-API des Portals (Test ohne DOM)
  lib/portalKeys.ts    Key-API, Statuslabels, Datums-/Namensformatierung
  lib/portalUsage.ts   Usage-API, Token-/Prozentformatierung
  components/ui/       Button, Card, Table, Prose, PageHeader, Shell, ThemeToggle
  pages/MarkdownPage   Unterseiten (Markdown + „← Zur Startseite“)
  pages/HomePage       Startseite (Markdown, .home, Karten-Buttons)
  pages/TokensShell    Login, Navigation, Seitenwahl im authentifizierten Bereich
  pages/tokens/        KeysPage (Einmal-Secret, Rotieren, Widerrufen), UsagePage
  pages/               dazu 404 und die Dev-Seite /_design
server/
  app.ts               Fastify-App: Dev mit Vite-Middleware, Prod aus dist/, API-Routen zuerst
  config.ts            Env-Datei + Secrets (Datei/systemd-Credential), Config-Objekt
  routes/auth.ts       GET /api/auth/me, POST /api/auth/login, POST /api/auth/logout
  routes/session.ts    gemeinsamer Guard: 503/401 + CSRF-Pflicht für /api/keys, /api/usage
  routes/keys.ts       /api/keys (list/create/rotate/revoke), Ownership, Fehler-Codes
  routes/usage.ts      /api/usage/summary (Monat, Modelle, Prozent des Kontingents)
  keys/service.ts      Key-Policy: Show-once, Limit, Budget am User, Rotation, Audit
  keys/store.ts        portal.key_meta (Bezeichnung, Widerrufsspur; nie das Secret)
  litellm/client.ts    Admin-API-Client (/key/*, /user/info, /user/update), injizierbares fetch
  usage/repository.ts  Monatsfenster Europe/Vienna + Query über litellm.v_request_log
  auth/ldap.ts         Search-then-Bind gegen das Schul-AD (ldapts, TLS-Validierung an)
  auth/roles.ts        Rollenableitung aus dem DN (Lehrer/Schueler/Verwaltung)
  auth/sessions.ts     Sessions in Postgres, Cookie-Flags, rollierende Verlängerung
  auth/csrf.ts         Double-Submit-Token (signiertes Cookie + Header)
  auth/ratelimit.ts    Fehlversuchsfenster pro Konto und IP
  auth/provisioning.ts LiteLLM-User anlegen/löschen (proxy-admin-Key, idempotent, ohne Auto-Key)
  auth/users.ts        Upsert der Portal-User, `admin` bleibt erhalten
  auth/audit.ts        portal.audit_log (ohne Passwörter/Tokens)
  db/schema.ts         Drizzle-Schema `portal.*` (users, sessions, audit_log, login_attempts, key_meta)
  db/client.ts         pg-Pool + Drizzle, lazy (ohne DB startbar)
  db/migrate.ts        Migrator für `npm run db:migrate`
db/litellm-views.sql   read-only Views auf LiteLLM + GRANTs (eigener Apply-Schritt)
scripts/
  prerender.ts         Build-Schritt nach dem SSR-Build (Seiten + Bot-Artefakte)
  capture-reference.ts Referenz-Screenshots der Live-Seiten nach tests/reference/
  db-migrate.ts        CLI-Wrapper für db/migrate.ts
  db-seed.ts           Admin-Konto (grafg) sicherstellen
drizzle/              generierte SQL-Migrationen + Journal
tests/                 Playwright: Startseite und Unterseiten (Struktur + Pixel-Parität),
                       Metadaten/Sitemap/robots/404, /_design-Screenshots, Theme,
                       /tokens, /tokens/keys, /tokens/usage (noindex + Login-Formular)
public/assets/         Logos (hell/dunkel) — Kopie aus website/assets/
```

## Deployment (#51)

Ausgerollt wird **nicht** aus dem Repo-Verzeichnis, sondern als unveränderliches
Release; Regie führt `scripts/deploy-app.sh` im Repo-Wurzelverzeichnis (auf kik,
als `grafg`, passwortloses `sudo`):

```
scripts/deploy-app.sh            # build → release → switch → restart → health → prune
scripts/deploy-app.sh --force    # neues Release auch bei unverändertem dist/
scripts/deploy-app.sh --skip-health
KIK_NGINX_SRC=<datei> scripts/deploy-app.sh   # optional VHost installieren + reload
```

Layout auf dem Host (`/srv/kik-app/`):

```
releases/<ts>/dist      nur Build-Artefakte (kein node_modules) — nginx-`root`
current -> releases/…   Symlink, atomar getauscht (ln -sfn + mv -T)
app/                    Produktions-Install des Servers (npm ci --omit=dev)
app/dist -> ../current/dist   damit /tokens.html aus dem aktiven Release kommt
```

- **Statisch zuerst:** Die öffentlichen Routen liefert nginx direkt aus
  `current/dist` (`try_files $uri $uri/index.html =404`), nur `/tokens`,
  `/api/auth`, `/api/keys`, `/api/usage` gehen an `127.0.0.1:8080`. Ein Ausfall
  des Dienstes lässt die Website stehen; `/tokens` zeigt dann die statische
  Ausfallseite (`public/tokens-fallback.html` → `dist/tokens-fallback.html`,
  per nginx `error_page 502 503 504`).
- **Produktionsstart ist `tsx`, nicht `node server/index.js`** — das Repo hat
  keinen Server-Bundler; `tsx` ist reguläre Runtime-Dependency. `vite` fehlt im
  Produktions-Install bewusst (nur der Dev-Modus lädt es dynamisch).
- Der Health-Check ruft `http://127.0.0.1:8080/api/auth/me` und erwartet `401`;
  scheitert er, wird auf das vorherige Release zurückgerollt (Exit ≠ 0).
- Rollback von Hand: `ln -sfn` + `mv -T` auf `current` (kein nginx-Reload nötig,
  `root` zeigt auf den Symlink). Vollständige Kommandos in
  `KI-Kustodiat-intern:infra/hosts/kik.md`.

## Noch nicht enthalten

Kontingent-Policy und Anträge (#49), Portal-Komponenten für Dialoge/Menüs/Tooltips,
Analytics.
