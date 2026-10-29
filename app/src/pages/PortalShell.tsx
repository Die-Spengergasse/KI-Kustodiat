/**
 * Shell for the authenticated area. Deliberately client-rendered: `/portal/*` is
 * served as an empty document and filled by the browser bundle (noindex).
 */
export function PortalShell() {
  return (
    <>
      <h1>Portal</h1>
      <p>
        Client-gerenderte Shell. Login, Key-Verwaltung und Verbrauch folgen in den nächsten
        Arbeitsschritten zu Issue&nbsp;#35.
      </p>
    </>
  )
}
