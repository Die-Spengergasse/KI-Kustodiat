import { Shell } from './components/ui'
import { isDesignRoute } from './devRoutes'
import { isTokensPath, matchPublicRoute } from './routes'
import { DesignPage } from './pages/DesignPage'
import { TokensShell } from './pages/TokensShell'
import { NotFoundPage, PUBLIC_PAGE_COMPONENTS } from './pages/registry'

/**
 * Route resolution is pure: the same `path` is passed in by the prerender step and
 * by the browser entry, so server markup and hydration always agree.
 */
export function App({ path }: { path: string }) {
  // Dev-only style guide. `import.meta.env.DEV` is statically replaced, so neither
  // the page nor its components survive in a production build.
  if (import.meta.env.DEV && isDesignRoute(path)) {
    return (
      <Shell>
        <DesignPage />
      </Shell>
    )
  }

  if (isTokensPath(path)) {
    return (
      <Shell>
        <TokensShell path={path} />
      </Shell>
    )
  }

  const route = matchPublicRoute(path)
  const Page = route === undefined ? undefined : PUBLIC_PAGE_COMPONENTS[route.path]

  return (
    <Shell>
      {route === undefined || Page === undefined ? <NotFoundPage /> : <Page route={route} />}
    </Shell>
  )
}
