import type { ComponentType } from 'react'
import type { PublicRoute, PublicRoutePath } from '../routes'
import { HomePage } from './HomePage'
import { MarkdownPage } from './MarkdownPage'
import { NotFoundPage } from './NotFoundPage'

export type PageComponent = ComponentType<{ route: PublicRoute }>

/**
 * `Record<PublicRoutePath, …>` makes the compiler fail when a route from
 * `src/routes.ts` has no page component (and the other way round).
 *
 * Every public route except the start page is a Markdown document from
 * `website/content/`; only the start page has extra layout (`.home`, lead
 * paragraph, button cards).
 */
export const PUBLIC_PAGE_COMPONENTS: Record<PublicRoutePath, PageComponent> = {
  '/': HomePage,
  '/status': MarkdownPage,
  '/milestones': MarkdownPage,
  '/angebote': MarkdownPage,
  '/faq': MarkdownPage,
  '/anleitung/tokens': MarkdownPage,
  '/anleitung/openwebui': MarkdownPage,
}

export { NotFoundPage }
