import { MarkdownContent } from '../components/MarkdownContent'
import { Prose } from '../components/ui'
import { HOME_MARKDOWN } from '../lib/content'

/**
 * Start page. The text, the headline and the link collection all come from
 * `website/content/index.md`; the Markdown supplies the `<h1>`, so no
 * `PageHeader` is rendered here.
 */
export function HomePage() {
  return (
    <Prose className="home">
      <MarkdownContent markdown={HOME_MARKDOWN} />
    </Prose>
  )
}
