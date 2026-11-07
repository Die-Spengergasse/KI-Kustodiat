---
type: Decision
title: "SearXNG-Instanz-Trennung: Schule=gregor, private Operator-Instanz extern (Issue #36)"
description: "SearXNG-Instanz-Trennung: Schule=gregor, private Operator-Instanz extern (Issue #36)"
tags: [ki-kustodiat, decisions]
generated: { by: opencode/knowledge-persistence, at: 2026-10-19T00:00:00Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
sources:
  - id: issue-36
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/36
    title: Issue #36
  - id: issue-112
    resource: https://github.com/Die-Spengergasse/KI-Kustodiat/issues/112
    title: Issue #112
---

**SearXNG-Instanz-Trennung: Schule=gregor, private Operator-Instanz extern (Issue #36):** Zwei getrennte Instanzen mit klarer Ownership — die private Operator-Instanz (extern; Name/URL/Doku nicht in diesem Repo, Verwaltung im persönlichen SVN) für private Operator-Hosts, gregor (`http://gregor.kik:80` = Schulnetz-DNS `gregor.kik.htl-wien5.schule`, Owner: dieses Repo, `KI-Kustodiat-intern:searxng/`) für Schul-Hosts (gregor/dell/kik). **Kein Cross-Fallback** — Schulsuche landet nie auf der privaten Instanz und umgekehrt. Der Such-Skill (opencode-helpers #112) ist instanz-neutral: keine Endpunkte/Credentials im Skill, Instanzen nur via `SEARXNG_PRIMARY`/`_AUTH`/`_CRED_FILE` pro Host; `SEARXNG_CHAIN=strict` (neutral, Alias `gregor` in Migration). **Keine privaten Credentials auf Schul-Hosts:** Brave-API-Key + GitHub-PAT von gregor entfernt (braveapi keylos disabled bis schuleigener Key), `secret_key` rotiert → `/opt/searxng/.env`, SearXNG-`secret_key` lebt **nur in settings.yml** (Env wird ignoriert, siehe PITFALLS). **Rest-Verschränkung als geduldete Dauerausnahme:** gregor bleibt Client im privaten Operator-VPN ausschließlich für Admin-Zugriff (Details ausschließlich intern: `KI-Kustodiat-intern:infra/hosts/gregor.md`); der Egress der privaten Instanz bleibt auf privaten Operator-Hosts (kein gregor-Failover, tinyproxy auf gregor gepurgt); kik bleibt außerhalb des VPNs, erreicht gregor übers Schulnetz. `EDV/Deployed/gregor` im persönlichen SVN austragen (r7584), Root-WC `/` de-versioniert.
