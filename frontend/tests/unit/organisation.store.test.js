import { beforeEach, describe, it, vi, expect } from 'vitest'
import { axiosInstance } from '../../src/lib/axios.js'
import toast from 'react-hot-toast'
import { useOrganisationStore } from '../../src/store/useOrganisationStore.js'

vi.mock('../../src/lib/axios.js', () => ({
  axiosInstance: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const setAuthUser = vi.fn()
vi.mock('../../src/store/useAuthStore.js', () => ({
  useAuthStore: {
    getState: () => ({ setAuthUser }),
  },
}))

const initialState = useOrganisationStore.getState()

beforeEach(() => {
  useOrganisationStore.setState(initialState, true)
  vi.clearAllMocks()
})

describe('organisation store', () => {

  // Test that public volunteer profile is loaded correctly and old profile data is cleared when no volunteer ID is provided
  it('loads and clears safe public Volunteer profile state', async () => {
    const profile = { _id: 'vol-1', name: 'Alex Tan', biodata: 'Loves gardening' }
    axiosInstance.get.mockResolvedValueOnce({ data: { data: profile } })

    const loaded = await useOrganisationStore.getState().getPublicVolunteerProfile('vol-1')

    expect(axiosInstance.get).toHaveBeenCalledWith('/volunteer/profile/vol-1')
    expect(loaded).toEqual({ success: true, profile })
    let state = useOrganisationStore.getState()
    expect(state.publicVolunteerProfile).toEqual(profile)
    expect(state.isPublicVolunteerProfileLoading).toBe(false)
    expect(state.publicVolunteerProfileError).toBe('')

    // call again with no volunteer id should clear stale data
    const cleared = await useOrganisationStore.getState().getPublicVolunteerProfile(undefined)

    expect(axiosInstance.get).toHaveBeenCalledTimes(1)
    expect(cleared.success).toBe(false)
    state = useOrganisationStore.getState()
    expect(state.publicVolunteerProfile).toBeNull()
    expect(state.publicVolunteerProfileError).toMatch(/no volunteer id/i)
  })

  // Test past volunteer experiences are sorted by date
  it('maps public past experience without claiming verified attendance or hours', async () => {
    const experienceData = [
      { _id: 'app-1', opportunityId: { title: 'River Cleanup', endAt: '2024-01-10T00:00:00.000Z', organisationId: { name: 'Blue Wave' } } },
      { _id: 'app-2', opportunityId: { title: 'Food Bank', endAt: '2024-04-10T00:00:00.000Z', organisationId: { name: 'Blue Wave' } } },
      { _id: 'app-3', opportunityId: { title: 'Tree Planting', endAt: '2024-03-10T00:00:00.000Z', organisationId: { name: 'Blue Wave' } } },
      { _id: 'app-4', opportunityId: { title: 'Beach Cleanup', endAt: '2024-02-10T00:00:00.000Z', organisationId: { name: 'Blue Wave' } } },
      { _id: 'app-5' }, // Missing opportunityId should be filtered out
    ]
    axiosInstance.get.mockResolvedValueOnce({ data: { data: experienceData } })

    await useOrganisationStore.getState().getPublicVolunteerPastExperience('vol-1')

    // 3 most recent experiences should be returned in descending date order
    const { publicVolunteerParticipation } = useOrganisationStore.getState()
    expect(publicVolunteerParticipation.map((entry) => entry.title)).toEqual([
      'Food Bank',
      'Tree Planting',
      'Beach Cleanup',
    ])

    // Public participation should only show simple data
    publicVolunteerParticipation.forEach((entry) => {
      expect(entry.status).toBe('Completed')
      expect(entry).not.toHaveProperty('hours')
      expect(entry).not.toHaveProperty('verified')
      expect(Object.keys(entry).sort()).toEqual(['date', 'id', 'organisation', 'status', 'title'])
    })
  })

  // Test that an organisation profile is sent as a FormData when a new profile pic is provided
  it('updates the Organisation profile with the expected multipart fields', async () => {
    axiosInstance.put.mockResolvedValueOnce({
      data: { data: { _id: 'org-1', name: 'Green Neighbours' } },
    })
    const avatarFile = new File(['avatar-bytes'], 'avatar.png', { type: 'image/png' })

    const result = await useOrganisationStore.getState().updateOrganisationProfile({
      name: 'Green Neighbours',
      biodata: 'We plant trees.',
      avatar: avatarFile,
    })

    expect(axiosInstance.put).toHaveBeenCalledTimes(1)
    const [url, payload] = axiosInstance.put.mock.calls[0]
    expect(url).toBe('/organisation/profile')
    expect(payload).toBeInstanceOf(FormData)

    // Check that the profile fiels and avatar are stored in the expected FormData
    expect(payload.get('name')).toBe('Green Neighbours')
    expect(payload.get('biodata')).toBe('We plant trees.')
    expect(payload.get('profilePic')).toBe(avatarFile)

    expect(setAuthUser).toHaveBeenCalledWith({ _id: 'org-1', name: 'Green Neighbours' })
    expect(toast.success).toHaveBeenCalled()
    expect(result).toEqual({ 
      success: true,
      user: { _id: 'org-1', name: 'Green Neighbours' },
    })
  })

  // Test that an organisation profile is sent as plain JSON when no new profile pic is provided 
  it('sends plain JSON fields when no new avatar file is provided', async () => {
    axiosInstance.put.mockResolvedValueOnce({
      data: { data: { _id: 'org-1', name: 'Green Neighbours' } },
    })

    await useOrganisationStore.getState().updateOrganisationProfile({
      name: 'Green Neighbours',
      biodata: 'We plant trees.',
    })

    // Check that the profile data is sent directly as a normal object
    const [, payload] = axiosInstance.put.mock.calls[0]
    expect(payload).toEqual({
      name: 'Green Neighbours',
      biodata: 'We plant trees.',
    })
  })
  
  // Test a new created opportunity is added to active list and the organisation opportunity list
  it('creates an opportunity and places it in the correct status list', async () => {
    useOrganisationStore.setState({
      activeOpportunities: [{ _id: 'existing', status: 'active' }],
      allMyOpportunities: [{ _id: 'existing', status: 'active' }],
    })
    const newOpportunity = { _id: 'new-1', title: 'Beach Cleanup', status: 'active' }
    axiosInstance.post.mockResolvedValueOnce({ data: { data: newOpportunity } })

    const result = await useOrganisationStore.getState().createOpportunity({ title: 'Beach Cleanup' })

    expect(axiosInstance.post).toHaveBeenCalledWith('/opportunities/create', { title: 'Beach Cleanup' })
    const state = useOrganisationStore.getState()
    expect(state.activeOpportunities[0]).toEqual(newOpportunity)
    expect(state.activeOpportunities).toHaveLength(2)
    expect(state.allMyOpportunities[0]).toEqual(newOpportunity)
    expect(result).toEqual({ success: true, data: newOpportunity })
  })

  // Test that updating an opportunity moves it to the correct status list without create duplicate entries
  it('updates an opportunity and moves it between status lists without duplication', async () => {
    useOrganisationStore.setState({
      activeOpportunities: [{ _id: 'o1', status: 'active', title: 'Teaching' }],
      closedOpportunities: [],
      cancelledOpportunities: [],
      allMyOpportunities: [{ _id: 'o1', status: 'active', title: 'Teaching' }],
    })
    axiosInstance.put.mockResolvedValueOnce({
      data: { data: { _id: 'o1', status: 'closed', title: 'Teaching' } },
    })

    await useOrganisationStore.getState().updateOpportunity('o1', { status: 'closed' })

    let state = useOrganisationStore.getState()
    expect(state.activeOpportunities).toHaveLength(0)
    expect(state.closedOpportunities).toHaveLength(1)
    expect(state.closedOpportunities[0]).toMatchObject({ _id: 'o1', status: 'closed' })

    axiosInstance.put.mockResolvedValueOnce({
      data: { data: { _id: 'o1', status: 'closed', title: 'Teaching updated' } },
    })
    await useOrganisationStore.getState().updateOpportunity('o1', { title: 'Teaching updated' })

    state = useOrganisationStore.getState()
      expect(state.closedOpportunities).toHaveLength(1)
      expect(state.closedOpportunities[0].title).toBe('Teaching updated')
  })

  // Test that an update is rejected when no opportunity ID is provided and the API is not called
  it('rejects an update with no opportunity id without calling the API', async () => {
    const result = await useOrganisationStore.getState().updateOpportunity(undefined, { title: 'Gardening' })

    expect(result).toEqual({ success: false, error: 'Missing ID' })
    expect(axiosInstance.put).not.toHaveBeenCalled()
  })

  // Test that organisation's opportunities are separated into active, closed, completed, cancalled
  it('splits the authenticated Organisation opportunities by current status', async () => {
    const opportunities = [
      { _id: '1', status: 'active' },
      { _id: '2', status: 'closed' },
      { _id: '3', status: 'completed' },
      { _id: '4', status: 'cancelled' },
    ]
    axiosInstance.get.mockResolvedValueOnce({ data: { opportunities } })

    await useOrganisationStore.getState().getMyOpportunities()

    const state = useOrganisationStore.getState()
    expect(state.allMyOpportunities).toEqual(opportunities)
    expect(state.activeOpportunities.map((o) => o._id)).toEqual(['1'])
    expect(state.closedOpportunities.map((o) => o._id)).toEqual(['2', '3'])
    expect(state.cancelledOpportunities.map((o) => o._id)).toEqual(['4'])
    expect(state.isOpportunitiesLoading).toBe(false)
    expect(state.opportunitiesError).toBe('')
  })

  // Test that failed API requests return correct error and reset the loading states
  it('keeps loading and error state balanced for every failed action', async () => {
    // getMyOpportunities failure
    axiosInstance.get.mockRejectedValueOnce({ response: { data: { message: 'Server unavailable' } } })
    const myOppsResult = await useOrganisationStore.getState().getMyOpportunities()
    expect(myOppsResult).toEqual({ success: false, error: 'Server unavailable' })
    let state = useOrganisationStore.getState()
    expect(state.isOpportunitiesLoading).toBe(false)
    expect(state.opportunitiesError).toBe('Server unavailable')
    expect(state.activeOpportunities).toEqual([])

    // updateOpportunity failure
    axiosInstance.put.mockRejectedValueOnce({ response: { data: { message: 'Update failed' } } })
    const updateResult = await useOrganisationStore.getState().updateOpportunity('o1', { status: 'closed' })
    expect(updateResult.success).toBe(false)
    expect(useOrganisationStore.getState().isUpdatingOpportunity).toBe(false)
    expect(toast.error).toHaveBeenCalledWith('Update failed')

    // createOpportunity failure
    axiosInstance.post.mockRejectedValueOnce({ response: { data: { message: 'Create failed' } } })
    const createResult = await useOrganisationStore.getState().createOpportunity({ title: 'New' })
    expect(createResult.success).toBe(false)
    expect(useOrganisationStore.getState().isCreatingOpportunity).toBe(false)

    // updateOrganisationProfile failure
    axiosInstance.put.mockRejectedValueOnce({ response: { data: { message: 'Save failed' } } })
    const profileResult = await useOrganisationStore.getState().updateOrganisationProfile({ name: 'X' })
    expect(profileResult.success).toBe(false)
    expect(useOrganisationStore.getState().isUpdatingOrganisationProfile).toBe(false)
  })
})