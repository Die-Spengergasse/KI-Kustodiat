import { describe, expect, it } from 'vitest'
import {
  DEFAULT_THEME_MODE,
  THEME_STORAGE_KEY,
  THEME_MODES,
  isThemeMode,
  nextThemeMode,
  readStoredThemeMode,
  storeThemeMode,
  themeLabel,
} from './theme'

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
  }
}

describe('theme modes', () => {
  it('cycles auto → light → dark → auto', () => {
    expect(THEME_MODES).toEqual(['auto', 'light', 'dark'])
    expect(nextThemeMode('auto')).toBe('light')
    expect(nextThemeMode('light')).toBe('dark')
    expect(nextThemeMode('dark')).toBe('auto')
  })

  it('recognises only the three stored modes', () => {
    expect(isThemeMode('auto')).toBe(true)
    expect(isThemeMode('dark')).toBe(true)
    expect(isThemeMode('system')).toBe(false)
    expect(isThemeMode(null)).toBe(false)
  })

  it('reads the kik-theme key and falls back to auto', () => {
    expect(THEME_STORAGE_KEY).toBe('kik-theme')
    expect(readStoredThemeMode(memoryStorage({ 'kik-theme': 'dark' }))).toBe('dark')
    expect(readStoredThemeMode(memoryStorage({ 'kik-theme': 'system' }))).toBe(DEFAULT_THEME_MODE)
    expect(readStoredThemeMode(memoryStorage())).toBe(DEFAULT_THEME_MODE)
    expect(readStoredThemeMode()).toBe(DEFAULT_THEME_MODE)
  })

  it('survives a blocked storage', () => {
    const blocked = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    }
    expect(readStoredThemeMode(blocked)).toBe(DEFAULT_THEME_MODE)
    expect(() => storeThemeMode(blocked, 'dark')).not.toThrow()
  })

  it('persists the mode under the preserved storage key', () => {
    const storage = memoryStorage()
    storeThemeMode(storage, 'light')
    expect(storage.getItem(THEME_STORAGE_KEY)).toBe('light')
  })

  it('labels the toggle in German, informal', () => {
    expect(themeLabel('auto')).toBe('Farbschema: Auto')
    expect(themeLabel('light')).toBe('Farbschema: Hell')
    expect(themeLabel('dark')).toBe('Farbschema: Dunkel')
  })
})
