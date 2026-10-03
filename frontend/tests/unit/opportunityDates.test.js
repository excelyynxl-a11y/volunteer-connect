import { describe, expect, it } from 'vitest'
import { formatLocalDate, validateOpportunityDates } from '../../src/lib/opportunityDates'

const dates = {
  startAt: '2030-02-01T09:00',
  endAt: '2030-02-01T12:00',
  applicationDeadline: '2030-01-25T00:00',
}

describe('opportunity date validation', () => {
  it.each(['2030-02-01T08:59', dates.startAt])('rejects an end at or before the start: %s', (endAt) => {
    expect(validateOpportunityDates({ ...dates, endAt }).errors.endAt).toMatch(/after/)
  })

  it.each([dates.startAt, '2030-02-02T00:00'])('rejects a deadline at or after the start: %s', (applicationDeadline) => {
    expect(validateOpportunityDates({ ...dates, applicationDeadline }).errors.applicationDeadline).toMatch(/before/)
  })

  it.each(['not-a-date', '2030-02-30T09:00', '2030-02-01T24:00'])('rejects invalid or normalised dates: %s', (startAt) => {
    const result = validateOpportunityDates({ ...dates, startAt })
    expect(result.errors.startAt).toMatch(/valid/)
    expect(result.start).toBeNull()
  })

  it('validates the deadline independently of a missing end time', () => {
    expect(validateOpportunityDates({ ...dates, endAt: '', applicationDeadline: dates.startAt }).errors)
      .toHaveProperty('applicationDeadline')
  })

  it('allows an overnight opportunity and a same-day midnight deadline', () => {
    const result = validateOpportunityDates({
      ...dates, endAt: '2030-02-02T01:00', applicationDeadline: '2030-02-01T00:00',
    })
    expect(result.errors).toEqual({})
    expect(result.deadline.getHours()).toBe(0)
    expect(result.deadline.getDate()).toBe(1)
  })

  it('rejects past creation dates but permits editing historical dates', () => {
    const now = new Date('2030-02-02T12:00')
    const result = validateOpportunityDates(dates, { creating: true, now })
    expect(result.errors).toHaveProperty('startAt')
    expect(result.errors).toHaveProperty('applicationDeadline')
    expect(validateOpportunityDates(dates, { now }).errors).toEqual({})
  })

  it('formats the local calendar day without shifting to UTC', () => {
    expect(formatLocalDate(new Date(2030, 1, 1, 0, 30))).toBe('2030-02-01')
  })
})
