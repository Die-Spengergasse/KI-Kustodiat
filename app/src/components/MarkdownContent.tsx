import type { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown, { type Components, type ExtraProps } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { resolveMarkdownHref } from '../lib/markdown'
import { Table } from './ui/Table'

/**
 * Renders a Markdown document — in practice `website/content/**\/*.md` — through
 * the app's own primitives instead of injected HTML.
 *
 * The one transform left over from the old site is link rewriting: `.md` links
 * (`status.md`, `anleitung/tokens.md`) and legacy `#/<slug>` links become the
 * real route paths (`/status`, `/anleitung/tokens`). The old "link-only
 * paragraph becomes buttons" transform is gone — the start page lays its
 * sections out as tiles instead (`HomePage`).
 *
 * `react-markdown` (rather than `dangerouslySetInnerHTML`) keeps the output
 * tree-shaped, so the component map below decides the markup and the design
 * tokens apply exactly as they do for hand-written JSX. Rendering is
 * deterministic, which is what lets the prerendered HTML hydrate without a
 * mismatch.
 */

function MarkdownLink({
  node: _node,
  href,
  children,
  ...rest
}: ComponentPropsWithoutRef<'a'> & ExtraProps) {
  if (href === undefined) {
    return <a {...rest}>{children}</a>
  }
  return (
    <a {...rest} href={resolveMarkdownHref(href)}>
      {children}
    </a>
  )
}

/**
 * The component map: one entry per Markdown element that needs a decision. Every
 * page uses the same map, so the markup stays deterministic between prerender
 * and hydration.
 */
const COMPONENTS: Components = {
  h1: ({ node: _node, ...props }) => <h1 {...props} />,
  h2: ({ node: _node, ...props }) => <h2 {...props} />,
  h3: ({ node: _node, ...props }) => <h3 {...props} />,
  ul: ({ node: _node, ...props }) => <ul {...props} />,
  ol: ({ node: _node, ...props }) => <ol {...props} />,
  li: ({ node: _node, ...props }) => <li {...props} />,
  a: MarkdownLink,
  strong: ({ node: _node, ...props }) => <strong {...props} />,
  em: ({ node: _node, ...props }) => <em {...props} />,
  code: ({ node: _node, ...props }) => <code {...props} />,
  blockquote: ({ node: _node, ...props }) => <blockquote {...props} />,
  hr: ({ node: _node, ...props }) => <hr {...props} />,
  // Tables always get the horizontal scroll wrapper of the old site.
  table: ({ node: _node, children }) => <Table>{children}</Table>,
  th: ({ node: _node, ...props }) => <th {...props} />,
  td: ({ node: _node, ...props }) => <td {...props} />,
}

const REMARK_PLUGINS = [remarkGfm]

export interface MarkdownContentProps {
  /** Markdown source, inlined at build time via Vite's `?raw` import. */
  markdown: string
}

export function MarkdownContent({ markdown }: MarkdownContentProps) {
  return (
    <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={COMPONENTS}>
      {markdown}
    </ReactMarkdown>
  )
}
