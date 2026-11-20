import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button, Card, PageHeader, Table } from '../../components/ui'
import { PortalApiError } from '../../lib/portalApi'
import {
  fetchAdminUsers,
  formatResetDate,
  formatUsd,
  grantCredit,
  parseAmountUsd,
  roleLabelOf,
  type AdminUser,
  type AdminUserList,
} from '../../lib/portalAdmin'

interface AdminPageProps {
  csrfToken: string | null
  /** Called when the session died; the shell then shows the login form again. */
  onSessionExpired: () => void
}

type View =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: AdminUserList }

interface TopUpForm {
  user: AdminUser
  amount: string
  note: string
  /** `confirm` shows the consequence before anything is written. */
  step: 'edit' | 'confirm'
}

/**
 * `/tokens/admin` (Issue #64): raise one account's monthly allowance.
 *
 * The page is an operating surface, not a self-service page — it shows USD
 * because an admin has to type an amount, and it deliberately offers no "reset
 * spend": raising the allowance is the one supported way out of a lockout.
 */
export function AdminPage({ csrfToken, onSessionExpired }: AdminPageProps) {
  const [view, setView] = useState<View>({ status: 'loading' })
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [form, setForm] = useState<TopUpForm | null>(null)
  const [amountError, setAmountError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onError = useCallback(
    (cause: unknown): string => {
      if (cause instanceof PortalApiError) {
        if (cause.status === 401) {
          onSessionExpired()
          return 'Die Sitzung ist abgelaufen. Bitte neu anmelden.'
        }
        if (cause.body.message !== undefined) return cause.body.message
        if (cause.status === 503) return 'Die Tokenverwaltung ist noch nicht fertig eingerichtet.'
      }
      return 'Der Gateway ist gerade nicht erreichbar. Bitte später erneut versuchen.'
    },
    [onSessionExpired],
  )

  const load = useCallback(
    async (search: string) => {
      try {
        const data = await fetchAdminUsers(search)
        setView({ status: 'ready', data })
      } catch (cause) {
        setView({ status: 'error', message: onError(cause) })
      }
    },
    [onError],
  )

  useEffect(() => {
    void load('')
  }, [load])

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    setMessage(null)
    setError(null)
    setForm(null)
    setAppliedQuery(query.trim())
    setView({ status: 'loading' })
    void load(query.trim())
  }

  const onStart = (user: AdminUser) => {
    setAmountError(null)
    setMessage(null)
    setError(null)
    setForm({ user, amount: '', note: '', step: 'edit' })
  }

  const onPreview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (form === null || view.status !== 'ready') return
    const amount = parseAmountUsd(form.amount)
    if (amount === null) {
      setAmountError('Bitte gib einen Betrag an, zum Beispiel 2,50.')
      return
    }
    if (amount > view.data.maxCreditUsd) {
      setAmountError(`Pro Aufladung sind höchstens ${formatUsd(view.data.maxCreditUsd)} möglich.`)
      return
    }
    if (form.user.maxBudgetUsd === null) {
      setAmountError('Für dieses Konto ist noch kein Monatskontingent hinterlegt.')
      return
    }
    setAmountError(null)
    setForm({ ...form, step: 'confirm' })
  }

  const onConfirm = async () => {
    if (form === null || busy) return
    const amount = parseAmountUsd(form.amount)
    if (amount === null) {
      setForm({ ...form, step: 'edit' })
      setAmountError('Bitte gib einen Betrag an, zum Beispiel 2,50.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const updated = await grantCredit({
        sam: form.user.sam,
        amountUsd: amount,
        note: form.note,
        csrfToken,
      })
      setMessage(
        `${formatUsd(amount)} für ${updated.displayName} aufgeladen. Neues Kontingent: ${formatUsd(
          updated.maxBudgetUsd,
        )}.`,
      )
      setForm(null)
      await load(appliedQuery)
    } catch (cause) {
      setError(onError(cause))
    } finally {
      setBusy(false)
    }
  }

  if (view.status === 'loading') {
    return (
      <>
        <PageHeader title="Guthaben" />
        <p className="muted">Konten werden geladen …</p>
      </>
    )
  }

  if (view.status === 'error') {
    return (
      <>
        <PageHeader title="Guthaben" />
        <p className="ui-alert" role="alert">
          {view.message}
        </p>
      </>
    )
  }

  const { users, maxCreditUsd, limit } = view.data

  return (
    <>
      <PageHeader
        title="Guthaben"
        lead="Monatskontingent eines Kontos erhöhen. Die Gutschrift gilt bis zum nächsten Reset und wird im Protokoll festgehalten."
      />

      {message !== null && (
        <p className="ui-alert ui-alert--info" role="status">
          {message}
        </p>
      )}
      {error !== null && (
        <p className="ui-alert" role="alert">
          {error}
        </p>
      )}

      <Card title="Konten">
        <form className="ui-form" onSubmit={onSearch}>
          <div className="ui-field">
            <label className="ui-field__label" htmlFor="admin-search">
              Suchen
            </label>
            <input
              className="ui-input"
              id="admin-search"
              name="q"
              type="search"
              placeholder="Kürzel oder Name"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <p className="ui-field__hint">
              {users.length === limit
                ? `Die ersten ${limit} Treffer werden angezeigt – grenze die Suche ein.`
                : `${users.length} Konto${users.length === 1 ? '' : 'en'} gefunden.`}
            </p>
          </div>
          <div className="ui-form__actions">
            <Button type="submit" variant="outline" disabled={busy}>
              Suchen
            </Button>
          </div>
        </form>

        {users.length === 0 ? (
          <p className="muted">Kein Konto gefunden.</p>
        ) : (
          <Table caption="Konten mit Monatskontingent und Verbrauch">
            <thead>
              <tr>
                <th scope="col">Konto</th>
                <th scope="col">Rolle</th>
                <th scope="col">Kontingent</th>
                <th scope="col">Verbrauch</th>
                <th scope="col">Verfügbar</th>
                <th scope="col">Aufgeladen</th>
                <th scope="col">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.sam}>
                  <td>
                    <strong>{user.displayName}</strong>
                    <br />
                    <span className="muted">{user.sam}</span>
                  </td>
                  <td>{roleLabelOf(user.role)}</td>
                  <td>
                    {formatUsd(user.maxBudgetUsd)}
                    {user.resetAt !== null && (
                      <>
                        <br />
                        <span className="muted">Reset: {formatResetDate(user.resetAt)}</span>
                      </>
                    )}
                  </td>
                  <td>{user.maxBudgetUsd === null ? '–' : formatUsd(user.spendUsd)}</td>
                  <td>{formatUsd(user.availableUsd)}</td>
                  <td>{user.grantedUsd === 0 ? '–' : formatUsd(user.grantedUsd)}</td>
                  <td>
                    <Button
                      variant="outline"
                      onClick={() => onStart(user)}
                      disabled={busy || user.maxBudgetUsd === null}
                      aria-label={`Guthaben für ${user.displayName} aufladen`}
                      title={
                        user.maxBudgetUsd === null
                          ? 'Noch kein Monatskontingent – es entsteht mit dem ersten API-Key.'
                          : undefined
                      }
                    >
                      Aufladen
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {form !== null && (
        <Card title={`Guthaben aufladen für ${form.user.displayName}`}>
          {form.step === 'edit' ? (
            <form className="ui-form" onSubmit={onPreview}>
              <div className="ui-field">
                <label className="ui-field__label" htmlFor="admin-amount">
                  Betrag (USD)
                </label>
                <input
                  className="ui-input"
                  id="admin-amount"
                  name="amount"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="z. B. 2,50"
                  aria-invalid={amountError !== null}
                  aria-describedby="admin-amount-hint"
                  value={form.amount}
                  onChange={(event) => {
                    setForm({ ...form, amount: event.target.value })
                    setAmountError(null)
                  }}
                />
                <p className="ui-field__hint" id="admin-amount-hint">
                  Aktuelles Kontingent {formatUsd(form.user.maxBudgetUsd)}, verbraucht{' '}
                  {formatUsd(form.user.spendUsd)}. Höchstens {formatUsd(maxCreditUsd)} pro
                  Aufladung.
                </p>
                {amountError !== null && (
                  <p className="ui-field__error" role="alert">
                    {amountError}
                  </p>
                )}
              </div>
              <div className="ui-field">
                <label className="ui-field__label" htmlFor="admin-note">
                  Notiz (optional)
                </label>
                <textarea
                  className="ui-input"
                  id="admin-note"
                  name="note"
                  rows={2}
                  maxLength={200}
                  placeholder="z. B. Diktat-Marathon im Projektunterricht"
                  value={form.note}
                  onChange={(event) => setForm({ ...form, note: event.target.value })}
                />
                <p className="ui-field__hint">Bleibt im Guthaben-Protokoll sichtbar.</p>
              </div>
              <div className="ui-form__actions">
                <Button type="submit">Weiter</Button>
                <Button type="button" variant="outline" onClick={() => setForm(null)}>
                  Abbrechen
                </Button>
              </div>
            </form>
          ) : (
            <>
              <p>
                Kontingent von <strong>{form.user.displayName}</strong>:{' '}
                {formatUsd(form.user.maxBudgetUsd)} →{' '}
                <strong>{formatUsd(nextMax(form.user, form.amount))}</strong>
                {form.user.resetAt !== null && <> (Reset: {formatResetDate(form.user.resetAt)})</>}.
              </p>
              {form.note.trim() !== '' && <p className="muted">Notiz: {form.note.trim()}</p>}
              <p className="ui-field__hint">
                Die Erhöhung gilt bis zum nächsten Reset. Der Verbrauch bleibt unverändert.
              </p>
              <div className="ui-form__actions">
                <Button type="button" onClick={() => void onConfirm()} disabled={busy}>
                  {busy ? 'Wird aufgeladen …' : 'Jetzt aufladen'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm({ ...form, step: 'edit' })}
                  disabled={busy}
                >
                  Zurück
                </Button>
              </div>
            </>
          )}
        </Card>
      )}
    </>
  )
}

/** Display-only preview of the new allowance; the server does the real arithmetic. */
function nextMax(user: AdminUser, amount: string): number | null {
  const parsed = parseAmountUsd(amount)
  if (parsed === null || user.maxBudgetUsd === null) return null
  return Math.round((user.maxBudgetUsd + parsed) * 100) / 100
}
