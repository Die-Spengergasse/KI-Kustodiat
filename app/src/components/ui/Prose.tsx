import type { ReactNode } from 'react'

export interface ProseProps {
  children: ReactNode
  className?: string
}

/**
 * Wrapper for rendered Markdown (later: the prerendered `website/content/*.md`
 * pipeline). Element styling is global so markdown output needs no class names;
 * this only marks the content column and applies the lead/rhythm extras.
 */
export function Prose({ children, className }: ProseProps) {
  return <div className={['prose', className].filter(Boolean).join(' ')}>{children}</div>
}
