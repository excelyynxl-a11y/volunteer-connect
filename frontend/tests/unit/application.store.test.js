import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosInstance } from '../../src/lib/axios.js'
import { useApplicationStore } from '../../src/store/useApplicationStore.js'

vi.mock('../../src/lib/axios.js', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

const initialState = useApplicationStore.getState()

beforeEach(() => {
  useApplicationStore.setState(initialState, true)
  vi.clearAllMocks()
})

describe('application store', () => {
  it('loads Volunteer applications with an optional status filter', async () => {
    const applications = [{ _id: 'application-1', status: 'pending' }]
    axiosInstance.get.mockResolvedValue({ data: { success: true, data: applications } })

    const result = await useApplicationStore.getState().getMyApplications({ status: 'pending' })

    expect(axiosInstance.get).toHaveBeenCalledWith('/application', {
      params: { status: 'pending', page: 1, limit: 100 },
    })
    expect(result).toEqual({ success: true, data: applications })
    expect(useApplicationStore.getState()).toMatchObject({
      applications,
      isApplicationsLoading: false,
      applicationsError: '',
    })
  })

  it('loads Organisation applications with status and opportunity filters', async () => {
    const applications = [{ _id: 'application-1', opportunityId: 'opportunity-1' }]
    axiosInstance.get.mockResolvedValue({ data: { data: applications } })

    await useApplicationStore.getState().getMyOrganisationApplications({
      status: 'approved',
      opportunityId: 'opportunity-1',
    })

    expect(axiosInstance.get).toHaveBeenCalledWith('/application/organisation', {
      params: { status: 'approved', opportunityId: 'opportunity-1', page: 1, limit: 100 },
    })
    expect(useApplicationStore.getState().applications).toEqual(applications)
  })

  it('loads the selected application and replaces stale detail', async () => {
    useApplicationStore.setState({ selectedApplication: { _id: 'stale' } })
    const application = { _id: 'application-1', status: 'approved' }
    axiosInstance.get.mockResolvedValue({ data: { data: application } })

    await useApplicationStore.getState().getApplicationById('application-1')

    expect(axiosInstance.get).toHaveBeenCalledWith('/application/application-1')
    expect(useApplicationStore.getState().selectedApplication).toEqual(application)
  })

  it('adds a newly created application without duplicating existing state', async () => {
    const existing = { _id: 'application-1' }
    const created = { _id: 'application-2', status: 'pending' }
    useApplicationStore.setState({ applications: [existing] })
    axiosInstance.post.mockResolvedValue({ data: { data: created } })

    await useApplicationStore.getState().createApplication('opportunity-1')

    expect(axiosInstance.post).toHaveBeenCalledWith('/application', {
      opportunityId: 'opportunity-1',
    })
    expect(useApplicationStore.getState().applications).toEqual([created, existing])
  })

  it('replaces the matching application after approve, reject, or withdraw', async () => {
    useApplicationStore.setState({
      applications: [{ _id: 'application-1', status: 'pending' }, { _id: 'unchanged' }],
    })
    for (const [action, status] of [
      ['approveApplication', 'approved'],
      ['rejectApplication', 'rejected'],
      ['withdrawApplication', 'withdrawn'],
    ]) {
      const updated = { _id: 'application-1', status }
      axiosInstance.put.mockResolvedValueOnce({ data: { data: updated } })
      await useApplicationStore.getState()[action]('application-1', 'Reason')
      expect(useApplicationStore.getState().applications).toEqual([
        updated,
        { _id: 'unchanged' },
      ])
    }
  })

  it('sends rejection and withdrawal reasons in the confirmed API shape', async () => {
    axiosInstance.put.mockResolvedValue({ data: { data: { _id: 'application-1' } } })

    await useApplicationStore.getState().rejectApplication('application-1', 'Not suitable')
    expect(axiosInstance.put).toHaveBeenCalledWith(
      '/application/application-1/reject',
      { reason: 'Not suitable', rejectionReason: 'Not suitable' },
    )

    await useApplicationStore.getState().withdrawApplication('application-1', 'Schedule conflict')
    expect(axiosInstance.put).toHaveBeenCalledWith(
      '/application/application-1/withdraw',
      { withdrawalReason: 'Schedule conflict' },
    )
  })

  it('sets and clears loading and error state for every failed action', async () => {
    const error = { response: { data: { message: 'Request failed' } } }
    const actions = [
      ['get', () => useApplicationStore.getState().getMyApplications()],
      ['get', () => useApplicationStore.getState().getMyOrganisationApplications()],
      ['get', () => useApplicationStore.getState().getApplicationById('application-1')],
      ['post', () => useApplicationStore.getState().createApplication('opportunity-1')],
      ['put', () => useApplicationStore.getState().approveApplication('application-1')],
      ['put', () => useApplicationStore.getState().rejectApplication('application-1', 'Reason')],
      ['put', () => useApplicationStore.getState().withdrawApplication('application-1', 'Reason')],
    ]

    for (const [method, action] of actions) {
      axiosInstance[method].mockRejectedValueOnce(error)
      await expect(action()).rejects.toBe(error)
      expect(useApplicationStore.getState()).toMatchObject({
        isApplicationsLoading: false,
        isSubmittingApplication: false,
        isUpdatingApplication: false,
        applicationsError: 'Request failed',
      })
    }
  })
})
