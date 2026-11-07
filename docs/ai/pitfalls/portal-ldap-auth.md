---
type: Pitfalls
title: "Pitfalls — Portal, LDAP und AD-Authentifizierung"
description: "AD-Verhalten, Login-Defaults und Lockout-Gefahren."
tags: [ki-kustodiat, pitfalls, portal-ldap-auth]
generated: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
verified: { by: opencode/knowledge-persistence, at: 2026-11-07T21:13:47Z }
status: stable
---

# Portal, LDAP und AD-Authentifizierung — Pitfalls

- **Open WebUI LDAP ist search-then-bind — kein Direct-Bind (verifiziert 2026-09-24, Issue #22)**: `routers/auths.py:ldap_auth` bindet IMMER zuerst den App-Account (`ldap.server.app_dn`, sonst ANONYMOUS), sucht den User, und bindet erst dann mit dem eingegebenen Passwort. Es gibt keinen Config-Schalter für „direkt mit den eingegebenen Credentials binden". Hat der AD keinen anonymen Read (oder kein `app_dn` gesetzt), findet die Suche nichts → Login unmöglich, egal wie korrekt das Passwort ist.
- **Dieser AD erlaubt anonymen Bind, aber KEINEN anonymen Read (verifiziert 2026-09-24)**: auf LDAPS 636, LDAP 389 und GC 3268 gelingt `anonymous` bind, aber `(objectClass=user)`-Suchen liefern **0 Einträge**. Ohne Service-Account ist Open WebUI-LDAP damit tot.
- **AD maskiert fehlende Leserechte als `noSuchObject` (nicht `insufficientAccess`)**: eine falsche Base-DN und ein reines Rechte-Problem sehen identisch aus (`0000208D NameErr ... NO_OBJECT`). Selbst existierende DNs (`CN=Users`, das Service-Account-OU) liefern anonym `noSuchObject`. Base-DN daher NUR mit dem Bind-Account verifizieren, nie anonym.
- **Open WebUI `ldap.server.search_filter` ist ein ZUSATZfilter, kein Login-Template**: der Code baut `(&(<attribute_for_username>=<login>)(<search_filter>))`. `{{login}}` wird **nicht** substituiert — der frühere Wert `(sAMAccountName={{login}})` ergab `(&(uid=<login>)(sAMAccountName={{login}}))` und matchte nie. Korrekt: `(objectClass=user)`.
- **Open WebUI Login-Default + Toggle (v0.11.4)**: `mode = enable_ldap ? 'ldap' : 'signin'`; der „Continue with Email/LDAP"-Toggle rendert nur `{#if enable_ldap && enable_login_form}` und benennt das **Ziel** (nicht den aktuellen Modus). Um den Toggle loszuwerden, muss genau eine Methode aktiv bleiben: LDAP-only → `ui.enable_login_form=false`; Email-only → `ldap.enable=false`.
- **Open WebUI LDAP matcht User per `mail`, Rolle bleibt**: existiert der User (z. B. `grafg`), wird er wiederverwendet und seine Rolle NICHT überschrieben; nur **neue** User bekommen `ui.default_user_role`.
- **Lokales Open-WebUI-Passwort neutralisieren, aber `auth.active=1` lassen**: `authenticate_user_by_email` (LDAP-Pfad) filtert `Auth.active.is_(True)`. Ein `active=0` würde den LDAP-Login desselben Users mitbrechen. Stattdessen `password` durch einen bcrypt-Hash eines Zufallswerts ersetzen (bestehender Hash war `$2b$12$`).
- **Der AD sperrt den Service-Account bei wiederholten Fehl-Binds — und das trifft Open WebUI mit (beobachtet 2026-10-29, #48):** Ein Integrationslauf, der gegen das *echte* Schul-AD mit einem Dummy-Passwort bindet, hat den LDAP-Service-Account kurzzeitig gesperrt (AD-Diagnosecode **775**, „account locked out"). Weil derselbe Account den Open-WebUI-Login trägt, ist das ein schulweiter Ausfall, kein Testartefakt. **Regel:** Fehl-Bind-Tests niemals gegen das Produktions-AD mit fremden Passwörtern; entweder gegen einen dedizierten Testaccount oder den Negativpfad mocken. Nach einem solchen Lauf: `ldapsearch` mit dem Service-Account versuchen und `result: 0` prüfen, bevor man weitermacht.
