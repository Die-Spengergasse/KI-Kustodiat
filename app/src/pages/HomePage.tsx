import { MarkdownContent } from '../components/MarkdownContent'
import { Card, Prose } from '../components/ui'
import { HOME_MARKDOWN } from '../lib/content'
import { splitMarkdownSections } from '../lib/markdown'

/**
 * Start page. The text comes from `website/content/index.md`; the headline and
 * the lead live in its intro, and every `##` group becomes one tile
 * (*Dienste*, *Tokens*, *Dokumentation*, *Diskussion*). Inside a tile the links
 * stay ordinary links — no button markup, the grouping is the navigation.
 *
 * Splitting the document (rather than hard-coding the groups in JSX) keeps the
 * start page editable in Markdown like every other page.
 */
export function HomePage() {
  const { intro, sections } = splitMarkdownSections(HOME_MARKDOWN)

  return (
    <>
      <Prose className="home">
        <MarkdownContent markdown={intro} />
      </Prose>
      <div className="tiles">
        {sections.map((section) => (
          <Card key={section.title} title={section.title} titleAs="h2">
            <Prose className="tile">
              <MarkdownContent markdown={section.body} />
            </Prose>
          </Card>
        ))}
      </div>
    </>
  )
}
