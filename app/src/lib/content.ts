/**
 * Page content lives in the old static site (`website/content/*.md`) and stays
 * there: the app imports the files with Vite's `?raw` loader, so the build inlines
 * exactly the text the live site serves. Nothing is copied into `app/` — editing
 * `website/content/<slug>.md` and rebuilding is the whole workflow.
 *
 * `CONTENT_MARKDOWN` is keyed by `PublicRoutePath`, so a route added to
 * `src/routes.ts` fails the type check until its document is wired up here.
 */

import anleitungMarkdown from '../../../website/content/anleitung.md?raw'
import angeboteMarkdown from '../../../website/content/angebote.md?raw'
import faqMarkdown from '../../../website/content/faq.md?raw'
import homeMarkdown from '../../../website/content/index.md?raw'
import milestonesMarkdown from '../../../website/content/milestones.md?raw'
import openWebUiMarkdown from '../../../website/content/openwebui-anleitung.md?raw'
import statusMarkdown from '../../../website/content/status.md?raw'
import type { PublicRoutePath } from '../routes'

export const CONTENT_MARKDOWN: Record<PublicRoutePath, string> = {
  '/': homeMarkdown,
  '/status': statusMarkdown,
  '/milestones': milestonesMarkdown,
  '/angebote': angeboteMarkdown,
  '/faq': faqMarkdown,
  '/anleitung': anleitungMarkdown,
  '/openwebui-anleitung': openWebUiMarkdown,
}

export const HOME_MARKDOWN: string = CONTENT_MARKDOWN['/']
