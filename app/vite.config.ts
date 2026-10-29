import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

// Two build passes are driven from package.json:
//   vite build                          -> dist/client bundle + index.html template
//   vite build --ssr src/entry-server   -> .ssr/entry-server.js for the prerender step
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Page text stays in the old static site: `src/lib/content.ts` imports
    // `website/content/index.md` with `?raw`, one directory above the app root.
    // The dev server has to be allowed to read that directory.
    fs: { allow: [import.meta.dirname, path.resolve(import.meta.dirname, '..')] },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2023',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'server/**/*.test.ts'],
    exclude: ['dist/**', '.ssr/**', 'node_modules/**'],
    // Integration tests (LDAP, PostgreSQL, LiteLLM) are opt-in: they need the
    // school network and the host's `/etc/portal/portal.env`.
    testTimeout: 30_000,
  },
})
