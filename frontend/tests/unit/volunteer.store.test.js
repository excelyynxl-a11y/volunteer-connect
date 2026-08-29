import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axiosInstance } from '../../src/lib/axios.js'
import { useVolunteerStore } from '../../src/store/useVolunteerStore.js'

vi.mock('../../src/lib/axios.js', () => ({
  axiosInstance: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

const setAuthUser = vi.fn()
vi.mock('../../src/store/useAuthStore.js', () => ({
  useAuthStore: {
    getState: () => ({ setAuthUser }),
  },
}))

const initialState = useVolunteerStore.getState()

beforeEach(() => {
  useVolunteerStore.setState(initialState, true)
  vi.clearAllMocks()
})

describe('volunteer store', () => {
  it('loads only the safe public Organisation profile into state', async () => {
    const profile = { _id: 'org-1', name: 'Green Neighbours', biodata: 'We plant trees.' }
    axiosInstance.get.mockResolvedValueOnce({ data: { data: profile } })

    const result = await useVolunteerStore.getState().getPublicOrganisationProfile('org-1')

    expect(axiosInstance.get).toHaveBeenCalledWith('/organisation/profile/org-1')
    expect(result).toEqual({ success: true, profile })
    const state = useVolunteerStore.getState()
    expect(state.publicOrganisationProfile).toEqual(profile)
    expect(state.isPublicOrganisationProfileLoading).toBe(false)
    expect(state.publicOrganisationProfileError).toBe('')
  })

  it('rejects a public profile request with no organisation id without calling the API', async () => {
    const result = await useVolunteerStore.getState().getPublicOrganisationProfile(undefined)

    expect(result).toEqual({ success: false, error: 'Organisation ID is unavailable.' })
    expect(axiosInstance.get).not.toHaveBeenCalled()
    expect(useVolunteerStore.getState().publicOrganisationProfile).toBeNull()
  })

  it('clears stale public profile data when a new request fails', async () => {
    // a successful load first
    axiosInstance.get.mockResolvedValueOnce({ data: { data: { _id: 'org-1', name: 'Green Neighbours' } } })
    await useVolunteerStore.getState().getPublicOrganisationProfile('org-1')
    expect(useVolunteerStore.getState().publicOrganisationProfile).not.toBeNull()

    // a follow-up request fails
    axiosInstance.get.mockRejectedValueOnce({ response: { data: { message: 'Not found' } } })
    const result = await useVolunteerStore.getState().getPublicOrganisationProfile('org-2')

    expect(result).toEqual({ success: false, error: 'Not found' })
    const state = useVolunteerStore.getState()
    expect(state.publicOrganisationProfile).toBeNull()
    expect(state.publicOrganisationProfileError).toBe('Not found')
  })

  it('maps past approved opportunities without treating duration as verified hours', async () => {
    const experienceData = [
      {
        _id: 'a1',
        loggedHours: 5,
        opportunityId: { title: 'River Cleanup', organisationId: { name: 'Happy River' }, endAt: '2030-01-01T00:00:00.000Z' },
      },
      {
        _id: 'a2',
        opportunityId: {
          title: 'Food Bank',
          organisationId: { name: 'Happy River' },
          startAt: '2030-01-02T09:00:00.000Z',
          endAt: '2030-01-02T12:00:00.000Z',
        },
      },
    ]
    axiosInstance.get.mockResolvedValueOnce({ data: { data: experienceData } })

    await useVolunteerStore.getState().getVolunteerPastExperience('volunteer-1')

    const { participationHistory, totalVolunteerHours } = useVolunteerStore.getState()
    expect(participationHistory[0].loggedHours).toBe(5)
    expect(participationHistory[0].hours).toBe('5.0 hrs')
    
    // falls back to the scheduled duration (3 hours) but this is a computed estimate, not an attendance record
    expect(participationHistory[1].loggedHours).toBe(3)
    expect(participationHistory[1].hours).toBe('3.0 hrs')
    participationHistory.forEach((entry) => {
      expect(entry).not.toHaveProperty('verified')
      expect(entry.status).toBe('Completed')
    })
    expect(totalVolunteerHours).toBe('8.0h')
  })

  it('loads opportunity data and exposes a recoverable error state', async () => {
    // success load
    axiosInstance.get.mockResolvedValueOnce({ data: { data: [{ _id: 'o1' }] } })
    await useVolunteerStore.getState().getAllOpportunities()
    expect(useVolunteerStore.getState().opportunities).toEqual([{ _id: 'o1' }])

    // fail to load
    axiosInstance.get.mockRejectedValueOnce({ response: { data: { message: 'Load failed' } } })
    const result = await useVolunteerStore.getState().getAllOpportunities()

    // recoverable (error surfaced, loading cleared)
    expect(result).toEqual({ success: false, error: 'Load failed' })
    const state = useVolunteerStore.getState()
    expect(state.opportunities).toEqual([])
    expect(state.opportunitiesError).toBe('Load failed')
    expect(state.isOpportunitiesLoading).toBe(false)
  })

  it('updates the Volunteer profile with the expected multipart fields', async () => {
    axiosInstance.put.mockResolvedValueOnce({ data: { data: { _id: 'volunteer-1', fullName: 'Alex Tan' } } })
    const avatarFile = new File(['bytes'], 'avatar.png', { type: 'image/png' })

    const result = await useVolunteerStore.getState().updateVolunteerProfile('volunteer-1', {
      fullName: 'Alex Tan',
      ageGroup: '21-30',
      biodata: 'Loves gardening',
      skills: ['Teamwork'],
      availability: [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' }],
      avatar: avatarFile,
    })

    expect(axiosInstance.put).toHaveBeenCalledTimes(1)
    const [url, payload] = axiosInstance.put.mock.calls[0]
    expect(url).toBe('/volunteer/profile/volunteer-1')
    expect(payload).toBeInstanceOf(FormData)
    expect(payload.get('fullName')).toBe('Alex Tan')
    expect(payload.get('ageGroup')).toBe('21-30')
    expect(payload.get('biodata')).toBe('Loves gardening')
    expect(payload.get('skills')).toBe(JSON.stringify(['Teamwork']))
    expect(payload.get('availability')).toBe(
      JSON.stringify([{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' }]),
    )
    expect(payload.get('profilePic')).toBe(avatarFile)
    expect(result).toEqual({ success: true, profile: { _id: 'volunteer-1', fullName: 'Alex Tan' } })
  })

  it('sends plain JSON fields when no new avatar file is provided', async () => {
    axiosInstance.put.mockResolvedValueOnce({ data: { data: { _id: 'volunteer-1' } } })

    await useVolunteerStore.getState().updateVolunteerProfile('volunteer-1', { fullName: 'Alex Tan' })

    const [, payload] = axiosInstance.put.mock.calls[0]
    expect(payload).toEqual({ fullName: 'Alex Tan' })
  })

  it('updates shared authenticated profile data after a successful save', async () => {
    const updatedProfile = { _id: 'volunteer-1', fullName: 'Alex Updated' }
    axiosInstance.put.mockResolvedValueOnce({ data: { data: updatedProfile } })

    await useVolunteerStore.getState().updateVolunteerProfile('volunteer-1', { fullName: 'Alex Updated' })

    expect(setAuthUser).toHaveBeenCalledWith(updatedProfile)
  })

  it('keeps loading state balanced on success and failure', async () => {
    // successful
    axiosInstance.put.mockResolvedValueOnce({ data: { data: {} } })
    await useVolunteerStore.getState().updateVolunteerProfile('volunteer-1', { fullName: 'Alex' })
    expect(useVolunteerStore.getState().isUpdatingVolunteerProfile).toBe(false)
    
    // failure
    axiosInstance.put.mockRejectedValueOnce({ response: { data: { message: 'Save failed' } } })
    const result = await useVolunteerStore.getState().updateVolunteerProfile('volunteer-1', { fullName: 'Alex' })
    expect(result).toEqual({ success: false, error: 'Save failed' })
    expect(useVolunteerStore.getState().isUpdatingVolunteerProfile).toBe(false)
  })
})