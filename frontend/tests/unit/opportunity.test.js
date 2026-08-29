import { beforeEach, describe, expect, it, vi } from 'vitest'
import { isOpportunityInsideAvailability } from '../../src/lib/availability'
import {
  formatOpportunityDate,
  formatOpportunityDateTime,
  formatOpportunityTimeRange, 
  getApplyEligibility,
  getOpportunityStatusClass,
  getOrganisationName,
  getRequirementItems,
  getSpotsRemaining,
  getUpcomingOpportunities,
  isOpportunityOpen,
  opportunityMatchesSearch,
  sortOpportunitiesByMostRecent,
  splitOpportunitiesByStatus
} from '../../src/lib/opportunity'

vi.mock('../../src/lib/availability.js', () => ({
  isOpportunityInsideAvailability: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('frontend opportunity rules', () => {
  it('opens only active opportunities before start and deadline', () => {
    const now = new Date('2030-01-01T00:00:00.000Z').getTime()
    const openOpp = {
      status: 'active',
      startAt: '2030-02-01T00:00:00.000Z',
      applicationDeadline: '2030-01-15T00:00:00.000Z',
    }

    expect(isOpportunityOpen(openOpp, now)).toBe(true)
    expect(isOpportunityOpen({ ...openOpp, status: 'closed' }, now)).toBe(false)
    expect(isOpportunityOpen({ ...openOpp, startAt: '2029-12-01T00:00:00.000Z' }, now)).toBe(false)
    expect(isOpportunityOpen({ ...openOpp, applicationDeadline: '2029-12-01T00:00:00.000Z' }, now)).toBe(false)
    expect(isOpportunityOpen(null, now)).toBe(false)
  })

  it('treats a date-only midnight deadline as effective at 00:00', () => {
    const opportunity = {
      status: 'active',
      startAt: '2030-02-01T00:00:00.000Z',
      applicationDeadline: '2030-01-15T00:00:00.000Z',
    }

    expect(
      isOpportunityOpen(opportunity, new Date('2030-01-14T23:59:59.000Z').getTime()),
    ).toBe(true)

    expect(
      isOpportunityOpen(opportunity, new Date('2030-01-15T00:00:01.000Z').getTime()),
    ).toBe(false)
  })

  it('formats valid dates and time ranges with safe fallbacks', () => {
    expect(formatOpportunityDate('2027-01-07T00:00:00.000Z')).toBe('7 Jan 2027')
    expect(formatOpportunityDate(null, 'TBC')).toBe('TBC')
    expect(formatOpportunityDate('not-a-date', 'TBC')).toBe('TBC')

    expect(formatOpportunityTimeRange('2027-01-07T01:00:00.000Z', '2027-01-07T03:00:00.000Z')).toMatch(/-/)
    expect(formatOpportunityTimeRange(null, null, 'Time TBC')).toBe('Time TBC')

    expect(formatOpportunityDateTime(null, 'No date')).toBe('No date')
    expect(formatOpportunityDateTime('not-a-date', 'No date')).toBe('No date')
  })

  it('returns safe organisation name, status class, and requirement values', () => {
    // organisation name
    expect(getOrganisationName({ organisationId: { name: 'Green Neighbours' } })).toBe('Green Neighbours')
    expect(getOrganisationName({ organisationName: 'Yolo Org' })).toBe('Yolo Org')
    expect(getOrganisationName({})).toBe('Organisation')

    // status class
    expect(getOpportunityStatusClass('Active')).toBe('active')
    expect(getOpportunityStatusClass(' Needs  Review ')).toBe('needs-review')
    expect(getOpportunityStatusClass(undefined)).toBe('pending')

    // requirements
    expect(getRequirementItems('Closed shoes\nWater bottle\n- Sun hat')).toEqual([
      'Closed shoes',
      'Water bottle',
      'Sun hat',
    ])
    expect(getRequirementItems('')).toEqual([])
  })

  it('matches every search term across the supported opportunity fields', () => {
    const opportunity = {
      title: 'Community Garden Day',
      details: 'Tend the beds',
      location: 'Petaling Jaya',
      requirements: 'Gloves',
      organisationId: { name: 'Green Neighbours' },
      category: ['Environment'],
    }

    // every term must match, regardless of which field it's in
    expect(opportunityMatchesSearch(opportunity, 'garden petaling')).toBe(true)
    expect(opportunityMatchesSearch(opportunity, 'garden environment')).toBe(true)
    expect(opportunityMatchesSearch(opportunity, 'garden nonexistent')).toBe(false)
    expect(opportunityMatchesSearch(opportunity, '')).toBe(true)
  })

  it('calculates remaining spots without returning a negative value', () => {
    expect(getSpotsRemaining({ maxVolunteers: 10, approvedVolunteersCount: 4 })).toBe(6)
    expect(getSpotsRemaining({ maxVolunteers: 5, approvedVolunteersCount: 8 })).toBe(0)
    expect(getSpotsRemaining({})).toBe(0)
  })


  it('explains availability-based apply eligibility', () => {
    // block apply when volunteer has no saved availability
    const noAvailabilityResult = getApplyEligibility({}, [])

    expect(noAvailabilityResult.canApply).toBe(false)
    expect(noAvailabilityResult.reason).toMatch(/add your availability/i)
    expect(isOpportunityInsideAvailability).not.toHaveBeenCalled()

    // blocks apply when the opportunity falls outside saved availability
    isOpportunityInsideAvailability.mockReturnValue(false)
    const availability = [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
    ]

    const outsideAvailabilityResult = getApplyEligibility(
      { _id: 'o1' },
      availability,
    )

    expect(outsideAvailabilityResult).toEqual({
      canApply: false,
      reason: 'This opportunity falls outside your saved availability.',
    })

    expect(isOpportunityInsideAvailability).toHaveBeenCalledWith(
      { _id: 'o1' },
      availability,
    )

    // allows apply when the opportunity is fully covered by availability
    isOpportunityInsideAvailability.mockReturnValue(true)
    const fullDayAvailability = [
      { dayOfWeek: 'Monday', startTime: '00:00', endTime: '23:59' },
    ]

    const allowedResult = getApplyEligibility(
      { _id: 'o1' },
      fullDayAvailability,
    )

    expect(allowedResult).toEqual({
      canApply: true,
      reason: '',
    })
  })

  it('sorts and splits opportunities without mutating the source list', () => {
    const opportunities = [
      { _id: '1', status: 'active', startAt: '2030-01-01T00:00:00.000Z' },
      { _id: '2', status: 'closed', startAt: '2030-03-01T00:00:00.000Z' },
      { _id: '3', status: 'completed', startAt: '2030-02-01T00:00:00.000Z' },
      { _id: '4', status: 'cancelled', startAt: '2029-01-01T00:00:00.000Z' },
    ]

    const source = [...opportunities]

    const sorted = sortOpportunitiesByMostRecent(source)
    const split = splitOpportunitiesByStatus(source)

    expect(source).toEqual(opportunities)
    expect(sorted).not.toBe(source)
    expect(sorted.map((o) => o._id)).toEqual(['2', '3', '1', '4'])
    expect(split.activeOpportunities.map((o) => o._id)).toEqual(['1'])
    expect(split.closedOpportunities.map((o) => o._id)).toEqual(['2', '3'])
    expect(split.cancelledOpportunities.map((o) => o._id)).toEqual(['4'])
  })

  it('returns only upcoming opportunities sorted soonest-first', () => {
    const opportunities = [
      { _id: '1', status: 'active', startAt: '2030-01-01T00:00:00.000Z' },
      { _id: '2', status: 'closed', startAt: '2030-03-01T00:00:00.000Z' },
      { _id: '3', status: 'completed', startAt: '2030-02-01T00:00:00.000Z' },
      { _id: '4', status: 'cancelled', startAt: '2029-01-01T00:00:00.000Z' },
    ]

    const upcoming = getUpcomingOpportunities(opportunities, new Date('2029-06-01T00:00:00.000Z').getTime())

    // the 2029-01-01 one is in the past relative to "now" and excluded
    expect(upcoming.map((o) => o._id)).toEqual(['1', '3', '2'])
  })
})
