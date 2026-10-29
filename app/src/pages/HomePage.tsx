import { PageHeader, Prose } from '../components/ui'
import type { PublicRoute } from '../routes'

export function HomePage({ route }: { route: PublicRoute }) {
  return (
    <>
      <PageHeader title={route.heading} />
      <Prose>
        <p>
          Platzhalter der Startseite. Die echten Inhalte werden später aus{' '}
          <code>website/content/index.md</code> vorgerendert.
        </p>
      </Prose>
    </>
  )
}
