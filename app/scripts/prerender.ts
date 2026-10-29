import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { BOT_FILES } from '../src/bots'
import { prerenderTargets, renderDocument } from '../src/prerender'

/** Input of `npm run build`: the bundled client template plus the SSR entry. */
const rootDir = process.cwd()
const distDir = path.join(rootDir, 'dist')
const ssrEntry = path.join(rootDir, '.ssr', 'entry-server.js')

interface ServerEntry {
  render: (urlPath: string) => string
}

async function loadEntry(): Promise<ServerEntry> {
  try {
    return (await import(pathToFileURL(ssrEntry).href)) as ServerEntry
  } catch (error) {
    throw new Error(`Cannot load the SSR bundle ${ssrEntry} — run "npm run build:ssr" first`, {
      cause: error,
    })
  }
}

async function main(): Promise<void> {
  const template = await readFile(path.join(distDir, 'index.html'), 'utf8')
  const entry = await loadEntry()

  for (const target of prerenderTargets()) {
    const appHtml = target.urlPath === null ? '' : entry.render(target.urlPath)
    const html = renderDocument(template, target.meta, appHtml)
    const outputFile = path.join(distDir, target.outputPath)

    await mkdir(path.dirname(outputFile), { recursive: true })
    await writeFile(outputFile, html, 'utf8')
    console.log(`prerendered ${target.outputPath}`)
  }

  // Bot artifacts come from the same route table, so a new route can never be
  // missing from the sitemap.
  for (const file of BOT_FILES) {
    await writeFile(path.join(distDir, file.outputFile), file.render(), 'utf8')
    console.log(`generated ${file.outputFile}`)
  }
}

await main()
