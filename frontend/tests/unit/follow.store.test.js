import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axiosInstance } from '../../src/lib/axios.js'
import { useFollowStore } from '../../src/store/useFollowStore.js'

vi.mock('../../src/lib/axios.js', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

const initialState = useFollowStore.getState()

beforeEach(() => {
  useFollowStore.setState(initialState, true)
  vi.clearAllMocks()
})

describe('follow store', () => {
  it('loads followed Organisations and clears stale data on failure', async () => {
    // successful load
    axiosInstance.get.mockResolvedValueOnce({
      data: { data: [{ _id: 'org-1', name: 'Green Neighbours' }] },
    })

    await useFollowStore.getState().getMyFollowedOrganisations()

    expect(useFollowStore.getState().followedOrganisations).toEqual([
      { _id: 'org-1', name: 'Green Neighbours' },
    ])

    // a follow-up request fails
    axiosInstance.get.mockRejectedValueOnce({ response: { data: { message: 'Load failed' } } })

    const result = await useFollowStore.getState().getMyFollowedOrganisations()

    // stale list from the earlier success is cleared, not left stale
    expect(result).toEqual({ success: false, error: 'Load failed' })
    const state = useFollowStore.getState()
    expect(state.followedOrganisations).toEqual([])
    expect(state.followError).toBe('Load failed')
    expect(state.isFollowedOrganisationsLoading).toBe(false)
  })

  it('loads the follow status for the selected Organisation', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { data: { isFollowing: true } } })

    await useFollowStore.getState().getFollowStatus('org-1')

    expect(axiosInstance.get).toHaveBeenCalledWith('/follow/organisations/org-1/status')
    expect(useFollowStore.getState().isFollowing).toBe(true)
  })

  it('adds a followed Organisation without duplicating list state', async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { success: true } })
    axiosInstance.get.mockResolvedValueOnce({
      data: { data: [{ _id: 'org-1', name: 'Green Neighbours' }] },
    })

    const result = await useFollowStore.getState().followOrganisation('org-1')

    // state always mirrors the server's refreshed list, so it can't duplicate
    expect(axiosInstance.post).toHaveBeenCalledWith('/follow/organisations/org-1')
    expect(result).toEqual({ success: true })
    const state = useFollowStore.getState()
    expect(state.isFollowing).toBe(true)
    expect(state.followedOrganisations).toEqual([{ _id: 'org-1', name: 'Green Neighbours' }])
  })

  it('removes an unfollowed Organisation and leaves the final state false', async () => {
    useFollowStore.setState({
      isFollowing: true,
      followedOrganisations: [{ _id: 'org-1', name: 'Green Neighbours' }],
    })
    axiosInstance.delete.mockResolvedValueOnce({ data: { success: true } })
    axiosInstance.get.mockResolvedValueOnce({ data: { data: [] } })

    await useFollowStore.getState().unfollowOrganisation('org-1')

    expect(axiosInstance.delete).toHaveBeenCalledWith('/follow/organisations/org-1')
    const state = useFollowStore.getState()
    expect(state.isFollowing).toBe(false)
    expect(state.followedOrganisations).toEqual([])
  })

  it('keeps mutation loading state scoped to the affected Organisation', async () => {
    // control when the follow request resolves
    let resolvePost
    axiosInstance.post.mockImplementationOnce(
      () => new Promise((resolve) => { resolvePost = resolve }),
    )

    // start following org-1
    const pending = useFollowStore.getState().followOrganisation('org-1')

    // mutation is scoped to org-1
    expect(useFollowStore.getState().followMutationOrganisationId).toBe('org-1')
    expect(useFollowStore.getState().isFollowLoading).toBe(true)

    // resolve the request
    axiosInstance.get.mockResolvedValueOnce({ data: { data: [] } })
    resolvePost({ data: { success: true } })
    await pending

    // scoping cleared once the mutation settles
    expect(useFollowStore.getState().followMutationOrganisationId).toBeNull()
    expect(useFollowStore.getState().isFollowLoading).toBe(false)
  })

  it('loads safe followers and reports access errors without stale data', async () => {
    // successful load first
    axiosInstance.get.mockResolvedValueOnce({
      data: { data: [{ _id: 'volunteer-1', name: 'Alex Tan' }] },
    })
    await useFollowStore.getState().getOrganisationFollowers('org-1')
    expect(useFollowStore.getState().followers).toEqual([{ _id: 'volunteer-1', name: 'Alex Tan' }])

    // a follow-up request is denied
    axiosInstance.get.mockRejectedValueOnce({
      response: { data: { message: 'You are not authorised to view these followers.' } },
    })
    const result = await useFollowStore.getState().getOrganisationFollowers('org-1')

    // no stale followers remain visible
    expect(result.success).toBe(false)
    const state = useFollowStore.getState()
    expect(state.followers).toEqual([])
    expect(state.followersError).toBe('You are not authorised to view these followers.')
  })
})
