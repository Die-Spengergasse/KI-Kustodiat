# app — Website und Token-Portal

Die neue App des KI-Kustodiats (Teil von #35): **eine** React-Anwendung für die
öffentliche Website **und** das Token-Portal. Die öffentlichen Seiten werden zur
**Build-Zeit vorgerendert** (SSG) und rendern den Text aus
`website/content/*.md`; `/portal/*` bleibt client-gerendert.

Dieser Stand enthält alle sechs öffentlichen Seiten, die Bot-Artefakte
(`sitemap.xml`, `robots.txt`, echte 404) und den **Portal-Kern** aus Issue #47:
LDAP-Login gegen das Schul-AD, serverseitige Sessions, CSRF, Login-Rate-Limit,
Auto-Provisioning nach LiteLLM und Rollen aus dem Verzeichnis-DN. Key-Verwaltung
und Verbrauchsanzeige folgen in #48/#49.

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
| `npx playwright test`       | Browser-Tests: Seiten-Parität gegen die Live-Screenshots, Metadaten, Theme  |
| `npm run capture:reference` | Live-Seiten als Referenz nach `tests/reference/` aufnehmen                  |
| `npm run db:generate`       | Drizzle-Migration aus `server/db/schema.ts` neu erzeugen                    |
| `npm run db:migrate`        | Migrationen auf die Portal-DB anwenden (idempotent)                         |
| `npm run db:seed`           | Admin-Konto sicherstellen (`grafg`, Rolle `admin`)                          |
| `npm run format`            | Prettier über das Projekt                                                   |

## Voraussetzungen

- Node 24 (lokal über nvm; `node -v` muss `v24.*` liefern)
- Für die Portal-API zusätzlich: PostgreSQL-Schema `portal` und
  `/etc/portal/portal.env` (0600) — Aufbau und Inhalte stehen in
  `KI-Kustodiat-intern:infra/hosts/kik.md`. Ohne diese Konfiguration läuft die
  öffentliche Website unverändert, `/api/auth/*` antwortet `503` mit den
  fehlenden Variablennamen.

## Portal (#47)

| Route                   | Verhalten                                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `GET /api/auth/me`      | Session-Status + frisches CSRF-Token; ohne Session **401**                                            |
| `POST /api/auth/login`  | Search-then-Bind gegen LDAP; falsche/fehlende Credentials **401**, ohne CSRF **403**, Lockout **429** |
| `POST /api/auth/logout` | Session in der DB widerrufen, Cookies löschen (**204**)                                               |
| `/portal`               | Client-gerenderte Login-/Statusseite, `noindex` (Meta + `x-robots-tag`)                               |

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

## Routen

Öffentlich, vorgerendert (je eine HTML-Datei in `dist/`):

| Pfad                   | Datei                                 |
| ---------------------- | ------------------------------------- |
| `/`                    | `dist/index.html`                     |
| `/status`              | `dist/status/index.html`              |
| `/milestones`          | `dist/milestones/index.html`          |
| `/angebote`            | `dist/angebote/index.html`            |
| `/faq`                 | `dist/faq/index.html`                 |
| `/openwebui-anleitung` | `dist/openwebui-anleitung/index.html` |

Dazu `dist/portal.html` (leere Shell, `noindex`, wird für `/portal/*` ausgeliefert)
und `dist/404.html` (unbekannte Pfade, HTTP-Status 404). Aus derselben Routen-Tabelle
entstehen `dist/sitemap.xml` (genau die öffentlichen Routen) und `dist/robots.txt`
(`Disallow: /portal`, Verweis auf die Sitemap) — eine neue Route kann also nicht
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
tsx scripts/prerender.ts                  -> dist/**/index.html, dist/portal.html,
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

Die Screenshot-Baselines liegen in `tests/design.spec.ts-snapshots/` und werden
mit `npx playwright test --update-snapshots` neu erzeugt.

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
  components/ui/       Button, Card, Table, Prose, PageHeader, Shell, ThemeToggle
  pages/MarkdownPage   Unterseiten (Markdown + „← Zur Startseite“)
  pages/HomePage       Startseite (Markdown, .home, Karten-Buttons)
  pages/               dazu Portal-Shell, 404 und die Dev-Seite /_design
server/
  app.ts               Fastify-App: Dev mit Vite-Middleware, Prod aus dist/, /api/auth/* zuerst
  config.ts            Env-Datei + Secrets (Datei/systemd-Credential), Config-Objekt
  routes/auth.ts       GET /api/auth/me, POST /api/auth/login, POST /api/auth/logout
  auth/ldap.ts         Search-then-Bind gegen das Schul-AD (ldapts, TLS-Validierung an)
  auth/roles.ts        Rollenableitung aus dem DN (Lehrer/Schueler/Verwaltung)
  auth/sessions.ts     Sessions in Postgres, Cookie-Flags, rollierende Verlängerung
  auth/csrf.ts         Double-Submit-Token (signiertes Cookie + Header)
  auth/ratelimit.ts    Fehlversuchsfenster pro Konto und IP
  auth/provisioning.ts LiteLLM-User anlegen/löschen (proxy-admin-Key, idempotent)
  auth/users.ts        Upsert der Portal-User, `admin` bleibt erhalten
  auth/audit.ts        portal.audit_log (ohne Passwörter/Tokens)
  db/schema.ts         Drizzle-Schema `portal.*` (users, sessions, audit_log, login_attempts)
  db/client.ts         pg-Pool + Drizzle, lazy (ohne DB startbar)
  db/migrate.ts        Migrator für `npm run db:migrate`
scripts/
  prerender.ts         Build-Schritt nach dem SSR-Build (Seiten + Bot-Artefakte)
  capture-reference.ts Referenz-Screenshots der Live-Seiten nach tests/reference/
  db-migrate.ts        CLI-Wrapper für db/migrate.ts
  db-seed.ts           Admin-Konto (grafg) sicherstellen
drizzle/              generierte SQL-Migrationen + Journal
tests/                 Playwright: Startseite und Unterseiten (Struktur + Pixel-Parität),
                       Metadaten/Sitemap/robots/404, /_design-Screenshots, Theme,
                       /portal (noindex + Login-Formular)
public/assets/         Logos (hell/dunkel) — Kopie aus website/assets/
```

## Noch nicht enthalten

Key-Verwaltung und Verbrauchsanzeige (#48), Kontingent-Policy (#49),
Portal-Komponenten für Dialoge/Menüs/Tooltips, nginx/TLS-Routing für `/portal`
und `/api/auth/` (#51), Deployment, Analytics.
