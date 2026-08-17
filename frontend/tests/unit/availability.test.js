import { describe, it } from 'vitest'

describe('frontend availability rules', () => {
  it.todo('parses only valid 24-hour time values')
  it.todo('sorts slots by weekday and start time without mutating the input')
  it.todo('formats full and short availability labels')
  it.todo('detects overlap but allows slots that only touch at an endpoint')
  it.todo('rejects missing, reversed, and overlapping new slots')
  it.todo('accepts a valid non-overlapping new slot')
  it.todo('matches only an opportunity fully contained in one same-day slot')
  it.todo('rejects invalid, cross-day, partial, and empty-availability matches')
})
