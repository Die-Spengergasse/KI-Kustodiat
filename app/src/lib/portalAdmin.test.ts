import { describe, expect, it } from 'vitest'
import { formatResetDate, formatUsd, parseAmountUsd, roleLabelOf } from './portalAdmin'

describe('parseAmountUsd', () => {
  it('accepts comma and point, one or two decimals', () => {
    expect(parseAmountUsd('2,50')).toBe(2.5)
    expect(parseAmountUsd('2.50')).toBe(2.5)
    expect(parseAmountUsd('2')).toBe(2)
    expect(parseAmountUsd('2,5')).toBe(2.5)
    expect(parseAmountUsd(' 0,01 ')).toBe(0.01)
  })

  it('rejects empty, zero, too many decimals and exponent notation', () => {
    for (const raw of ['', ' ', '0', '0,00', '2,555', '1e3', 'abc', '-2', '2,', ',5', '12345']) {
      expect(parseAmountUsd(raw)).toBeNull()
    }
  })
})

describe('formatUsd', () => {
  it('formats with two decimals and the German separator', () => {
    expect(formatUsd(5)).toBe('5,00 USD')
    expect(formatUsd(7.5)).toBe('7,50 USD')
    // ICU uses a narrow no-break space as the de-AT thousands separator.
    expect(formatUsd(1234.5)).toMatch(/^1[\s\u00a0\u202f]234,50 USD$/)
  })

  it('shows a dash instead of a fake zero for a missing allowance', () => {
    expect(formatUsd(null)).toBe('–')
    expect(formatUsd(Number.NaN)).toBe('–')
  })
})

describe('formatResetDate', () => {
  it('renders the gateway reset date in long German form', () => {
    expect(formatResetDate('2026-12-01T00:00:00.000Z')).toBe('1. Dezember 2026')
  })

  it('treats missing or broken dates as unknown', () => {
    expect(formatResetDate(null)).toBe('–')
    expect(formatResetDate('not-a-date')).toBe('–')
  })
})

describe('roleLabelOf', () => {
  it('labels every portal role in German', () => {
    expect(roleLabelOf('admin')).toBe('Administrator:in')
    expect(roleLabelOf('student')).toBe('Schüler:in')
  })
})
