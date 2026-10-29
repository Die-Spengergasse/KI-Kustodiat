import type { ReactNode } from 'react'

export interface TableProps {
  children: ReactNode
  /** Optional `<caption>` text. */
  caption?: string
  className?: string
}

/**
 * Table with the horizontal scroll wrapper the old site injected around every
 * rendered markdown table (`website/app.js` → `.table-scroll`): long tables
 * scroll inside the content column instead of stretching the page.
 */
export function Table({ children, caption, className }: TableProps) {
  return (
    <div className="table-scroll">
      <table className={className}>
        {caption !== undefined && <caption>{caption}</caption>}
        {children}
      </table>
    </div>
  )
}
