import { normalizeRoutePath } from './routes'

/**
 * Development-only tooling routes. They are intentionally **not** part of
 * `PUBLIC_ROUTES`, never prerendered, and unreachable in a production build:
 * `App` renders them only under `import.meta.env.DEV` (so the components are
 * tree-shaken out of the client bundle) and the production server answers 404
 * for every path the route table does not know.
 */

export const DESIGN_ROUTE_PATH = '/_design'

export function isDesignRoute(input: string): boolean {
  return normalizeRoutePath(input) === DESIGN_ROUTE_PATH
}
