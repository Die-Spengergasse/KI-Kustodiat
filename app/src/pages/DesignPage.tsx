import { Button, Card, PageHeader, Prose, Table } from '../components/ui'

/**
 * Dev-only style guide (`/_design`): every primitive in both themes side by
 * side. The route is not part of `PUBLIC_ROUTES`, is never prerendered, and is
 * only rendered when `import.meta.env.DEV` is true — in the production build the
 * component is dropped from the bundle and the server answers 404.
 */

function ButtonShowcase() {
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button>Primär</Button>
        <Button variant="outline">Outline</Button>
        <Button disabled>Deaktiviert</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button href="/status">Primär als Link</Button>
        <Button variant="outline" href="/faq">
          Outline als Link
        </Button>
      </div>
    </div>
  )
}

function CardShowcase() {
  return (
    <Card title="Karte mit Titel" footer={<small className="muted">Fußzeile der Karte</small>}>
      <p>
        Fläche, Radius und Schatten wie im bisherigen <code>article</code> der Website. Karten
        lassen sich im Raster der Startseite („cards“) einsetzen.
      </p>
    </Card>
  )
}

function TableShowcase() {
  return (
    <Table caption="Beispieltabelle mit horizontalem Scroll-Rahmen">
      <thead>
        <tr>
          <th scope="col">Modell</th>
          <th scope="col">Kontext</th>
          <th scope="col">Eingabe</th>
          <th scope="col">Ausgabe</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Beispiel eins</td>
          <td>128k</td>
          <td>0,15 € / 1M</td>
          <td>0,60 € / 1M</td>
          <td>verfügbar</td>
        </tr>
        <tr>
          <td>Beispiel zwei</td>
          <td>32k</td>
          <td>0,05 € / 1M</td>
          <td>0,20 € / 1M</td>
          <td>eingeschränkt</td>
        </tr>
      </tbody>
    </Table>
  )
}

function ProseShowcase() {
  return (
    <Prose>
      <h3>Überschrift in Prose</h3>
      <p>
        Fließtext mit <a href="/status">Link</a>, <strong>fetter</strong> und <em>kursiver</em>{' '}
        Auszeichnung sowie <code>Inline-Code</code>.
      </p>
      <ul>
        <li>Listenpunkt eins</li>
        <li>Listenpunkt zwei</li>
      </ul>
      <blockquote>
        <p>Callout mit primary-farbener Kante — der CTA-Block der Startseite.</p>
      </blockquote>
      <pre>
        <code>{'npm run dev\n# → http://127.0.0.1:8080'}</code>
      </pre>
    </Prose>
  )
}

function Primitives() {
  return (
    <div className="grid grid-cols-1 gap-4">
      <section>
        <h3>Button</h3>
        <ButtonShowcase />
      </section>
      <section>
        <h3>Card</h3>
        <CardShowcase />
      </section>
      <section>
        <h3>Table</h3>
        <TableShowcase />
      </section>
      <section>
        <h3>Prose</h3>
        <ProseShowcase />
      </section>
      <section>
        <h3>Link-Karten (Startseite)</h3>
        <div className="cards">
          <Button variant="outline" href="/status">
            Status
          </Button>
          <Button variant="outline" href="/faq">
            FAQ
          </Button>
          <Button variant="outline" href="/angebote">
            Angebote
          </Button>
        </div>
      </section>
    </div>
  )
}

const THEMES = ['light', 'dark'] as const

export function DesignPage() {
  return (
    <>
      <PageHeader
        title="Design-System"
        lead="Alle Primitives in beiden Farbschemata. Nur in der Entwicklungsumgebung erreichbar."
        back={{ href: '/', label: '← Zur Startseite' }}
        actions={
          <>
            <Button href="/">Primär als Link</Button>
            <Button variant="outline" href="/tokens">
              Outline zur Tokenverwaltung
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2" data-testid="design-previews">
        {THEMES.map((theme) => (
          <section
            key={theme}
            className="theme-preview"
            data-theme={theme}
            data-testid={`preview-${theme}`}
            aria-labelledby={`preview-${theme}-label`}
          >
            <h2 className="theme-preview__label" id={`preview-${theme}-label`}>
              Schema: {theme === 'light' ? 'Hell' : 'Dunkel'}
            </h2>
            <Primitives />
          </section>
        ))}
      </div>
    </>
  )
}
