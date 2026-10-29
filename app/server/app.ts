import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import middie from '@fastify/middie'
import fastifyStatic from '@fastify/static'
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify'
// `vite` is only needed by `registerDev`; importing it lazily keeps a production
// install (`npm ci --omit=dev`) able to start the prerendered site.
import type { ViteDevServer } from 'vite'
import {
  NOT_FOUND_OUTPUT_FILE,
  TOKENS_OUTPUT_FILE,
  documentMetaFor,
  renderDocument,
} from '../src/prerender'
import { findBotFile } from '../src/bots'
import { isDesignRoute } from '../src/devRoutes'
import { isTokensPath, matchPublicRoute, normalizeRoutePath, outputFilePath } from '../src/routes'
import { registerAuthRoutes } from './routes/auth'
import { registerKeyRoutes } from './routes/keys'
import { registerUsageRoutes } from './routes/usage'

export type AppMode = 'dev' | 'prod'

export interface BuildAppOptions {
  mode: AppMode
  /** Project root containing `index.html` and `dist/`; defaults to the working directory. */
  rootDir?: string
}

type PageHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<FastifyReply>

/**
 * One Fastify app for both modes: in dev Vite runs as middleware and renders on the
 * fly, in production the prerendered documents from `dist/` are served.
 */
export async function buildApp(options: BuildAppOptions): Promise<FastifyInstance> {
  const rootDir = options.rootDir ?? process.cwd()
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? 'info' },
    // nginx terminates TLS in front of the app, so the client IP for the login
    // rate limit comes from `X-Forwarded-For`. Direct dev access still works.
    trustProxy: process.env.PORTAL_TRUST_PROXY !== 'false',
  })

  // `/api/auth/*` — registered before the catch-all page route so static paths win.
  await registerAuthRoutes(app)
  // Self-service keys and the read-only usage view (Issue #48).
  await registerKeyRoutes(app)
  await registerUsageRoutes(app)

  const handlePage =
    options.mode === 'dev'
      ? await registerDev(app, rootDir)
      : await registerProd(app, path.join(rootDir, 'dist'))

  app.get('/*', handlePage)

  return app
}

async function registerDev(app: FastifyInstance, rootDir: string): Promise<PageHandler> {
  const { createServer } = await import('vite')
  const vite = await createServer({
    root: rootDir,
    server: { middlewareMode: true },
    appType: 'custom',
  })
  app.addHook('onClose', async () => {
    await vite.close()
  })

  await app.register(middie)
  app.use(vite.middlewares)

  const template = await readFile(path.join(rootDir, 'index.html'), 'utf8')

  return async (request, reply) => {
    const requestUrl = request.raw.url ?? '/'
    const urlPath = normalizeRoutePath(requestUrl)
    // `/_design` is a dev-only tooling route (see src/devRoutes.ts); production
    // intentionally falls through to the 404 document.
    const isKnownPath =
      isTokensPath(urlPath) || matchPublicRoute(urlPath) !== undefined || isDesignRoute(urlPath)

    // sitemap.xml / robots.txt are generated from the route table; in dev they
    // are rendered per request instead of being read from `dist/`.
    const botFile = findBotFile(urlPath)
    if (botFile !== undefined) {
      return reply.type(botFile.contentType).send(botFile.render())
    }

    try {
      const appHtml = isTokensPath(urlPath) ? '' : await renderWithVite(vite, urlPath)
      const html = renderDocument(
        await vite.transformIndexHtml(requestUrl, template),
        documentMetaFor(urlPath),
        appHtml,
      )
      if (isTokensPath(urlPath)) {
        // Same header the production server sets on the authenticated area.
        reply.header('x-robots-tag', 'noindex, nofollow')
      }
      return reply
        .code(isKnownPath ? 200 : 404)
        .type('text/html; charset=utf-8')
        .send(html)
    } catch (error) {
      vite.ssrFixStacktrace(error as Error)
      request.log.error({ err: error }, 'dev render failed')
      return reply
        .code(500)
        .type('text/plain; charset=utf-8')
        .send('Rendering failed — see server log')
    }
  }
}

async function renderWithVite(vite: ViteDevServer, urlPath: string): Promise<string> {
  const entry = (await vite.ssrLoadModule('/src/entry-server.tsx')) as unknown as {
    render: (path: string) => string
  }
  return entry.render(urlPath)
}

async function registerProd(app: FastifyInstance, distDir: string): Promise<PageHandler> {
  if (!existsSync(path.join(distDir, NOT_FOUND_OUTPUT_FILE))) {
    throw new Error(`No prerendered site in ${distDir} — run "npm run build" first`)
  }

  // `serve: false` keeps the plugin from registering its own wildcard route; the
  // handler below decides between prerendered document, asset and 404.
  await app.register(fastifyStatic, { root: distDir, serve: false })

  const notFound = (reply: FastifyReply): FastifyReply =>
    reply.code(404).type('text/html; charset=utf-8').sendFile(NOT_FOUND_OUTPUT_FILE)

  return async (request, reply) => {
    const urlPath = normalizeRoutePath(request.raw.url ?? '/')

    if (urlPath.startsWith('/assets/')) {
      const candidate = path.resolve(distDir, `.${urlPath}`)
      if (candidate.startsWith(`${distDir}${path.sep}`) && existsSync(candidate)) {
        return reply.sendFile(urlPath.slice(1))
      }
      return notFound(reply)
    }

    if (isTokensPath(urlPath)) {
      return reply
        .header('x-robots-tag', 'noindex, nofollow')
        .type('text/html; charset=utf-8')
        .sendFile(TOKENS_OUTPUT_FILE)
    }

    const botFile = findBotFile(urlPath)
    if (botFile !== undefined) {
      return reply.type(botFile.contentType).sendFile(botFile.outputFile)
    }

    if (matchPublicRoute(urlPath) !== undefined) {
      return reply.type('text/html; charset=utf-8').sendFile(outputFilePath(urlPath))
    }

    return notFound(reply)
  }
}
