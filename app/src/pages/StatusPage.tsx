import { PageHeader, Prose } from '../components/ui'
import type { PublicRoute } from '../routes'

export function StatusPage({ route }: { route: PublicRoute }) {
  return (
    <>
      <PageHeader title={route.heading} />
      <Prose>
        <p>Platzhalter für den Betriebsstatus. Inhalte folgen mit der Website-Migration.</p>
      </Prose>
    </>
  )
}
