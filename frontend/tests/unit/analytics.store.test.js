import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosInstance } from '../../src/lib/axios.js'
import toast from 'react-hot-toast'
import { useAnalyticsStore } from '../../src/store/useAnalyticsStore.js'

vi.mock('../../src/lib/axios.js', () => ({
  axiosInstance: {
    get: vi.fn(),
  },
}))

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
  },
}))

const initialState = useAnalyticsStore.getState()

const deferred = () => {
  let resolve
  let reject
  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })
  return { promise, resolve, reject }
}

const resetStore = () => useAnalyticsStore.setState(initialState, true)

beforeEach(() => {
  resetStore()
  vi.clearAllMocks()
})

describe('analytics store', () => {
  it('loads a metric with the requested month range and balances loading state', async () => {
    const request = deferred()
    axiosInstance.get.mockReturnValueOnce(request.promise)

    const resultPromise = useAnalyticsStore
      .getState()
      .getVolunteerSignUpAnalytics('2026-01', '2026-03')

    expect(useAnalyticsStore.getState().isVolunteerSignUpAnaltyicsLoading).toBe(true)
    expect(axiosInstance.get).toHaveBeenCalledWith('/analytics/volunteer-signups', {
      params: { startMonth: '2026-01', endMonth: '2026-03' },
    })

    request.resolve({ data: [{ month: '2026-01', count: 2 }] })
    await expect(resultPromise).resolves.toEqual({
      success: true,
      data: [{ month: '2026-01', count: 2 }],
    })

    expect(useAnalyticsStore.getState()).toMatchObject({
      volunteerSignUpAnaltyics: [{ month: '2026-01', count: 2 }],
      isVolunteerSignUpAnaltyicsLoading: false,
      volunteerSignUpAnalyticsError: '',
    })
  })

  it('uses safe defaults when an endpoint returns a non-array payload', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { count: 4 } })

    const result = await useAnalyticsStore
      .getState()
      .getReportAnalytics('2026-01', '2026-02')

    expect(result).toEqual({ success: true, data: [] })
    expect(useAnalyticsStore.getState().reportAnaltyics).toEqual([])
  })

  it('clears stale metric data and reports the server error', async () => {
    useAnalyticsStore.setState({
      opportunityCreatedAnaltyics: [{ month: '2026-01', count: 9 }],
    })
    axiosInstance.get.mockRejectedValueOnce({
      response: { data: { message: 'Analytics unavailable' } },
    })

    const result = await useAnalyticsStore
      .getState()
      .getOpportunityCreatedAnalytics('2026-01', '2026-02')

    expect(result).toEqual({ success: false, error: 'Analytics unavailable' })
    expect(useAnalyticsStore.getState()).toMatchObject({
      opportunityCreatedAnaltyics: [],
      opportunityCreatedAnalyticsError: 'Analytics unavailable',
      isOpportunityCreatedAnaltyicsLoading: false,
    })
    expect(toast.error).toHaveBeenCalledWith('Analytics unavailable')
  })

  it('loads the overview independently and preserves successful metrics when one fails', async () => {
    axiosInstance.get.mockImplementation((path) => {
      const responses = {
        '/analytics/volunteer-signups': [{ month: '2026-01', count: 2 }],
        '/analytics/organisation-signups': [{ month: '2026-01', count: 1 }],
        '/analytics/opportunities-created': [{ month: '2026-01', count: 3 }],
      }

      if (path === '/analytics/reports') {
        return Promise.reject(new Error('Reports endpoint failed'))
      }

      return Promise.resolve({ data: responses[path] })
    })

    const result = await useAnalyticsStore
      .getState()
      .getAnalyticsOverview('2026-01', '2026-02')

    expect(result).toEqual({ success: true })
    expect(useAnalyticsStore.getState()).toMatchObject({
      volunteerSignUpAnaltyics: [{ month: '2026-01', count: 2 }],
      organisationSignUpAnaltyics: [{ month: '2026-01', count: 1 }],
      opportunityCreatedAnaltyics: [{ month: '2026-01', count: 3 }],
      reportAnaltyics: [],
      reportAnalyticsError: 'Reports endpoint failed',
      isVolunteerSignUpAnaltyicsLoading: false,
      isOrganisationSignUpAnaltyicsLoading: false,
      isOpportunityCreatedAnaltyicsLoading: false,
      isReportAnaltyicsLoading: false,
    })
    expect(axiosInstance.get).toHaveBeenNthCalledWith(1, '/analytics/volunteer-signups', {
      params: { startMonth: '2026-01', endMonth: '2026-02' },
    })
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('does not let an older overview request overwrite a newer one', async () => {
    const firstRequests = Array.from({ length: 4 }, deferred)
    const secondRequests = Array.from({ length: 4 }, deferred)
    let requestIndex = 0

    axiosInstance.get.mockImplementation(() => {
      const requestSet = requestIndex < 4 ? firstRequests : secondRequests
      const request = requestSet[requestIndex % 4]
      requestIndex += 1
      return request.promise
    })

    vi.spyOn(Date, 'now').mockReturnValueOnce(1).mockReturnValueOnce(2)

    const oldOverview = useAnalyticsStore
      .getState()
      .getAnalyticsOverview('2026-01', '2026-02')
    const newOverview = useAnalyticsStore
      .getState()
      .getAnalyticsOverview('2026-03', '2026-04')

    secondRequests.forEach((request, index) => {
      request.resolve({ data: [{ month: `2026-0${index + 3}`, count: 8 }] })
    })
    await expect(newOverview).resolves.toEqual({ success: true })

    firstRequests.forEach((request) => {
      request.resolve({ data: [{ month: '2026-01', count: 1 }] })
    })
    await expect(oldOverview).resolves.toEqual({ success: false, stale: true })

    expect(useAnalyticsStore.getState().volunteerSignUpAnaltyics).toEqual([
      { month: '2026-03', count: 8 },
    ])
    expect(useAnalyticsStore.getState().analyticsOverviewRequestId).toBe(2)
  })
})
