import type { PublicRoute } from '../routes'

export function AngebotePage({ route }: { route: PublicRoute }) {
  return (
    <>
      <h1>{route.heading}</h1>
      <p>Platzhalter für Token-Preise, Gratis- und Bildungsangebote.</p>
    </>
  )
}
