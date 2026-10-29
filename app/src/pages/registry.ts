import type { ComponentType } from 'react'
import type { PublicRoute, PublicRoutePath } from '../routes'
import { AngebotePage } from './AngebotePage'
import { FaqPage } from './FaqPage'
import { HomePage } from './HomePage'
import { MilestonesPage } from './MilestonesPage'
import { NotFoundPage } from './NotFoundPage'
import { OpenWebUiPage } from './OpenWebUiPage'
import { StatusPage } from './StatusPage'

export type PageComponent = ComponentType<{ route: PublicRoute }>

/**
 * `Record<PublicRoutePath, …>` makes the compiler fail when a route from
 * `src/routes.ts` has no page component (and the other way round).
 */
export const PUBLIC_PAGE_COMPONENTS: Record<PublicRoutePath, PageComponent> = {
  '/': HomePage,
  '/status': StatusPage,
  '/milestones': MilestonesPage,
  '/angebote': AngebotePage,
  '/faq': FaqPage,
  '/openwebui-anleitung': OpenWebUiPage,
}

export { NotFoundPage }
