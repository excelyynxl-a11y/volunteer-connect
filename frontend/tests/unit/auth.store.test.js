import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosInstance } from '../../src/lib/axios.js'
import { useAuthStore } from '../../src/store/useAuthStore.js'
import toast from 'react-hot-toast'

vi.mock('../../src/lib/axios.js', () => ({
  axiosInstance: { get: vi.fn(), post: vi.fn() },
}))
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

const initialState = useAuthStore.getState()

beforeEach(() => {
  useAuthStore.setState(initialState, true)
  vi.clearAllMocks()
})

describe('authentication store', () => {
  it('stores the authenticated user after a successful auth check', async () => {
    const user = { _id: 'user-1', role: 'volunteer', approvalStatus: 'approved' }
    axiosInstance.get.mockResolvedValue({ data: user })

    await useAuthStore.getState().checkAuth()

    expect(axiosInstance.get).toHaveBeenCalledWith('/auth/check')
    expect(useAuthStore.getState()).toMatchObject({ authUser: user, isCheckingAuth: false })
  })

  it('clears stale user data when the auth check fails', async () => {
    useAuthStore.setState({ authUser: { _id: 'stale-user' }, isCheckingAuth: true })
    axiosInstance.get.mockRejectedValue({ response: { status: 401 } })

    await useAuthStore.getState().checkAuth()

    expect(useAuthStore.getState()).toMatchObject({ authUser: null, isCheckingAuth: false })
  })

  it('sets and resets signup loading state on success and failure', async () => {
    axiosInstance.post.mockResolvedValueOnce({
      data: { role: 'admin', approvalStatus: 'approved' },
    })
    await useAuthStore.getState().signUp({ role: 'admin' })
    expect(useAuthStore.getState().isSigningUp).toBe(false)

    axiosInstance.post.mockRejectedValueOnce(new Error('Network unavailable'))
    const result = await useAuthStore.getState().signUp({ role: 'volunteer' })
    expect(result).toEqual({ success: false, error: 'Network unavailable' })
    expect(useAuthStore.getState().isSigningUp).toBe(false)
    expect(toast.error).toHaveBeenCalledWith('Network unavailable')
  })

  it.each(['pending', 'rejected'])(
    'keeps a %s signup out of the authenticated state',
    async (approvalStatus) => {
      axiosInstance.post.mockResolvedValue({
        data: { _id: 'user-1', role: 'volunteer', approvalStatus },
      })

      const result = await useAuthStore.getState().signUp({ role: 'volunteer' })

      expect(result).toEqual({ success: true, role: 'volunteer', approvalStatus })
      expect(useAuthStore.getState().authUser).toBeNull()
    },
  )

  it('stores an approved user after successful login', async () => {
    const user = { _id: 'user-1', role: 'organisation', approvalStatus: 'approved' }
    axiosInstance.post.mockResolvedValue({ data: user })

    const result = await useAuthStore.getState().login({ email: 'org@example.com' })

    expect(axiosInstance.post).toHaveBeenCalledWith('/auth/login', {
      email: 'org@example.com',
    })
    expect(result).toEqual({
      success: true,
      role: 'organisation',
      approvalStatus: 'approved',
    })
    expect(useAuthStore.getState().authUser).toEqual(user)
  })

  it('preserves the server approval status in a failed login outcome', async () => {
    axiosInstance.post.mockRejectedValue({
      response: { data: { approvalStatus: 'rejected', role: 'volunteer' } },
    })

    const result = await useAuthStore.getState().login({ email: 'alex@example.com' })

    expect(result).toEqual({
      success: false,
      approvalStatus: 'rejected',
      role: 'volunteer',
    })
    expect(toast.error).not.toHaveBeenCalled()
    expect(useAuthStore.getState().isLoggingIn).toBe(false)
  })

  it('clears the authenticated user after logout even when UI navigation follows', async () => {
    useAuthStore.setState({ authUser: { _id: 'user-1' } })
    axiosInstance.post.mockResolvedValue({ data: { message: 'Logged out' } })

    await useAuthStore.getState().logout()

    expect(axiosInstance.post).toHaveBeenCalledWith('/auth/logout')
    expect(useAuthStore.getState().authUser).toBeNull()
    expect(toast.success).toHaveBeenCalledWith('Logged out successfully.')
  })
})
