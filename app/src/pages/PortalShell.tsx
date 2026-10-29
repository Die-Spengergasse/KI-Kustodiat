import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button, Card, PageHeader, Prose } from '../components/ui'
import {
  PortalApiError,
  fetchMe,
  login,
  logout,
  type AuthState,
  type PortalUser,
} from '../lib/portalApi'
import { loginFailureMessage, roleLabel } from '../lib/portalMessages'
import { PORTAL_PAGES, matchPortalPage } from '../routes'
import { KeysPage } from './portal/KeysPage'
import { UsagePage } from './portal/UsagePage'

type View =
  | { kind: 'loading' }
  | { kind: 'anonymous'; csrfToken: string | null; error: string | null }
  | { kind: 'authenticated'; user: PortalUser; csrfToken: string | null }
  | { kind: 'unavailable'; message: string }

interface PortalShellProps {
  /** Current path — resolved by the same route table the server uses. */
  path: string
}

/**
 * The authenticated area (Issues #47/#48): LDAP login, navigation, key
 * management and the usage view. Deliberately client-rendered — `/portal/*` is
 * served as an empty document and marked `noindex`; every page starts with
 * `GET /api/auth/me`, so a dead session immediately shows the login form again.
 */
export function PortalShell({ path }: PortalShellProps) {
  const [view, setView] = useState<View>({ kind: 'loading' })
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      setView(viewFromAuthState(await fetchMe()))
    } catch (error) {
      // A deployment without `/etc/portal/portal.env` answers 503 — the form is
      // still rendered so the page never looks broken, the submit explains it.
      setView({
        kind: 'anonymous',
        csrfToken: null,
        error:
          error instanceof PortalApiError
            ? loginFailureMessage({ status: error.status, ...error.body })
            : 'Das Portal ist gerade nicht erreichbar.',
      })
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy || view.kind !== 'anonymous') return
    setBusy(true)
    try {
      const state = await login(username, password, view.csrfToken)
      setPassword('')
      setView(viewFromAuthState(state))
    } catch (error) {
      if (error instanceof PortalApiError) {
        setView({
          kind: 'anonymous',
          csrfToken: view.csrfToken,
          error: loginFailureMessage({ status: error.status, ...error.body }),
        })
      } else {
        setView({
          kind: 'anonymous',
          csrfToken: view.csrfToken,
          error: 'Das Portal ist gerade nicht erreichbar.',
        })
      }
    } finally {
      setBusy(false)
    }
  }

  const onLogout = async () => {
    if (view.kind !== 'authenticated' || busy) return
    setBusy(true)
    try {
      await logout(view.csrfToken)
      await load()
    } catch {
      setView({ kind: 'unavailable', message: 'Abmelden fehlgeschlagen. Bitte neu laden.' })
    } finally {
      setBusy(false)
    }
  }

  if (view.kind === 'loading') {
    return (
      <>
        <PageHeader title="Portal" />
        <p className="muted">Anmeldestatus wird geprüft …</p>
      </>
    )
  }

  if (view.kind === 'unavailable') {
    return (
      <>
        <PageHeader title="Portal" />
        <Card>
          <p role="alert">{view.message}</p>
        </Card>
      </>
    )
  }

  if (view.kind === 'anonymous') {
    return (
      <>
        <PageHeader
          title="Portal"
          lead="Anmeldung mit dem Schulkonto. Danach verwaltest du hier deine API-Keys und siehst deinen Verbrauch."
        />
        <Card title="Anmelden">
          <form className="ui-form" onSubmit={onSubmit} noValidate>
            <div className="ui-field">
              <label className="ui-field__label" htmlFor="portal-username">
                Benutzername
              </label>
              <input
                className="ui-input"
                id="portal-username"
                name="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
              <p className="ui-field__hint">Kürzel wie im Schulnetz, z. B. GEO220154 oder pranz.</p>
            </div>
            <div className="ui-field">
              <label className="ui-field__label" htmlFor="portal-password">
                Passwort
              </label>
              <input
                className="ui-input"
                id="portal-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {view.error !== null && (
              <p className="ui-alert" role="alert">
                {view.error}
              </p>
            )}
            <div className="ui-form__actions">
              <Button type="submit" disabled={busy}>
                {busy ? 'Anmelden …' : 'Anmelden'}
              </Button>
            </div>
          </form>
          <p className="muted">
            Was das Portal ist und wofür du einen Schlüssel brauchst: <a href="/anleitung">Anleitung</a>.
          </p>
        </Card>
      </>
    )
  }

  const page = matchPortalPage(path)

  return (
    <>
      <nav className="portal-nav" aria-label="Portal">
        <ul>
          {PORTAL_PAGES.map((entry) => (
            <li key={entry.path}>
              <a
                href={entry.path}
                aria-current={entry.path === (page ?? '/portal') ? 'page' : undefined}
              >
                {entry.label}
              </a>
            </li>
          ))}
          {/* Öffentliche Seite, keine Portal-Route — deshalb nicht in PORTAL_PAGES. */}
          <li>
            <a href="/anleitung">Hilfe</a>
          </li>
        </ul>
        <ul>
          <li>
            <span className="muted">
              {view.user.displayName} ({roleLabel(view.user.role)})
            </span>
          </li>
          <li>
            <Button variant="outline" onClick={() => void onLogout()} disabled={busy}>
              Abmelden
            </Button>
          </li>
        </ul>
      </nav>

      {page === null && (
        <>
          <PageHeader title="Seite nicht gefunden" />
          <Card>
            <p>Diese Portalseite gibt es nicht.</p>
            <Prose>
              <p>
                Zurück zur <a href="/portal">Übersicht</a>.
              </p>
            </Prose>
          </Card>
        </>
      )}

      {page === '/portal' && (
        <>
          <PageHeader
            title="Portal"
            lead={`Angemeldet als ${view.user.displayName} (${view.user.sam}).`}
          />
          <Card title="Was du hier tun kannst">
            <Prose>
              <ul>
                <li>
                  <a href="/portal/keys">API-Keys</a> — Schlüssel für den KI-Proxy erzeugen,
                  rotieren und widerrufen. Der Schlüssel wird genau einmal angezeigt.
                </li>
                <li>
                  <a href="/portal/usage">Verbrauch</a> — Tokens und Anteil am Monatskontingent,
                  aufgeschlüsselt nach Modell.
                </li>
              </ul>
            </Prose>
            {view.user.mail !== null && (
              <p className="muted">Hinterlegte Adresse: {view.user.mail}</p>
            )}
          </Card>
        </>
      )}

      {page === '/portal/keys' && (
        <KeysPage csrfToken={view.csrfToken} onSessionExpired={() => void load()} />
      )}
      {page === '/portal/usage' && <UsagePage onSessionExpired={() => void load()} />}
    </>
  )
}

function viewFromAuthState(state: AuthState): View {
  if (state.authenticated && state.user !== null) {
    return { kind: 'authenticated', user: state.user, csrfToken: state.csrfToken }
  }
  return { kind: 'anonymous', csrfToken: state.csrfToken, error: null }
}
