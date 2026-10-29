# app — Website und Token-Portal

Grundgerüst der neuen App des KI-Kustodiats (Issue #42, Teil von #35): **eine**
React-Anwendung für die öffentliche Website **und** das Token-Portal. Die
öffentlichen Seiten werden zur **Build-Zeit vorgerendert** (SSG), `/portal/*`
bleibt client-gerendert.

Dieser Stand ist ein Skelett: keine Gestaltung, keine echten Inhalte, keine
Portal-Logik, kein Deployment.

## Voraussetzungen

- Node 24 (lokal über nvm; `node -v` muss `v24.*` liefern)

## Kommandos

| Kommando              | Zweck                                                                       |
| --------------------- | --------------------------------------------------------------------------- |
| `npm ci`              | Abhängigkeiten aus dem Lockfile installieren                                |
| `npm run dev`         | Vite im Middleware-Modus in Fastify auf <http://127.0.0.1:8080>             |
| `npm run build`       | Client-Bundle, SSR-Bundle und alle vorgerenderten HTML-Dateien nach `dist/` |
| `npm start`           | gebaute App aus `dist/` ausliefern (Standard: `127.0.0.1:8080`)             |
| `npm run lint`        | ESLint (flat config, TypeScript + React Hooks)                              |
| `npm run typecheck`   | `tsc --noEmit`                                                              |
| `npm test`            | Vitest (Routen-Tabelle und Prerender-Helfer)                                |
| `npx playwright test` | Browser-Tests: Primitives-Screenshots und Farbschema-Umschaltung            |
| `npm run format`      | Prettier über das Projekt                                                   |

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
und `dist/404.html` (unbekannte Pfade, HTTP-Status 404).

Die Routen-Tabelle steht in `src/routes.ts` und ist die einzige Quelle für Client,
Server und Prerender-Skript. Die Zuordnung Pfad → Seitenkomponente in
`src/pages/registry.ts` ist per `Record<PublicRoutePath, …>` erschöpfend geprüft:
eine neue Route ohne Seite bricht den Typecheck.

Alte Hash-Links (`/#/status`) werden im Browser auf den echten Pfad (`/status`)
umgeleitet.

## Build-Pipeline

```
vite build                                -> dist/ (Client-Bundle + index.html-Template)
vite build --ssr src/entry-server.tsx     -> .ssr/entry-server.js
tsx scripts/prerender.ts                  -> dist/**/index.html, dist/portal.html, dist/404.html
```

`scripts/prerender.ts` rendert jede Route über den SSR-Einstieg, füllt Titel,
Description und Robots-Directive und schreibt die Datei. Die reinen
String-Helfer dafür (`src/prerender.ts`) sind ohne DOM testbar.

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
  routes.ts            Routen-Tabelle, Pfad-Normalisierung, Legacy-Hash-Ziel
  prerender.ts         Dokument-Template füllen, Prerender-Ziele (pur, testbar)
  devRoutes.ts         Dev-only-Route /_design (nie öffentlich, nie vorgerendert)
  App.tsx              Layout + Routen-Auswahl (Server und Browser nutzen dieselbe)
  entry-server.tsx     SSR-Einstieg für Prerender und Dev-Server
  main.tsx             Browser-Einstieg (hydrate/createRoot, Hash-Shim)
  styles/              tokens.css (Design-Tokens) + global.css (Basis/Primitives)
  lib/theme.ts         Farbschema-Modi, Storage, Labels
  components/ui/       Button, Card, Table, Prose, PageHeader, Shell, ThemeToggle
  pages/               je eine Platzhalter-Seite pro Route + Portal-Shell + 404 + Design
server/
  app.ts               Fastify-App: Dev mit Vite-Middleware, Prod aus dist/
  index.ts             Listener (127.0.0.1:8080)
scripts/
  prerender.ts         Build-Schritt nach dem SSR-Build
tests/                 Playwright: /_design-Screenshots, Theme-Verhalten, Fokus-Ring
public/assets/         Logos (hell/dunkel) — Kopie aus website/assets/
```

## Noch nicht enthalten

Echte Inhalte (Markdown aus `website/content/`), Portal-Logik (LDAP, Keys,
Verbrauch), Portal-Komponenten (Dialog, Menü, Tooltip), nginx/TLS, Deployment,
Analytics.
