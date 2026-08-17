import { describe, it } from 'vitest'

describe('frontend opportunity rules', () => {
  it.todo('opens only active opportunities before start and deadline')
  it.todo('treats a date-only midnight deadline as the end of that day')
  it.todo('formats valid dates and time ranges with safe fallbacks')
  it.todo('returns safe image, organisation name, status class, and requirement values')
  it.todo('matches every search term across the supported opportunity fields')
  it.todo('calculates remaining spots without returning a negative value')
  it.todo('explains availability-based apply eligibility')
  it.todo('sorts and splits opportunities without mutating the source list')
})
