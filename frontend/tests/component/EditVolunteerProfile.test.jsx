import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import EditVolunteerProfile from '../../src/pages/Volunteer/EditVolunteerProfile.jsx'
import { useAuthStore } from '../../src/store/useAuthStore.js'
import { useVolunteerStore } from '../../src/store/useVolunteerStore.js'

vi.mock('../../src/store/useAuthStore.js', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('../../src/store/useVolunteerStore.js', () => ({
  useVolunteerStore: vi.fn(),
}))

const createAuthUser = (overrides = {}) => ({
  _id: 'volunteer-1',
  name: 'Alex Tan',
  email: 'alex@example.com',
  ageGroup: '21-30',
  biodata: 'Loves gardening',
  approvalStatus: 'approved',
  skills: ['Teamwork'],
  availability: [],
  ...overrides,
})

const updateVolunteerProfile = vi.fn()

let authUser
let volunteerStore

const renderEditProfile = () =>
  render(
    <MemoryRouter>
      <EditVolunteerProfile />
    </MemoryRouter>,
  )

const chooseCustomOption = async (user, triggerName, optionName) => {
  await user.click(screen.getByRole('button', { name: triggerName }))
  await user.click(screen.getByRole('button', { name: optionName }))
}

beforeEach(() => {
  vi.clearAllMocks()
  authUser = createAuthUser()
  volunteerStore = {
    isUpdatingVolunteerProfile: false,
    updateVolunteerProfile,
  }
  useAuthStore.mockImplementation((selector) => selector({ authUser }))
  useVolunteerStore.mockReturnValue(volunteerStore)

  if (typeof URL.createObjectURL !== 'function') {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(),
    })
  }
  if (typeof URL.revokeObjectURL !== 'function') {
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    })
  }
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:avatar-preview')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('edit volunteer profile UI', () => {
  it('validates required name and age group before sending a save request', async () => {
    const user = userEvent.setup()
    authUser = createAuthUser({ name: '', ageGroup: '' })
    renderEditProfile()

    await user.click(screen.getByRole('button', { name: 'Save Profile' }))

    expect(screen.getByText('Full name is required.')).toBeInTheDocument()
    expect(screen.getByText('Age group is required.')).toBeInTheDocument()
    expect(updateVolunteerProfile).not.toHaveBeenCalled()
  })

  it('allows adjacent availability slots and blocks an overlapping slot', async () => {
    const user = userEvent.setup()
    authUser = createAuthUser({ availability: [] })
    renderEditProfile()

    await chooseCustomOption(user, 'Day of Week', 'Monday')
    await chooseCustomOption(user, 'Start Time', '09:00')
    await chooseCustomOption(user, 'End Time', '11:00')
    await user.click(document.querySelector('.add-slot-button'))
    expect(screen.getByText(/Monday, 09:00 - 11:00/)).toBeInTheDocument()

    await chooseCustomOption(user, 'Day of Week', 'Monday')
    await chooseCustomOption(user, 'Start Time', '11:00')
    await chooseCustomOption(user, 'End Time', '12:00')
    await user.click(document.querySelector('.add-slot-button'))
    expect(screen.getByText(/Monday, 11:00 - 12:00/)).toBeInTheDocument()

    await chooseCustomOption(user, 'Day of Week', 'Monday')
    await chooseCustomOption(user, 'Start Time', '10:00')
    await chooseCustomOption(user, 'End Time', '13:00')
    await user.click(document.querySelector('.add-slot-button'))

    expect(screen.getByText('Availability time ranges on the same day cannot overlap.')).toBeInTheDocument()
    expect(screen.queryByText(/Monday, 10:00 - 13:00/)).not.toBeInTheDocument()
  })

  it('previews a valid avatar and includes it in the profile update payload', async () => {
    const user = userEvent.setup()
    updateVolunteerProfile.mockResolvedValueOnce({
      success: true,
      profile: { ...authUser },
    })
    const view = renderEditProfile()
    const avatar = new File(['png-bytes'], 'avatar.png', { type: 'image/png' })

    fireEvent.change(view.container.querySelector('#volunteer-avatar-upload'), {
      target: { files: [avatar] },
    })

    expect(screen.getByAltText('Volunteer avatar preview')).toHaveAttribute(
      'src',
      'blob:avatar-preview',
    )

    await user.click(screen.getByRole('button', { name: 'Save Profile' }))
    await waitFor(() => expect(updateVolunteerProfile).toHaveBeenCalledOnce())
    expect(updateVolunteerProfile).toHaveBeenCalledWith(
      'volunteer-1',
      expect.objectContaining({ avatar }),
    )
  })

  it('disables duplicate saves while updating and displays a recoverable failure', async () => {
    authUser = createAuthUser()
    volunteerStore = {
      isUpdatingVolunteerProfile: true,
      updateVolunteerProfile,
    }
    useVolunteerStore.mockReturnValue(volunteerStore)
    const loadingView = renderEditProfile()
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled()

    loadingView.unmount()
    volunteerStore = {
      isUpdatingVolunteerProfile: false,
      updateVolunteerProfile: vi.fn().mockResolvedValue({
        success: false,
        error: 'Profile update unavailable',
      }),
    }
    useVolunteerStore.mockReturnValue(volunteerStore)
    const user = userEvent.setup()
    renderEditProfile()
    await user.click(screen.getByRole('button', { name: 'Save Profile' }))

    expect(await screen.findByText('Profile update unavailable')).toBeInTheDocument()
    expect(volunteerStore.updateVolunteerProfile).toHaveBeenCalledOnce()
  })
})
