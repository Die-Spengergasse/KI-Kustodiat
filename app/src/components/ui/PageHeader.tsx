import type { ReactNode } from 'react'

export interface PageHeaderProps {
  /** The page `<h1>`. */
  title: string
  /** Optional lead paragraph below the heading. */
  lead?: ReactNode
  /** Optional link back to a parent page (`← Zur Startseite`). */
  back?: { href: string; label: string }
  /** Optional action row (buttons/links) below the lead. */
  actions?: ReactNode
  className?: string
}

/** Page-level heading block: back link, `<h1>`, lead paragraph, actions. */
export function PageHeader({ title, lead, back, actions, className }: PageHeaderProps) {
  return (
    <header className={['page-header', className].filter(Boolean).join(' ')}>
      {back !== undefined && (
        <a className="page-header__back" href={back.href}>
          {back.label}
        </a>
      )}
      <h1>{title}</h1>
      {lead !== undefined && <p className="page-header__lead">{lead}</p>}
      {actions !== undefined && <div className="page-header__actions">{actions}</div>}
    </header>
  )
}
