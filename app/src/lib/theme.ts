/**
 * Theme handling shared by the inline `<head>` boot script, the React toggle and
 * the Playwright test.
 *
 * `kik-theme` stores the *mode* the visitor picked (`auto` | `light` | `dark`),
 * and the same value is written to `<html data-theme>` — `auto` lets CSS
 * `color-scheme: light dark` follow `prefers-color-scheme`, `light`/`dark` pin
 * it. Keeping the mode in the attribute (instead of only the resolved palette)
 * is what makes the toggle cycle testable and keeps the CSS to one rule per
 * mode.
 */

export const THEME_STORAGE_KEY = 'kik-theme'

export const THEME_MODES = ['auto', 'light', 'dark'] as const

export type ThemeMode = (typeof THEME_MODES)[number]

export const DEFAULT_THEME_MODE: ThemeMode = 'auto'

export const THEME_LABELS: Record<ThemeMode, string> = {
  auto: 'Auto',
  light: 'Hell',
  dark: 'Dunkel',
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (THEME_MODES as readonly string[]).includes(value)
}

/** `auto → light → dark → auto`, as in the old `website/app.js`. */
export function nextThemeMode(mode: ThemeMode): ThemeMode {
  const index = THEME_MODES.indexOf(mode)
  return THEME_MODES[(index + 1) % THEME_MODES.length] ?? DEFAULT_THEME_MODE
}

type ReadableStorage = Pick<Storage, 'getItem'>

/** Reads the stored mode; unknown or inaccessible storage falls back to `auto`. */
export function readStoredThemeMode(storage?: ReadableStorage): ThemeMode {
  if (storage === undefined) {
    return DEFAULT_THEME_MODE
  }
  try {
    const stored = storage.getItem(THEME_STORAGE_KEY)
    return isThemeMode(stored) ? stored : DEFAULT_THEME_MODE
  } catch {
    return DEFAULT_THEME_MODE
  }
}

type WritableStorage = Pick<Storage, 'setItem'>

export function storeThemeMode(storage: WritableStorage | undefined, mode: ThemeMode): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, mode)
  } catch {
    // Private mode / disabled storage: the in-memory mode still works.
  }
}

/** Writes the mode to `<html data-theme>`; CSS resolves the palette from it. */
export function applyThemeMode(root: Pick<HTMLElement, 'setAttribute'>, mode: ThemeMode): void {
  root.setAttribute('data-theme', mode)
}

export function themeLabel(mode: ThemeMode): string {
  return `Farbschema: ${THEME_LABELS[mode]}`
}
