# KI-Kustodiat — Spengergasse

On-premise LLM-Infrastruktur für die Spengergasse. Datenschutzkonforme
KI-Assistenten für Unterricht und Coding – betrieben auf schuleigenen
Servern im ZID-Rechenzentrum, ohne Abhängigkeit von externen Anbietern.

## Worum geht's?

Schüler und Lehrer der Spengergasse nutzen KI als Werkzeug: zum Chatten,
für Coding-Assistenz in Projekten und zur Recherche. Die gesamte
Infrastruktur läuft lokal – kontrolliert, kostengünstig, und ohne dass
Daten das Schulnetz verlassen.

Das Projekt ist offen angelegt. Beiträge und Feedback sind willkommen.

## Status

Aktuell in der Planungsphase. Hardware-Entscheidung noch offen.
→ Details in [Issue #2](https://github.com/Die-Spengergasse/KI-Kustodiat/issues/2),
[#5](https://github.com/Die-Spengergasse/KI-Kustodiat/issues/5) und
[#7](https://github.com/Die-Spengergasse/KI-Kustodiat/issues/7).

## Architektur (Überblick)

Die Management-VM (LiteLLM + Open WebUI + SearXNG) ist der einzige
Einstiegspunkt für alle Clients aus dem Schulnetz. Die AI-Backend-
Knoten laufen in einem isolierten Bereich und sind ausschließlich
über die Management-VM erreichbar.

```
                    ╔═══════════════════════════════════════╗
                    ║          ZID Rechenzentrum            ║
                    ║                                       ║
                    ║  ┌─────────┐ ┌─────────┐ ┌─────────┐  ║
                    ║  │vLLM #1  │ │vLLM #2  │ │vLLM #3  │  ║
                    ║  └────┬────┘ └────┬────┘ └────┬────┘  ║
                    ║       │           │           │       ║
                    ║  ═════╧═══════════╧═══════════╧═══    ║
                    ║         --- Grenze DMZ ---            ║
                    ║  ═════╤═══════════╤═══════════╤═══    ║
                    ║       │           │           │       ║
                    ║  ┌────┴───────────┴───────────┴────┐  ║
                    ║  │         Management VM           │  ║
                    ║  │ LiteLLM + Open WebUI + SearXNG  │  ║
                    ║  └───────────────┬─────────────────┘  ║ 
                    ╚══════════════════╬════════════════════╝
                                       ║
                           HTTPS (Schul-SSO / API-Key)
                                       ║
              ┌────────────────────────╬───────────────────────┐
              │                        ║                       │
         Schulnetz                    VPN                  Internet?
              │                        │                       │
         ┌────┴────┐            ┌──────┴──────┐           ┌────┴────┐
         │ ┌─────┐ │            │   ┌─────┐   │           │ ┌─────┐ │
         │ │     │ │            │   │     │   │           │ │     │ │
         │ └──┬──┘ │            │  ┌┴─────┴┐  │           │ └──┬──┘ │
         │   ───   │            │  └───────┘  │           │   ───   │
         └─────────┘            └─────────────┘           └─────────┘
```

## Software-Stack

| Komponente | Zweck |
|---|---|
| **LiteLLM** | API-Proxy, Routing, Rate Limiting, Logging |
| **Open WebUI** | Chat-Frontend für Schüler und Lehrer |
| **SearXNG** | Lokale Suchinstanz für RAG / Tool Use |
| **vLLM** | LLM-Serving mit Continuous Batching |

## Clients

Zugriff über **OpenAI-kompatible API** von LiteLLM:

| Client | Verwendung |
|---|---|
| **Open WebUI** | Browserbasierter Chat (Schul-SSO) |
| **OpenCode** | Terminal-Coding-Tool (API-Key) |
| **Kilo Code** | VS Code / Cursor-Erweiterung (API-Key) |
| **Beliebige OpenAI-Clients** | Weitere Tools |

## Budget

~€9.000 (3× NVIDIA DGX Spark) – Alternativen in Evaluierung.

## Nächste Schritte

- [#2](https://github.com/Die-Spengergasse/KI-Kustodiat/issues/2) DGX Spark mit vLLM konfigurieren
- [#3](https://github.com/Die-Spengergasse/KI-Kustodiat/issues/3) Management-VM aufsetzen
- [#4](https://github.com/Die-Spengergasse/KI-Kustodiat/issues/4) Network Hardening
- [#6](https://github.com/Die-Spengergasse/KI-Kustodiat/issues/6) LiteLLM Access Control
- [#7](https://github.com/Die-Spengergasse/KI-Kustodiat/issues/7) Gemma 4 Evaluation

## Links

- 🌐 **[Homepage](https://kik.spengergasse.at)** — Webauftritt des Kustodiats (schuleigener Server); [GitHub Pages](https://die-spengergasse.github.io/KI-Kustodiat/) zeigt nur noch einen Einstiegs-Index. Präsentationen liegen im Repo unter `docs/praesentation/`.
- [GitHub Issues](https://github.com/Die-Spengergasse/KI-Kustodiat/issues)
- [Diskussionen](https://github.com/Die-Spengergasse/KI-Kustodiat/discussions)
- 🔒 **[KI-Kustodiat-intern](https://github.com/Die-Spengergasse/KI-Kustodiat-intern)** — internes Schwester-Repo (privat): Gesprächsnotizen, Verwaltungsinterna; Zugang nur für eingeladene Collaborators (#28)
