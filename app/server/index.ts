import { buildApp, type AppMode } from './app'
import { closeDatabase } from './db/client'

const mode: AppMode = process.argv.includes('--dev') ? 'dev' : 'prod'
const host = process.env.HOST ?? '127.0.0.1'
const port = Number.parseInt(process.env.PORT ?? '8080', 10)

const app = await buildApp({ mode })

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    app.log.info({ signal }, 'shutting down')
    void app
      .close()
      .then(() => closeDatabase())
      .then(() => process.exit(0))
  })
}

await app.listen({ host, port })
app.log.info({ mode }, `KI-Kustodiat app listening on http://${host}:${port}`)
