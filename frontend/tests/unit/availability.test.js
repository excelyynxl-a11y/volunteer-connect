import { describe, expect, it, vi } from 'vitest'
import {
  availabilitySlotsOverlap,
  formatAvailabilitySlot,
  getMinutesFromTime,
  getNewAvailabilitySlotError,
  isOpportunityInsideAvailability,
  shortDay,
  sortAvailabilitySlots,
} from '../../src/lib/availability.js'

vi.mock('../../src/lib/data.js', () => ({
  volunteerAvailabilityDays: [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ],
}))

describe('frontend availability rules', () => {
  it('parses only valid 24-hour time values', () => {
    // valid
    expect(getMinutesFromTime('00:00')).toBe(0)
    expect(getMinutesFromTime('09:30')).toBe(570)
    expect(getMinutesFromTime('23:59')).toBe(1439)

    // invalid (single digit hour, out of range hour/min, non-time input)
    expect(getMinutesFromTime('9:30')).toBeNull()
    expect(getMinutesFromTime('24:00')).toBeNull()
    expect(getMinutesFromTime('12:60')).toBeNull()
    expect(getMinutesFromTime('noon')).toBeNull()
    expect(getMinutesFromTime(undefined)).toBeNull()
  })

  it('sorts slots by weekday and start time without mutating the input', () => {
    const slots = [
      { dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '11:00' },
      { dayOfWeek: 'Monday', startTime: '14:00', endTime: '15:00' },
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00' },
      { dayOfWeek: 'Unknown Day', startTime: '08:00', endTime: '09:00' },
    ]

    const original = [...slots]
    const sorted = sortAvailabilitySlots(slots)

    expect(sorted.map((s) => `${s.dayOfWeek} ${s.startTime}`)).toEqual([
      'Monday 09:00',
      'Monday 14:00',
      'Wednesday 10:00',
      'Unknown Day 08:00', // unrecognised day sorts last
    ])
    expect(slots).toEqual(original) // source array untouched
    expect(sorted).not.toBe(slots)
  })

  it('formats full and short availability labels', () => {
    expect(formatAvailabilitySlot({ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' })).toBe(
      'Monday, 09:00 - 17:00',
    )
    expect(shortDay('Wednesday')).toBe('Wed')
    expect(shortDay('')).toBe('Day')
    expect(shortDay(undefined)).toBe('Day')
  })

  it('detects overlap but allows slots that only touch at an endpoint', () => {
    const base = { dayOfWeek: 'Monday', startTime: '09:00', endTime: '11:00' }

    // overlap
    expect(availabilitySlotsOverlap(base, { dayOfWeek: 'Monday', startTime: '10:00', endTime: '12:00' })).toBe(true)

    // touching at boundary (one ends exactly when the other start, 11:00) is not an overlap
    expect(availabilitySlotsOverlap(base, { dayOfWeek: 'Monday', startTime: '11:00', endTime: '12:00' })).toBe(false)

    // different day never overlaps
    expect(availabilitySlotsOverlap(base, { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '11:00' })).toBe(false)

    // invalid time on start/end time is not overlap
    expect(availabilitySlotsOverlap(base, { dayOfWeek: 'Monday', startTime: 'bad', endTime: '12:00' })).toBe(false)
  })

  it('rejects missing, reversed, and overlapping new slots', () => {
    const existingSlots = [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '11:00' }]

    // missing fields
    expect(getNewAvailabilitySlotError({ dayOfWeek: '', startTime: '09:00', endTime: '10:00' }, existingSlots)).toBe(
      'Please fill in all availability fields.',
    )

    // reversed time
    expect(
      getNewAvailabilitySlotError({ dayOfWeek: 'Monday', startTime: '12:00', endTime: '09:00' }, existingSlots),
    ).toBe('End time must be later than start time.')

    // overlaps an existing slot
    expect(
      getNewAvailabilitySlotError({ dayOfWeek: 'Monday', startTime: '10:00', endTime: '12:00' }, existingSlots),
    ).toBe('Availability time ranges on the same day cannot overlap.')
  })

  it('accepts a valid non-overlapping new slot', () => {
    const existingSlots = [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '11:00' }]

    const error = getNewAvailabilitySlotError(
      { dayOfWeek: 'Monday', startTime: '11:00', endTime: '12:00' },
      existingSlots,
    )

    expect(error).toBe('')
  })

  it('matches only an opportunity fully contained in one same-day slot', () => {
    const availability = [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' }]

    // 10:00-12:00 Malaysia time on Monday is fully inside 09:00-17:00 availability
    const opportunity = {
      startAt: '2030-01-07T02:00:00.000Z',
      endAt: '2030-01-07T04:00:00.000Z',
    }

    expect(isOpportunityInsideAvailability(opportunity, availability)).toBe(true)
  })

  it('rejects invalid, cross-day, partial, and empty-availability matches', () => {
    const availability = [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' }]

    // no start/end time at all
    expect(isOpportunityInsideAvailability({}, availability)).toBe(false)

    // empty availability list
    expect(
      isOpportunityInsideAvailability(
        { startAt: '2030-01-07T10:00:00.000Z', endAt: '2030-01-07T12:00:00.000Z' },
        [],
      ),
    ).toBe(false)

    // spans across 2 different weekdays
    expect(
      isOpportunityInsideAvailability(
        { startAt: '2030-01-07T22:00:00.000Z', endAt: '2030-01-08T02:00:00.000Z' },
        availability,
      ),
    ).toBe(false)

    // starts inside the slot but ends after it (availability partially covered)
    expect(
      isOpportunityInsideAvailability(
        { startAt: '2030-01-07T16:00:00.000Z', endAt: '2030-01-07T18:00:00.000Z' },
        availability,
      ),
    ).toBe(false)
  })
})