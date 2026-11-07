---
type: Decision
title: "Tokenverwaltung unter `/tokens`, Anleitungen unter `/anleitung/…`, Startseite als Kacheln (Issue #57)"
description: "Tokenverwaltung unter `/tokens`, Anleitungen unter `/anleitung/…`, Startseite als Kacheln (Issue #57)"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-10-30T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-57
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/57
    title: Issue #57
---

**Tokenverwaltung unter `/tokens`, Anleitungen unter `/anleitung/…`, Startseite als Kacheln (Issue #57):** Die Authentifizierungs-/Schlüsselseite hieß `/portal` und versprach mehr, als sie ist — sie verwaltet ausschließlich Tokens und Verbrauch, deshalb jetzt `/tokens` (mit `/tokens/keys`, `/tokens/usage`) und der Seitentitel „Tokenverwaltung". **Harter Umzug ohne Redirects:** `/portal` liefert 404 (nginx-Block ersatzlos entfernt), alte Lesezeichen sind bewusst nicht umgeleitet. Die Anleitungen sind nach Thema getrennt — `/anleitung/tokens` und `/anleitung/openwebui` (Inhalte unverändert, nur Titel und Pfade); `/anleitung` und `/openwebui-anleitung` entfallen. Die Startseite verliert ihre übergroßen Button-Kacheln: `website/content/index.md` gruppiert die Links in vier `##`-Abschnitte (Dienste, Tokens, Dokumentation, Diskussion), `HomePage` splittet das Dokument an den `##`-Grenzen und rendert je Abschnitt eine Kachel mit **normalen Links**. Inhalte bleiben damit in Markdown editierbar. Nur die öffentliche Fläche wird umbenannt; Dienst- und Infra-Namen (`kik-portal.service`, `/etc/portal/portal.env`, DB-Schema `portal`) bleiben unverändert.
