import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

// Two build passes are driven from package.json:
//   vite build                          -> dist/client bundle + index.html template
//   vite build --ssr src/entry-server   -> .ssr/entry-server.js for the prerender step
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2023',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['dist/**', '.ssr/**', 'node_modules/**'],
  },
})
