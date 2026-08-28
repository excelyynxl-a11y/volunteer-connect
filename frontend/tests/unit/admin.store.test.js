import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosInstance } from '../../src/lib/axios.js'
import { useAdminStore } from '../../src/store/useAdminStore.js'
import toast from 'react-hot-toast'

const setAuthUser = vi.hoisted(() => vi.fn())

vi.mock('../../src/lib/axios.js', () => ({
  axiosInstance: { get: vi.fn(), patch: vi.fn(), put: vi.fn() },
}))
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))
vi.mock('../../src/store/useAuthStore.js', () => ({
  useAuthStore: { getState: () => ({ setAuthUser }) },
}))

const initialState = useAdminStore.getState()

beforeEach(() => {
  useAdminStore.setState(initialState, true)
  vi.clearAllMocks()
})

describe('admin store', () => {
  it('loads dashboard counts from current backend resources', async () => {
    axiosInstance.get
      .mockResolvedValueOnce({ data: { volunteers: [{ _id: 'vol-1' }] } })
      .mockResolvedValueOnce({ data: { organisations: [{ _id: 'org-1' }] } })
      .mockResolvedValueOnce({ data: { data: [{ _id: 'opp-1' }] } })
      .mockResolvedValueOnce({ data: { reports: [{ _id: 'report-1' }] } })

    const result = await useAdminStore.getState().getStats()

    expect(result).toEqual({ success: true })
    expect(axiosInstance.get.mock.calls.map(([url]) => url)).toEqual([
      '/user/volunteers',
      '/user/organisations',
      '/opportunities',
      '/report/',
    ])
    expect(useAdminStore.getState()).toMatchObject({
      volunteers: [{ _id: 'vol-1' }],
      organisations: [{ _id: 'org-1' }],
      opportunities: [{ _id: 'opp-1' }],
      reports: [{ _id: 'report-1' }],
      isStatsLoading: false,
      statsError: '',
    })
  })

  it('loads Volunteer and Organisation lists without keeping stale data', async () => {
    axiosInstance.get
      .mockResolvedValueOnce({ data: { volunteers: [{ _id: 'vol-1' }] } })
      .mockResolvedValueOnce({ data: { organisations: [{ _id: 'org-1' }] } })

    await useAdminStore.getState().getAllVolunteers()
    await useAdminStore.getState().getAllOrganisations()

    expect(useAdminStore.getState()).toMatchObject({
      volunteers: [{ _id: 'vol-1' }],
      organisations: [{ _id: 'org-1' }],
      isUsersLoading: false,
    })
  })

  it('refreshes the matching user after approval or rejection', async () => {
    const onClose = vi.fn()
    axiosInstance.patch.mockResolvedValueOnce({
      data: { user: { _id: 'vol-1', approvalStatus: 'approved' } },
    })
    axiosInstance.get
      .mockResolvedValueOnce({ data: { organisations: [] } })
      .mockResolvedValueOnce({
        data: { volunteers: [{ _id: 'vol-1', approvalStatus: 'approved' }] },
      })

    const result = await useAdminStore.getState().approveUserAccount('vol-1', onClose)

    expect(axiosInstance.patch).toHaveBeenCalledWith('/admin/users/vol-1/approve')
    expect(result.success).toBe(true)
    expect(useAdminStore.getState().volunteers[0].approvalStatus).toBe('approved')
    expect(onClose).toHaveBeenCalledOnce()

    axiosInstance.patch.mockResolvedValueOnce({
      data: { user: { _id: 'org-1', approvalStatus: 'rejected' } },
    })
    axiosInstance.get
      .mockResolvedValueOnce({
        data: { organisations: [{ _id: 'org-1', approvalStatus: 'rejected' }] },
      })
      .mockResolvedValueOnce({ data: { volunteers: [] } })
    await useAdminStore.getState().rejectUserAccount('org-1')
    expect(useAdminStore.getState().organisations[0].approvalStatus).toBe('rejected')
  })

  it('loads opportunities and reports with independent loading states', async () => {
    axiosInstance.get
      .mockResolvedValueOnce({ data: { data: [{ _id: 'opp-1' }] } })
      .mockResolvedValueOnce({ data: { reports: [{ _id: 'report-1' }] } })

    await useAdminStore.getState().getAllOpportunities()
    expect(useAdminStore.getState()).toMatchObject({
      opportunities: [{ _id: 'opp-1' }],
      isOpportunitiesLoading: false,
    })

    await useAdminStore.getState().getAllReports()
    expect(useAdminStore.getState()).toMatchObject({
      reports: [{ _id: 'report-1' }],
      isReportsLoading: false,
    })
  })

  it('replaces the matching report after a status update', async () => {
    const unchanged = { _id: 'report-1', status: 'Pending' }
    const updated = { _id: 'report-2', status: 'Resolved' }
    useAdminStore.setState({ reports: [unchanged, { _id: 'report-2', status: 'Pending' }] })
    axiosInstance.patch.mockResolvedValue({ data: { data: updated } })

    const result = await useAdminStore.getState().updateReportStatus('report-2', 'Resolved')

    expect(axiosInstance.patch).toHaveBeenCalledWith('/report/report-2', {
      status: 'Resolved',
    })
    expect(result).toEqual({ success: true, data: updated })
    expect(useAdminStore.getState().reports).toEqual([unchanged, updated])
    expect(useAdminStore.getState().isUpdating).toBe(false)
  })

  it('updates the authenticated Admin profile with multipart data', async () => {
    const avatar = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const updatedAdmin = { _id: 'admin-1', name: 'System Admin' }
    axiosInstance.put.mockResolvedValue({ data: { data: updatedAdmin } })

    const result = await useAdminStore.getState().updateAdminProfile({
      name: 'System Admin',
      avatar,
    })

    const [url, payload] = axiosInstance.put.mock.calls[0]
    expect(url).toBe('/admin/profile')
    expect(payload).toBeInstanceOf(FormData)
    expect(payload.get('name')).toBe('System Admin')
    expect(payload.get('profilePic')).toBe(avatar)
    expect(setAuthUser).toHaveBeenCalledWith(updatedAdmin)
    expect(result).toEqual({ success: true, data: updatedAdmin })
  })

  it('resets every mutation loading state after an API failure', async () => {
    axiosInstance.patch.mockRejectedValue({
      response: { data: { message: 'Update failed' } },
    })

    const reportResult = await useAdminStore.getState().updateReportStatus('report-1', 'Resolved')
    expect(reportResult).toEqual({ success: false, error: 'Update failed' })
    expect(useAdminStore.getState().isUpdating).toBe(false)

    axiosInstance.put.mockRejectedValue(new Error('Profile unavailable'))
    const profileResult = await useAdminStore.getState().updateAdminProfile({ name: 'Admin' })
    expect(profileResult).toEqual({ success: false, error: 'Profile unavailable' })
    expect(useAdminStore.getState().isUpdating).toBe(false)
    expect(toast.error).toHaveBeenCalled()
  })
})
