import type { ReactNode } from 'react'
import { PUBLIC_ROUTES, isPortalPath, matchPublicRoute } from './routes'
import { PortalShell } from './pages/PortalShell'
import { NotFoundPage, PUBLIC_PAGE_COMPONENTS } from './pages/registry'

/**
 * Route resolution is pure: the same `path` is passed in by the prerender step and
 * by the browser entry, so server markup and hydration always agree.
 */
export function App({ path }: { path: string }) {
  if (isPortalPath(path)) {
    return (
      <Layout path={path}>
        <PortalShell />
      </Layout>
    )
  }

  const route = matchPublicRoute(path)
  const Page = route === undefined ? undefined : PUBLIC_PAGE_COMPONENTS[route.path]

  return (
    <Layout path={path}>
      {route === undefined || Page === undefined ? <NotFoundPage /> : <Page route={route} />}
    </Layout>
  )
}

function Layout({ path, children }: { path: string; children: ReactNode }) {
  return (
    <>
      <header className="site-header">
        <nav className="site-nav" aria-label="Hauptnavigation">
          <ul>
            {PUBLIC_ROUTES.map((route) => (
              <li key={route.path}>
                <a href={route.path} aria-current={route.path === path ? 'page' : undefined}>
                  {route.heading}
                </a>
              </li>
            ))}
            <li>
              <a href="/portal">Portal</a>
            </li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <p>KI-Kustodiat — HTL Spengergasse</p>
      </footer>
    </>
  )
}
