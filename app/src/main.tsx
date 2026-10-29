import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from './App'
import { legacyHashTarget, normalizeRoutePath } from './routes'
import './styles/global.css'

// Legacy hash URLs from the old static site: `/#/status` -> `/status`.
// A full navigation is used on purpose — the target page already exists as
// prerendered HTML, so hydrating the current document would be wasted work.
const legacyTarget = legacyHashTarget(window.location.hash)
if (legacyTarget !== null && legacyTarget !== normalizeRoutePath(window.location.pathname)) {
  window.location.replace(legacyTarget)
}

const container = document.getElementById('root')
if (container === null) {
  throw new Error('Missing #root container in document')
}

const element = (
  <StrictMode>
    <App path={normalizeRoutePath(window.location.pathname)} />
  </StrictMode>
)

// Prerendered pages hydrate; the empty portal shell (and the dev experience) mount fresh.
if (container.hasChildNodes()) {
  hydrateRoot(container, element)
} else {
  createRoot(container).render(element)
}
