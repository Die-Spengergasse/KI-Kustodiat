import { PageHeader, Prose } from '../components/ui'

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Seite nicht gefunden" />
      <Prose>
        <p>Diese Adresse gibt es nicht (mehr).</p>
        <p>
          <a href="/">Zur Startseite</a>
        </p>
      </Prose>
    </>
  )
}
