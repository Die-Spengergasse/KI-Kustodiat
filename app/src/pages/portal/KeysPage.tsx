import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button, Card, PageHeader, Table } from '../../components/ui'
import { PortalApiError } from '../../lib/portalApi'
import {
  createKey,
  fetchKeys,
  formatTimestamp,
  keyStatusLabel,
  keyTitle,
  revokeKey,
  rotateKey,
  type CreatedKey,
  type PortalKey,
} from '../../lib/portalKeys'

interface KeysPageProps {
  csrfToken: string | null
  /** Called when the session died; the shell then shows the login form again. */
  onSessionExpired: () => void
}

interface View {
  status: 'loading' | 'ready' | 'error'
  limit: number
  keys: PortalKey[]
  message: string | null
}

const INITIAL_VIEW: View = { status: 'loading', limit: 0, keys: [], message: null }

/**
 * `/portal/keys` (Issue #48): list, create (show-once), rotate and revoke the
 * logged-in user's gateway keys. The secret lives in component state only — a
 * reload, a navigation or "Ausblenden" discards it for good.
 */
export function KeysPage({ csrfToken, onSessionExpired }: KeysPageProps) {
  const [view, setView] = useState<View>(INITIAL_VIEW)
  const [label, setLabel] = useState('')
  const [revealed, setRevealed] = useState<CreatedKey | null>(null)
  const [pendingRevoke, setPendingRevoke] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const onError = useCallback(
    (error: unknown): string => {
      if (error instanceof PortalApiError) {
        if (error.status === 401) {
          onSessionExpired()
          return 'Die Sitzung ist abgelaufen. Bitte neu anmelden.'
        }
        if (error.body.message !== undefined) return error.body.message
        if (error.status === 503) return 'Das Portal ist noch nicht fertig eingerichtet.'
      }
      return 'Der Gateway ist gerade nicht erreichbar. Bitte später erneut versuchen.'
    },
    [onSessionExpired],
  )

  const load = useCallback(async () => {
    try {
      const data = await fetchKeys()
      setView({ status: 'ready', limit: data.limit, keys: data.keys, message: null })
    } catch (error) {
      setView((current) => ({ ...current, status: 'error', message: onError(error) }))
    }
  }, [onError])

  useEffect(() => {
    void load()
  }, [load])

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy !== null) return
    setBusy('create')
    setCopied(false)
    try {
      const created = await createKey(label, csrfToken)
      setRevealed(created)
      setLabel('')
      await load()
    } catch (error) {
      setView((current) => ({ ...current, message: onError(error) }))
    } finally {
      setBusy(null)
    }
  }

  const onRotate = async (key: PortalKey) => {
    if (busy !== null) return
    setBusy(`rotate:${key.token}`)
    setCopied(false)
    try {
      const rotated = await rotateKey(key.token, csrfToken)
      setRevealed(rotated)
      await load()
    } catch (error) {
      setView((current) => ({ ...current, message: onError(error) }))
    } finally {
      setBusy(null)
    }
  }

  const onRevoke = async (key: PortalKey) => {
    if (busy !== null) return
    setBusy(`revoke:${key.token}`)
    try {
      await revokeKey(key.token, csrfToken)
      setPendingRevoke(null)
      // The show-once card must not keep advertising a key that no longer works.
      if (revealed?.key.token === key.token) setRevealed(null)
      await load()
    } catch (error) {
      setView((current) => ({ ...current, message: onError(error) }))
    } finally {
      setBusy(null)
    }
  }

  const onCopy = async () => {
    if (revealed === null) return
    try {
      await navigator.clipboard.writeText(revealed.secret)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const active = view.keys.filter((key) => key.status === 'active').length

  return (
    <>
      <PageHeader
        title="API-Keys"
        lead="Zugangsschlüssel für den KI-Proxy. Der Schlüssel selbst wird genau einmal angezeigt — danach kennt ihn nur noch das Gateway als Prüfsumme."
      />

      {view.message !== null && (
        <p className="ui-alert" role="alert">
          {view.message}
        </p>
      )}

      {revealed !== null && (
        <Card title="Neuer Schlüssel — jetzt kopieren">
          <p className="ui-alert ui-alert--info" role="status">
            Dieser Schlüssel wird nur jetzt angezeigt. Später lässt er sich nicht mehr anzeigen —
            dann hilft nur noch ein neuer Schlüssel (Rotation).
          </p>
          <pre className="key-secret">
            <code>{revealed.secret}</code>
          </pre>
          {revealed.revokedOld === false && (
            <p className="ui-alert" role="alert">
              Der alte Schlüssel konnte nicht widerrufen werden. Bitte ihn unten noch einmal
              widerrufen.
            </p>
          )}
          <div className="ui-form__actions">
            <Button onClick={() => void onCopy()}>{copied ? 'Kopiert' : 'Kopieren'}</Button>
            <Button variant="outline" onClick={() => setRevealed(null)}>
              Ausblenden
            </Button>
          </div>
          <p className="muted">
            Trage ihn jetzt in dein Werkzeug ein (z. B. opencode: <code>OPENAI_API_KEY</code>,{' '}
            <code>OPENAI_BASE_URL</code> = Proxy-Adresse).
          </p>
        </Card>
      )}

      <Card title="Neuen Schlüssel erzeugen">
        <form className="ui-form" onSubmit={onCreate} noValidate>
          <div className="ui-field">
            <label className="ui-field__label" htmlFor="key-label">
              Bezeichnung (optional)
            </label>
            <input
              className="ui-input"
              id="key-label"
              name="label"
              type="text"
              maxLength={64}
              placeholder="z. B. Laptop · opencode"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
            <p className="ui-field__hint">
              Hilft dir, die Schlüssel auseinanderzuhalten. {active} von {view.limit} aktiven
              Schlüsseln belegt.
            </p>
          </div>
          <div className="ui-form__actions">
            <Button type="submit" disabled={busy !== null || view.status === 'error'}>
              {busy === 'create' ? 'Wird erzeugt …' : 'Schlüssel erzeugen'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Deine Schlüssel">
        {view.status === 'loading' && <p className="muted">Schlüssel werden geladen …</p>}
        {view.status !== 'loading' && view.keys.length === 0 && (
          <p className="muted">Noch kein Schlüssel vorhanden.</p>
        )}
        {view.keys.length > 0 && (
          <Table caption="Aktive und widerrufene Schlüssel">
            <thead>
              <tr>
                <th scope="col">Bezeichnung</th>
                <th scope="col">Erstellt</th>
                <th scope="col">Zuletzt verwendet</th>
                <th scope="col">Status</th>
                <th scope="col">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {view.keys.map((key) => (
                <tr key={key.token}>
                  <td>
                    {keyTitle(key)}
                    {key.status === 'revoked' && key.revokedAt !== null && (
                      <div className="muted">widerrufen am {formatTimestamp(key.revokedAt)}</div>
                    )}
                  </td>
                  <td>{formatTimestamp(key.createdAt)}</td>
                  <td>{formatTimestamp(key.lastUsedAt)}</td>
                  <td>
                    <span className={`status-badge status-badge--${key.status}`}>
                      {keyStatusLabel(key.status)}
                    </span>
                  </td>
                  <td>
                    {key.status !== 'active' ? (
                      <span className="muted">–</span>
                    ) : pendingRevoke === key.token ? (
                      <span className="key-actions">
                        <Button
                          variant="outline"
                          onClick={() => void onRevoke(key)}
                          disabled={busy !== null}
                        >
                          {busy === `revoke:${key.token}`
                            ? 'Wird widerrufen …'
                            : 'Wirklich widerrufen'}
                        </Button>
                        <Button variant="outline" onClick={() => setPendingRevoke(null)}>
                          Abbrechen
                        </Button>
                      </span>
                    ) : (
                      <span className="key-actions">
                        <Button
                          variant="outline"
                          onClick={() => void onRotate(key)}
                          disabled={busy !== null}
                          aria-label={`Schlüssel ${keyTitle(key)} rotieren`}
                        >
                          {busy === `rotate:${key.token}` ? 'Rotiert …' : 'Rotieren'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setPendingRevoke(key.token)}
                          disabled={busy !== null}
                          aria-label={`Schlüssel ${keyTitle(key)} widerrufen`}
                        >
                          Widerrufen
                        </Button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <p className="muted">
          Rotieren erzeugt einen neuen Schlüssel mit derselben Bezeichnung und widerruft den alten.
          Widerrufene Schlüssel bleiben hier als Nachweis sichtbar.
        </p>
      </Card>
    </>
  )
}
