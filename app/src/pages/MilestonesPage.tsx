import { PageHeader, Prose } from '../components/ui'
import type { PublicRoute } from '../routes'

export function MilestonesPage({ route }: { route: PublicRoute }) {
  return (
    <>
      <PageHeader title={route.heading} />
      <Prose>
        <p>Platzhalter für Meilensteine und Projektfortschritt.</p>
      </Prose>
    </>
  )
}
