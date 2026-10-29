import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from 'react'

export type ButtonVariant = 'primary' | 'outline'

type SharedProps = {
  children: ReactNode
  /** `primary` = filled, `outline` = transparent with primary border and text. */
  variant?: ButtonVariant
  className?: string
}

/**
 * Link-capable button: with `href` it renders an `<a>` (real navigation,
 * middle-click, "open in new tab"), without it a `<button>`.
 *
 * The API is deliberately small — the portal will extend it with the variants
 * it actually needs instead of guessing them now.
 */
export type ButtonProps = SharedProps &
  (
    | ({ href: string } & Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'title' | 'aria-label'>)
    | ({ href?: undefined } & Pick<
        ButtonHTMLAttributes<HTMLButtonElement>,
        'type' | 'disabled' | 'title' | 'aria-label'
      >)
  ) & {
    onClick?: MouseEventHandler<HTMLElement>
  }

export function Button(props: ButtonProps) {
  const { children, variant = 'primary', className } = props
  const classes = ['ui-button', `ui-button--${variant}`, className].filter(Boolean).join(' ')

  if (props.href !== undefined) {
    return (
      <a
        className={classes}
        href={props.href}
        onClick={props.onClick}
        title={props.title}
        aria-label={props['aria-label']}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      className={classes}
      type={props.type ?? 'button'}
      onClick={props.onClick}
      disabled={props.disabled}
      title={props.title}
      aria-label={props['aria-label']}
    >
      {children}
    </button>
  )
}
