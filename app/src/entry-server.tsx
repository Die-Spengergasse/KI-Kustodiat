import { renderToString } from 'react-dom/server'
import { App } from './App'
import { normalizeRoutePath } from './routes'

/**
 * SSR entry used twice:
 *  - `vite build --ssr src/entry-server.tsx` produces `.ssr/entry-server.js` for the
 *    build-time prerender step,
 *  - the dev server loads it through `vite.ssrLoadModule` on every request.
 */
export function render(urlPath: string): string {
  return renderToString(<App path={normalizeRoutePath(urlPath)} />)
}
