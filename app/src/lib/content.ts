/**
 * Page content lives in the old static site (`website/content/*.md`) and stays
 * there: the app imports the file with Vite's `?raw` loader, so the build inlines
 * exactly the text the live site serves. Nothing is copied into `app/` — editing
 * `website/content/index.md` and rebuilding is the whole workflow.
 */

import homeMarkdown from '../../../website/content/index.md?raw'

export const HOME_MARKDOWN: string = homeMarkdown
