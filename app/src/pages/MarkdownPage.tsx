import { MarkdownContent } from '../components/MarkdownContent'
import { Prose } from '../components/ui'
import { CONTENT_MARKDOWN } from '../lib/content'
import type { PublicRoute } from '../routes'

/**
 * Content page of a public route: the Markdown document from
 * `website/content/<slug>.md`, rendered through the app's own primitives.
 *
 * The single element the old static page added outside the Markdown
 * (`website/index.html` → `#page .back`) is the `← Zur Startseite` link; it is
 * rendered here instead of being duplicated into every document. Unlike the
 * start page, subpages keep link-only paragraphs as plain paragraphs — the old
 * `app.js` only ran `buttonify()` on the home content.
 */
export function MarkdownPage({ route }: { route: PublicRoute }) {
  return (
    <Prose>
      <a className="page-header__back" href="/">
        ← Zur Startseite
      </a>
      <MarkdownContent markdown={CONTENT_MARKDOWN[route.path]} linkButtons={false} />
    </Prose>
  )
}
