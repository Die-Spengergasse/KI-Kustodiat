import { PageHeader, Prose } from '../components/ui'

/**
 * Shell for the authenticated area. Deliberately client-rendered: `/portal/*` is
 * served as an empty document and filled by the browser bundle (noindex).
 */
export function PortalShell() {
  return (
    <>
      <PageHeader title="Portal" />
      <Prose>
        <p>
          Client-gerenderte Shell. Login, Key-Verwaltung und Verbrauch folgen in den nächsten
          Arbeitsschritten zu Issue&nbsp;#35.
        </p>
      </Prose>
    </>
  )
}
