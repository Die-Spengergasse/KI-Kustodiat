import type { PublicRoute } from '../routes'

export function FaqPage({ route }: { route: PublicRoute }) {
  return (
    <>
      <h1>{route.heading}</h1>
      <p>Platzhalter für häufig gestellte Fragen.</p>
    </>
  )
}
