import { PageHeader, Prose } from '../components/ui'
import type { PublicRoute } from '../routes'

export function FaqPage({ route }: { route: PublicRoute }) {
  return (
    <>
      <PageHeader title={route.heading} />
      <Prose>
        <p>Platzhalter für häufig gestellte Fragen.</p>
      </Prose>
    </>
  )
}
