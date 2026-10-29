import type { PublicRoute } from '../routes'

export function StatusPage({ route }: { route: PublicRoute }) {
  return (
    <>
      <h1>{route.heading}</h1>
      <p>Platzhalter für den Betriebsstatus. Inhalte folgen mit der Website-Migration.</p>
    </>
  )
}
