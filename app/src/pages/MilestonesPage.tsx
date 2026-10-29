import type { PublicRoute } from '../routes'

export function MilestonesPage({ route }: { route: PublicRoute }) {
  return (
    <>
      <h1>{route.heading}</h1>
      <p>Platzhalter für Meilensteine und Projektfortschritt.</p>
    </>
  )
}
