import { PageHeader, Prose } from '../components/ui'
import type { PublicRoute } from '../routes'

export function AngebotePage({ route }: { route: PublicRoute }) {
  return (
    <>
      <PageHeader title={route.heading} />
      <Prose>
        <p>Platzhalter für Token-Preise, Gratis- und Bildungsangebote.</p>
      </Prose>
    </>
  )
}
