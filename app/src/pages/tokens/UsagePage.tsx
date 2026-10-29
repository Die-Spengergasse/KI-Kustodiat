import { useCallback, useEffect, useState } from 'react'
import { Card, PageHeader, Table } from '../../components/ui'
import { PortalApiError } from '../../lib/portalApi'
import {
  fetchUsageSummary,
  formatPercent,
  formatResetDate,
  formatTokens,
  modelPercent,
  type UsageSummary,
} from '../../lib/portalUsage'

interface UsagePageProps {
  onSessionExpired: () => void
}

type View =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; summary: UsageSummary }

/**
 * `/tokens/usage` (Issue #48): this month's tokens and spend per model, shown as
 * a share of the monthly allowance (percent) plus token counts — no USD figure
 * as the headline, per the 2026-10-29 decision.
 */
export function UsagePage({ onSessionExpired }: UsagePageProps) {
  const [view, setView] = useState<View>({ status: 'loading' })

  const load = useCallback(async () => {
    try {
      setView({ status: 'ready', summary: await fetchUsageSummary() })
    } catch (error) {
      if (error instanceof PortalApiError && error.status === 401) {
        onSessionExpired()
        setView({ status: 'error', message: 'Die Sitzung ist abgelaufen. Bitte neu anmelden.' })
        return
      }
      const message =
        error instanceof PortalApiError && error.body.message !== undefined
          ? error.body.message
          : 'Der Verbrauch ist gerade nicht abrufbar. Bitte später erneut versuchen.'
      setView({ status: 'error', message })
    }
  }, [onSessionExpired])

  useEffect(() => {
    void load()
  }, [load])

  if (view.status === 'loading') {
    return (
      <>
        <PageHeader title="Verbrauch" />
        <p className="muted">Verbrauch wird geladen …</p>
      </>
    )
  }

  if (view.status === 'error') {
    return (
      <>
        <PageHeader title="Verbrauch" />
        <p className="ui-alert" role="alert">
          {view.message}
        </p>
      </>
    )
  }

  const { summary } = view
  const percent = summary.allowance.percentUsed
  const meterWidth = percent === null ? 0 : Math.max(0, Math.min(100, percent))

  return (
    <>
      <PageHeader
        title="Verbrauch"
        lead={`${summary.label}: Tokens und Anteil am Monatskontingent. Das Kontingent gilt für alle deine Schlüssel gemeinsam.`}
      />

      <Card title="Monatskontingent">
        {summary.allowance.monthlyUsd === null ? (
          <p className="muted">
            Für dein Konto ist derzeit kein Monatskontingent hinterlegt. Anfragen sind möglich,
            solange das Gateway sie zulässt.
          </p>
        ) : (
          <div className="usage-meter">
            <p className="usage-meter__value">{formatPercent(percent)}</p>
            <p className="muted">des Monatskontingents verbraucht</p>
            <div
              className="meter"
              role="progressbar"
              aria-label="Anteil am Monatskontingent"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={meterWidth}
            >
              <span className="meter__bar" style={{ width: `${meterWidth}%` }} />
            </div>
            <p className="ui-field__hint">
              Kontingent:{' '}
              {new Intl.NumberFormat('de-AT', { minimumFractionDigits: 2 }).format(
                summary.allowance.monthlyUsd,
              )}{' '}
              USD pro Monat, verwaltet und durchgesetzt vom Gateway. Nächster Reset:{' '}
              {formatResetDate(summary.allowance.resetAt)}.
            </p>
          </div>
        )}

        <dl className="stat-grid">
          <div>
            <dt>Eingabe-Tokens</dt>
            <dd>{formatTokens(summary.totals.promptTokens)}</dd>
          </div>
          <div>
            <dt>Ausgabe-Tokens</dt>
            <dd>{formatTokens(summary.totals.completionTokens)}</dd>
          </div>
          <div>
            <dt>Anfragen</dt>
            <dd>{formatTokens(summary.totals.requests)}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Nach Modell">
        {summary.models.length === 0 ? (
          <p className="muted">Diesen Monat wurden noch keine Anfragen verzeichnet.</p>
        ) : (
          <Table caption={`Verbrauch im ${summary.label} pro Modell`}>
            <thead>
              <tr>
                <th scope="col">Modell</th>
                <th scope="col">Eingabe-Tokens</th>
                <th scope="col">Ausgabe-Tokens</th>
                <th scope="col">Anteil am Kontingent</th>
                <th scope="col">Anfragen</th>
              </tr>
            </thead>
            <tbody>
              {summary.models.map((row) => (
                <tr key={row.model}>
                  <td>
                    <code>{row.model}</code>
                  </td>
                  <td>{formatTokens(row.promptTokens)}</td>
                  <td>{formatTokens(row.completionTokens)}</td>
                  <td>{formatPercent(modelPercent(row.spendUsd, summary.allowance.monthlyUsd))}</td>
                  <td>{formatTokens(row.requests)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Gesamt</th>
                <td>{formatTokens(summary.totals.promptTokens)}</td>
                <td>{formatTokens(summary.totals.completionTokens)}</td>
                <td>{formatPercent(percent)}</td>
                <td>{formatTokens(summary.totals.requests)}</td>
              </tr>
            </tfoot>
          </Table>
        )}
      </Card>
    </>
  )
}
