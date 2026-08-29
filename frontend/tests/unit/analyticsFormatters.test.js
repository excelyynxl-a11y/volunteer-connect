import { describe, expect, it } from 'vitest'

import {
  formatDateValue,
  formatMonthLabel,
} from '../../src/utils/analyticsFormatters.js'

describe('analytics formatters', () => {
  it('formats UTC month keys consistently for chart labels', () => {
    expect(formatMonthLabel('2026-01')).toBe('Jan 2026')
    expect(formatMonthLabel('2026-12')).toBe('Dec 2026')
  })

  it('keeps missing and malformed month values safe', () => {
    expect(formatMonthLabel()).toBe('Unknown')
    expect(formatMonthLabel(null)).toBe('Unknown')
    expect(formatMonthLabel('not-a-month')).toBe('not-a-month')
  })

  it('formats valid dates and preserves useful fallbacks', () => {
    expect(formatDateValue('2026-08-29T00:00:00.000Z')).toBe('29 Aug 2026')
    expect(formatDateValue()).toBe('Unknown date')
    expect(formatDateValue('not-a-date')).toBe('not-a-date')
  })
})
