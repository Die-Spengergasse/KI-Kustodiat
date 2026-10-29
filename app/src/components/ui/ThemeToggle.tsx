import { useEffect, useState } from 'react'
import {
  DEFAULT_THEME_MODE,
  applyThemeMode,
  nextThemeMode,
  readStoredThemeMode,
  storeThemeMode,
  themeLabel,
  type ThemeMode,
} from '../../lib/theme'

/**
 * `Auto → Hell → Dunkel` toggle. The palette itself is pure CSS: the inline
 * script in `index.html` sets `<html data-theme>` before the first paint, this
 * component only flips the attribute and persists the choice under
 * `localStorage["kik-theme"]`.
 *
 * State starts at `auto` so server markup and hydration agree; the effect then
 * adopts the stored mode. Only the button label corrects itself one frame after
 * hydration — the page colour never flashes.
 */
export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(DEFAULT_THEME_MODE)

  useEffect(() => {
    setMode(readStoredThemeMode(window.localStorage))
  }, [])

  function handleClick(): void {
    const next = nextThemeMode(mode)
    setMode(next)
    applyThemeMode(document.documentElement, next)
    storeThemeMode(window.localStorage, next)
  }

  return (
    <button
      type="button"
      className="ui-button ui-button--outline"
      aria-label="Farbschema wechseln"
      onClick={handleClick}
    >
      {themeLabel(mode)}
    </button>
  )
}
