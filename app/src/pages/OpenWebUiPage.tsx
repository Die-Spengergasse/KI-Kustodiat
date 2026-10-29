import { PageHeader, Prose } from '../components/ui'
import type { PublicRoute } from '../routes'

export function OpenWebUiPage({ route }: { route: PublicRoute }) {
  return (
    <>
      <PageHeader title={route.heading} />
      <Prose>
        <p>Platzhalter für die Open-WebUI-Anleitung (Zugang und eigenen Modell-Zugang).</p>
      </Prose>
    </>
  )
}
