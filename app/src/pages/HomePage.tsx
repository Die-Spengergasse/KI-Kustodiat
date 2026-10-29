import type { PublicRoute } from '../routes'

export function HomePage({ route }: { route: PublicRoute }) {
  return (
    <>
      <h1>{route.heading}</h1>
      <p>
        Platzhalter der Startseite. Die echten Inhalte werden später aus{' '}
        <code>website/content/index.md</code> vorgerendert.
      </p>
    </>
  )
}
