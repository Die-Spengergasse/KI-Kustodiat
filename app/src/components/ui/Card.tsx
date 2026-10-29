import type { ReactNode } from 'react'

export interface CardProps {
  children: ReactNode
  /** Optional heading rendered at the top of the card. */
  title?: string
  /** Heading level for {@link CardProps.title}; defaults to `h3`. */
  titleAs?: 'h2' | 'h3' | 'h4'
  /** Optional footer separated by a hairline (Pico's `article > footer`). */
  footer?: ReactNode
  className?: string
}

/** Surface container with Pico's `article` radius and elevation. */
export function Card({ children, title, titleAs: Title = 'h3', footer, className }: CardProps) {
  return (
    <article className={['ui-card', className].filter(Boolean).join(' ')}>
      {title !== undefined && <Title className="ui-card__title">{title}</Title>}
      {children}
      {footer !== undefined && <footer className="ui-card__footer">{footer}</footer>}
    </article>
  )
}
