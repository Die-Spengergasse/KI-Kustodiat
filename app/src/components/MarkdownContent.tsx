import type { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown, { type Components, type ExtraProps } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { anchorHref, hastText, linkOnlyAnchors, resolveMarkdownHref } from '../lib/markdown'
import { Button } from './ui/Button'
import { Table } from './ui/Table'

/**
 * Renders a Markdown document — in practice `website/content/*.md` — through the
 * app's own primitives instead of injected HTML.
 *
 * Two things happen here that the old site did in `website/app.js`:
 *  - `.md` links (`status.md`) and legacy `#/<slug>` links are rewritten to the
 *    real route paths (`/status`),
 *  - on the start page, a paragraph made of nothing but links becomes buttons:
 *    one link → a filled button, several links → the `.cards` grid with outline
 *    buttons. Subpages pass `linkButtons={false}` — the old site only ran that
 *    transform on `#home`, never on `#page-content`.
 *
 * `react-markdown` (rather than `dangerouslySetInnerHTML`) keeps the output
 * tree-shaped, so the component map below decides the markup and the design
 * tokens apply exactly as they do for hand-written JSX. Rendering is
 * deterministic, which is what lets the prerendered HTML hydrate without a
 * mismatch.
 */

type ParagraphProps = ComponentPropsWithoutRef<'p'> & ExtraProps

/**
 * Link-only paragraph → buttons, every other paragraph → `<p>`.
 *
 * A single link keeps its paragraph wrapper (the old page only set
 * `role="button"` on the anchor); several links replace the paragraph with the
 * card grid the old stylesheet laid out.
 */
function markdownParagraph(linkButtons: boolean) {
  return function MarkdownParagraph({ node, children, ...rest }: ParagraphProps) {
    const anchors = node === undefined ? null : linkOnlyAnchors(node)
    if (anchors === null || !linkButtons) {
      return <p {...rest}>{children}</p>
    }

    const links: Array<{ href: string; label: string }> = []
    for (const anchor of anchors) {
      const href = anchorHref(anchor)
      if (href === undefined) {
        // Not buttonifiable — render the paragraph as written.
        return <p {...rest}>{children}</p>
      }
      links.push({ href, label: hastText(anchor) })
    }

    const [first] = links
    if (links.length === 1 && first !== undefined) {
      return (
        <p {...rest}>
          <Button href={first.href}>{first.label}</Button>
        </p>
      )
    }

    return (
      <div className="cards">
        {links.map((link, index) => (
          <Button key={index} href={link.href} variant="outline">
            {link.label}
          </Button>
        ))}
      </div>
    )
  }
}

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
 * The component map: one entry per Markdown element that needs a decision. Built
 * per render because `linkButtons` is a prop; every page passes the same value,
 * so the markup stays deterministic between prerender and hydration.
 */
function createComponents(linkButtons: boolean): Components {
  return {
    h1: ({ node: _node, ...props }) => <h1 {...props} />,
    h2: ({ node: _node, ...props }) => <h2 {...props} />,
    h3: ({ node: _node, ...props }) => <h3 {...props} />,
    p: markdownParagraph(linkButtons),
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
}

const REMARK_PLUGINS = [remarkGfm]

export interface MarkdownContentProps {
  /** Markdown source, inlined at build time via Vite's `?raw` import. */
  markdown: string
  /**
   * Turn paragraphs that consist of links only into buttons (start page).
   * Defaults to `true`; the Markdown subpages keep them as plain paragraphs.
   */
  linkButtons?: boolean
}

export function MarkdownContent({ markdown, linkButtons = true }: MarkdownContentProps) {
  return (
    <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={createComponents(linkButtons)}>
      {markdown}
    </ReactMarkdown>
  )
}
