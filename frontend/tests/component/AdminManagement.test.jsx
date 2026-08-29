import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import AdminHomepage from '../../src/pages/Admin/AdminHomepage.jsx'
import AdminProfile from '../../src/pages/Admin/AdminProfile.jsx'
import ManageOrganisation from '../../src/pages/Admin/ManageOrganisation.jsx'
import ManageOpportunity from '../../src/pages/Admin/ManageOpportunity.jsx'
import ManageVolunteer from '../../src/pages/Admin/ManageVolunteer.jsx'
import { useAdminStore } from '../../src/store/useAdminStore.js'
import { useAuthStore } from '../../src/store/useAuthStore.js'

const volunteer = {
  _id: 'volunteer-1',
  name: 'Alex Volunteer',
  email: 'alex@example.com',
  ageGroup: '21-30',
  approvalStatus: 'pending',
  biodata: '',
  skills: [],
  availability: [],
  resume: '',
  createdAt: '2030-01-01T00:00:00.000Z',
  updatedAt: '2030-01-02T00:00:00.000Z',
}

const organisation = {
  _id: 'organisation-1',
  name: 'Green Neighbours',
  email: 'hello@green.example',
  approvalStatus: 'approved',
  biodata: 'Local environmental organisation',
  createdAt: '2030-01-01T00:00:00.000Z',
  updatedAt: '2030-01-02T00:00:00.000Z',
}

const opportunity = {
  _id: 'opportunity-1',
  title: 'Community Garden Day',
  organisationId: { name: 'Green Neighbours' },
  category: ['Environment'],
  location: 'Clayton',
  status: 'active',
  details: 'Help prepare a community garden.',
  startAt: '2030-02-01T01:00:00.000Z',
  endAt: '2030-02-01T03:00:00.000Z',
  applicationDeadline: '2030-01-25T00:00:00.000Z',
  maxVolunteers: 10,
  approvedVolunteersCount: 2,
  images: [],
  createdAt: '2030-01-01T00:00:00.000Z',
}

const resetStores = () => {
  useAdminStore.setState({
    volunteers: [],
    organisations: [],
    opportunities: [],
    reports: [],
    isStatsLoading: false,
    statsError: '',
    isUsersLoading: false,
    isOpportunitiesLoading: false,
    opportunitiesError: '',
    isUpdating: false,
  })
  useAuthStore.setState({ authUser: null })
}

afterEach(() => {
  vi.restoreAllMocks()
  resetStores()
})

describe('Admin management UI', () => {
  it('shows dashboard counts with loading, error, and retry states', async () => {
    const getStats = vi.fn()
    useAdminStore.setState({ getStats, isStatsLoading: true })
    const view = render(<AdminHomepage />, { wrapper: MemoryRouter })
    expect(screen.getByText('Loading platform overview...')).toBeInTheDocument()

    useAdminStore.setState({ isStatsLoading: false, statsError: 'Service unavailable' })
    view.rerender(<AdminHomepage />)
    expect(screen.getByRole('alert')).toHaveTextContent('Service unavailable')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try Again' }))
    expect(getStats).toHaveBeenCalledTimes(2)

    useAdminStore.setState({
      statsError: '',
      volunteers: [volunteer, { ...volunteer, _id: 'v2', approvalStatus: 'approved' }],
      organisations: [organisation],
      opportunities: [opportunity],
      reports: [{ _id: 'report-1', status: 'investigating' }],
    })
    view.rerender(<AdminHomepage />)
    expect(screen.getByText('Approved Volunteers').previousSibling).toHaveTextContent('1')
    expect(screen.getByText('Open Reports').previousSibling).toHaveTextContent('1')
  })

  it('lists and filters Volunteers and Organisations', async () => {
    const user = userEvent.setup()
    useAdminStore.setState({
      getAllVolunteers: vi.fn(),
      volunteers: [volunteer, { ...volunteer, _id: 'v2', name: 'Sam Lee', email: 'sam@example.com', ageGroup: '31-40' }],
    })
    const view = render(<ManageVolunteer />)
    expect(screen.getByText('Alex Volunteer')).toBeInTheDocument()
    expect(screen.getByText('Sam Lee')).toBeInTheDocument()
    await user.type(screen.getByPlaceholderText('Search by name or email...'), 'Alex')
    expect(screen.getByText('Alex Volunteer')).toBeInTheDocument()
    expect(screen.queryByText('Sam Lee')).not.toBeInTheDocument()

    useAdminStore.setState({ getAllOrganisations: vi.fn(), organisations: [organisation] })
    view.rerender(<ManageOrganisation />)
    expect(screen.getByText('Green Neighbours')).toBeInTheDocument()
    await user.selectOptions(screen.getByRole('combobox'), 'rejected')
    expect(screen.getByText('No organisations found')).toBeInTheDocument()
  })

  it('opens a safe user preview and closes it accessibly', async () => {
    const user = userEvent.setup()
    useAdminStore.setState({ getAllVolunteers: vi.fn(), volunteers: [volunteer] })
    render(<ManageVolunteer />)

    await user.click(screen.getByTitle('Manage volunteer'))
    expect(screen.getByRole('heading', { level: 2, name: 'Alex Volunteer' })).toBeInTheDocument()
    expect(screen.getAllByText('alex@example.com')).toHaveLength(2)
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
    await user.click(document.querySelector('.admin-modal-close'))
    expect(screen.queryByRole('heading', { level: 2, name: 'Alex Volunteer' })).not.toBeInTheDocument()
  })

  it('confirms approval or rejection and updates the visible row', async () => {
    const user = userEvent.setup()
    const approveUserAccount = vi.fn((id, onClose) => {
      useAdminStore.setState({ volunteers: [{ ...volunteer, approvalStatus: 'approved' }] })
      onClose()
    })
    useAdminStore.setState({
      getAllVolunteers: vi.fn(),
      volunteers: [volunteer],
      approveUserAccount,
      rejectUserAccount: vi.fn(),
    })
    render(<ManageVolunteer />)

    await user.click(screen.getByTitle('Manage volunteer'))
    await user.click(screen.getByRole('button', { name: 'Approve' }))
    expect(approveUserAccount).toHaveBeenCalledWith('volunteer-1', expect.any(Function))
    expect(screen.getByText('approved')).toBeInTheDocument()
  })

  it('prevents repeated review actions after the reviewed modal closes', async () => {
    const user = userEvent.setup()
    const rejectUserAccount = vi.fn((id, onClose) => onClose())
    useAdminStore.setState({
      getAllVolunteers: vi.fn(),
      volunteers: [volunteer],
      approveUserAccount: vi.fn(),
      rejectUserAccount,
    })
    render(<ManageVolunteer />)

    await user.click(screen.getByTitle('Manage volunteer'))
    await user.click(screen.getByRole('button', { name: 'Reject' }))
    expect(rejectUserAccount).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument()
  })

  it('lists and previews opportunities without exposing edit actions', async () => {
    const user = userEvent.setup()
    useAdminStore.setState({ getAllOpportunities: vi.fn(), opportunities: [opportunity] })
    render(<ManageOpportunity />)

    expect(screen.getByText(/Community Garden Day/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Preview opportunity' }))
    expect(screen.getByRole('dialog', { name: 'Community Garden Day' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('updates the Admin name and keeps editing available after an error', async () => {
    const user = userEvent.setup()
    const updateAdminProfile = vi
      .fn()
      .mockResolvedValueOnce({ success: false, error: 'Update failed' })
      .mockResolvedValueOnce({ success: true })
    useAuthStore.setState({ authUser: { name: 'Admin One', email: 'admin@example.com' } })
    useAdminStore.setState({ updateAdminProfile })
    render(<AdminProfile />)

    await user.click(screen.getByRole('button', { name: 'Edit Profile' }))
    const nameInput = screen.getByDisplayValue('Admin One')
    await user.clear(nameInput)
    await user.type(nameInput, 'Admin Updated')
    await user.click(screen.getByRole('button', { name: 'Update' }))
    expect(updateAdminProfile).toHaveBeenLastCalledWith({ name: 'Admin Updated', avatar: null })
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Update' }))
    expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeInTheDocument()
  })
})
