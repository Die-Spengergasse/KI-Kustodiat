import type { ReactNode } from 'react'
import { ThemeToggle } from './ThemeToggle'

export interface ShellProps {
  children: ReactNode
}

const LOGO_LIGHT = '/assets/spengergasse-logo.png'
const LOGO_DARK = '/assets/spengergasse-logo-dark.png'

/**
 * Page frame shared by the public site and the portal: skip link, header with
 * brand, theme toggle and the light/dark logo, the main region and the footer.
 *
 * The header deliberately carries no route navigation: the old site had none
 * either — every page is reached through the links inside the page content
 * (`website/content/*.md`). Keeping the frame that way is what makes the
 * prerendered start page look exactly like the live one.
 */
export function Shell({ children }: ShellProps) {
  return (
    <>
      <a className="skip-link" href="#main">
        Zum Inhalt springen
      </a>
      <header className="site-header">
        <div className="container">
          <nav className="site-header__nav">
            <ul>
              <li>
                <a className="site-header__brand" href="/">
                  <strong>KI-Kustodiat</strong>
                </a>
              </li>
            </ul>
            <ul>
              <li>
                <ThemeToggle />
              </li>
              <li>
                <a className="logo" href="/" aria-label="HTL Spengergasse — Startseite">
                  <img className="logo-light" src={LOGO_LIGHT} alt="HTL Spengergasse" />
                  <img className="logo-dark" src={LOGO_DARK} alt="" aria-hidden="true" />
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
