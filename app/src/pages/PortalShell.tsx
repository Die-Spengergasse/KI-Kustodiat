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

type View =
  | { kind: 'loading' }
  | { kind: 'anonymous'; csrfToken: string | null; error: string | null }
  | { kind: 'authenticated'; user: PortalUser; csrfToken: string | null }
  | { kind: 'unavailable'; message: string }

/**
 * The authenticated area (Issue #47): LDAP login, session display, logout.
 *
 * Deliberately client-rendered — `/portal` is served as an empty document and
 * marked `noindex`; key management and usage follow in Issue #48.
 */
export function PortalShell() {
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

  return (
    <>
      <PageHeader
        title="Portal"
        lead="Anmeldung mit dem Schulkonto. Hier entstehen später die persönlichen API-Keys und die Verbrauchsübersicht."
      />
      {view.kind === 'loading' && <p className="muted">Anmeldestatus wird geprüft …</p>}
      {view.kind === 'unavailable' && (
        <Card>
          <p role="alert">{view.message}</p>
        </Card>
      )}
      {view.kind === 'anonymous' && (
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
        </Card>
      )}
      {view.kind === 'authenticated' && (
        <Card title="Angemeldet">
          <Prose>
            <p>
              Angemeldet als <strong>{view.user.displayName}</strong> (<code>{view.user.sam}</code>)
              — Rolle: <strong>{roleLabel(view.user.role)}</strong>.
            </p>
            {view.user.mail !== null && (
              <p className="muted">
                Hinterlegte Adresse: {view.user.mail}. Key-Verwaltung und Verbrauchsanzeige folgen
                in Arbeitsschritt #48.
              </p>
            )}
          </Prose>
          <div className="ui-form__actions">
            <Button variant="outline" onClick={() => void onLogout()} disabled={busy}>
              Abmelden
            </Button>
          </div>
        </Card>
      )}
    </>
  )
}

function viewFromAuthState(state: AuthState): View {
  if (state.authenticated && state.user !== null) {
    return { kind: 'authenticated', user: state.user, csrfToken: state.csrfToken }
  }
  return { kind: 'anonymous', csrfToken: state.csrfToken, error: null }
}
