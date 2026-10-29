import type { PublicRoute } from '../routes'

export function OpenWebUiPage({ route }: { route: PublicRoute }) {
  return (
    <>
      <h1>{route.heading}</h1>
      <p>Platzhalter für die Open-WebUI-Anleitung (Zugang und eigenen Modell-Zugang).</p>
    </>
  )
}
