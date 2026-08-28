import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosInstance } from '../../src/lib/axios.js'
import { useReportStore } from '../../src/store/useReportStore.js'
import toast from 'react-hot-toast'

vi.mock('../../src/lib/axios.js', () => ({
  axiosInstance: { get: vi.fn(), post: vi.fn() },
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

const initialState = useReportStore.getState()

beforeEach(() => {
  useReportStore.setState(initialState, true)
  vi.clearAllMocks()
})

describe('report store', () => {
  it('loads only the requested current-user report type', async () => {
    const opportunityReport = { _id: 'report-1', reportType: 'OpportunityViolation' }
    const userReport = { _id: 'report-2', reportType: 'UserViolation' }
    axiosInstance.get.mockResolvedValue({ data: { reports: [opportunityReport, userReport] } })

    const result = await useReportStore.getState().getMyReports('UserViolation')

    expect(axiosInstance.get).toHaveBeenCalledWith('/report/my-reports')
    expect(result).toEqual({ success: true, data: [userReport] })
    expect(useReportStore.getState().previousReports).toEqual([userReport])
  })

  it('normalises a successful report list response', async () => {
    axiosInstance.get.mockResolvedValue({ data: { reports: null } })

    const result = await useReportStore.getState().getMyReports()

    expect(result).toEqual({ success: true, data: [] })
    expect(useReportStore.getState()).toMatchObject({
      previousReports: [],
      isPreviousReportsLoading: false,
      previousReportsError: '',
    })
  })

  it('clears stale reports and exposes a recoverable load error', async () => {
    useReportStore.setState({ previousReports: [{ _id: 'stale' }] })
    axiosInstance.get.mockRejectedValue({
      response: { data: { message: 'Reports unavailable' } },
    })

    const result = await useReportStore.getState().getMyReports()

    expect(result).toEqual({ success: false, error: 'Reports unavailable' })
    expect(useReportStore.getState()).toMatchObject({
      previousReports: [],
      previousReportsError: 'Reports unavailable',
      isPreviousReportsLoading: false,
    })
  })

  it('creates a report using the confirmed target payload', async () => {
    const payload = {
      reportType: 'OpportunityViolation',
      reportedOpportunityId: 'opportunity-1',
      opportunityViolationType: 'Hazardous Environment',
      title: 'Unsafe site',
      details: 'No protective equipment was provided.',
    }
    const created = { _id: 'report-1', ...payload }
    axiosInstance.post.mockResolvedValue({ data: { data: created } })

    const result = await useReportStore.getState().createReport(payload)

    expect(axiosInstance.post).toHaveBeenCalledWith('/report', payload)
    expect(result).toEqual({ success: true, data: created })
    expect(toast.success).toHaveBeenCalledOnce()
  })

  it('adds the created report without duplicating previous state', async () => {
    const existing = { _id: 'report-1', title: 'Existing' }
    const created = { _id: 'report-2', title: 'New report' }
    useReportStore.setState({ previousReports: [existing] })
    axiosInstance.post.mockResolvedValue({ data: { data: created } })

    await useReportStore.getState().createReport({ title: 'New report' })

    expect(useReportStore.getState().previousReports).toEqual([created, existing])
  })

  it('resets create loading state after success and failure', async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { data: { _id: 'report-1' } } })
    await useReportStore.getState().createReport({ title: 'Success' })
    expect(useReportStore.getState().isCreatingReport).toBe(false)

    axiosInstance.post.mockRejectedValueOnce(new Error('Network unavailable'))
    const result = await useReportStore.getState().createReport({ title: 'Failure' })

    expect(result).toEqual({ success: false, error: 'Network unavailable' })
    expect(useReportStore.getState().isCreatingReport).toBe(false)
    expect(toast.error).toHaveBeenCalledWith('Network unavailable')
  })
})
