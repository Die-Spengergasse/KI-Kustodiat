import type { ReactNode } from 'react'
import { PUBLIC_ROUTES } from '../../routes'
import { ThemeToggle } from './ThemeToggle'

export interface ShellProps {
  /** Current route path, used for `aria-current` in the navigation. */
  path: string
  children: ReactNode
}

const LOGO_LIGHT = '/assets/spengergasse-logo.png'
const LOGO_DARK = '/assets/spengergasse-logo-dark.png'

/**
 * Page frame shared by the public site and the portal: skip link, header with
 * brand, route navigation, theme toggle and the light/dark logo, the main
 * region and the footer of the old site.
 */
export function Shell({ path, children }: ShellProps) {
  return (
    <>
      <a className="skip-link" href="#main">
        Zum Inhalt springen
      </a>
      <header className="site-header">
        <div className="container">
          <div className="site-header__bar">
            <a className="site-header__brand" href="/">
              <strong>KI-Kustodiat</strong>
            </a>
            <div className="site-header__actions">
              <ThemeToggle />
              <a className="logo" href="/" aria-label="HTL Spengergasse — Startseite">
                <img className="logo-light" src={LOGO_LIGHT} alt="HTL Spengergasse" />
                <img className="logo-dark" src={LOGO_DARK} alt="" aria-hidden="true" />
              </a>
            </div>
          </div>
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
                <a href="/portal" aria-current={path.startsWith('/portal') ? 'page' : undefined}>
                  Portal
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="site-main" id="main">
        <div className="container">{children}</div>
      </main>
      <footer className="site-footer">
        <div className="container">
          <small>
            Georg Graf ·{' '}
            <a href="https://github.com/Die-Spengergasse/KI-Kustodiat">
              github.com/Die-Spengergasse/KI-Kustodiat
            </a>
          </small>
        </div>
      </footer>
    </>
  )
}
