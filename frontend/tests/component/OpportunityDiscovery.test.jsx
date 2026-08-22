import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import VolunteerOpportunities from '../../src/pages/Volunteer/VolunteerOpportunities.jsx'
import { useApplicationStore } from '../../src/store/useApplicationStore.js'
import { useAuthStore } from '../../src/store/useAuthStore.js'
import { useVolunteerStore } from '../../src/store/useVolunteerStore.js'

const openOpportunity = {
  _id: 'opportunity-1',
  title: 'Community Garden Day',
  details: 'Help prepare garden beds for local residents.',
  organisationId: { _id: 'organisation-1', name: 'Green Neighbours' },
  category: ['Environment'],
  location: 'Clayton',
  requirements: 'Closed shoes\nWater bottle',
  images: ['https://example.com/garden.jpg'],
  status: 'active',
  startAt: '2030-01-07T01:00:00.000Z',
  endAt: '2030-01-07T03:00:00.000Z',
  applicationDeadline: '2029-12-31T00:00:00.000Z',
  maxVolunteers: 10,
  approvedVolunteersCount: 3,
}

const secondOpportunity = {
  ...openOpportunity,
  _id: 'opportunity-2',
  title: 'Literacy Tutoring Session',
  details: 'Support learners with reading activities.',
  category: ['Education'],
  location: 'Caulfield',
}

const closedOpportunity = {
  ...openOpportunity,
  _id: 'opportunity-closed',
  title: 'Closed Event',
  status: 'closed',
}

const resetStores = () => {
  useAuthStore.setState({ authUser: { _id: 'volunteer-1', availability: [] } })
  useVolunteerStore.setState({
    opportunities: [],
    isOpportunitiesLoading: false,
    opportunitiesError: '',
    getAllOpportunities: vi.fn(),
  })
  useApplicationStore.setState({
    applications: [],
    getMyApplications: vi.fn(),
    createApplication: vi.fn(),
    isSubmittingApplication: false,
  })
}

const renderDiscovery = () =>
  render(
    <MemoryRouter initialEntries={['/volunteer-dashboard/opportunities']}>
      <Routes>
        <Route
          path="/volunteer-dashboard/opportunities"
          element={<VolunteerOpportunities />}
        />
        <Route
          path="/volunteer-dashboard/organisations/:organisationId"
          element={<h1>Public organisation profile</h1>}
        />
      </Routes>
    </MemoryRouter>,
  )

beforeAll(() => {
  window.scrollTo = vi.fn()
})

beforeEach(() => {
  resetStores()
})

afterEach(() => {
  vi.restoreAllMocks()
  resetStores()
})

describe('Volunteer opportunity discovery UI', () => {
  it('shows only currently open opportunities where the page requires open results', () => {
    useVolunteerStore.setState({ opportunities: [openOpportunity, closedOpportunity] })
    renderDiscovery()

    expect(screen.getByText('Community Garden Day')).toBeInTheDocument()
    expect(screen.queryByText('Closed Event')).not.toBeInTheDocument()
    expect(screen.getByText('1 results')).toBeInTheDocument()
  })

  it('searches and filters by the supported visible fields', async () => {
    const user = userEvent.setup()
    useVolunteerStore.setState({ opportunities: [openOpportunity, secondOpportunity] })
    renderDiscovery()

    await user.type(
      screen.getByPlaceholderText('Search opportunities, organisations or location'),
      'Caulfield literacy',
    )
    expect(screen.getByText('Literacy Tutoring Session')).toBeInTheDocument()
    expect(screen.queryByText('Community Garden Day')).not.toBeInTheDocument()

    await user.clear(
      screen.getByPlaceholderText('Search opportunities, organisations or location'),
    )
    await user.click(screen.getByLabelText('Education'))
    expect(screen.getByText('Literacy Tutoring Session')).toBeInTheDocument()
    expect(screen.queryByText('Community Garden Day')).not.toBeInTheDocument()
  })

  it('filters results without mutating the source data', async () => {
    const user = userEvent.setup()
    const source = [openOpportunity, secondOpportunity]
    useVolunteerStore.setState({ opportunities: source })
    renderDiscovery()

    await user.click(screen.getByLabelText('Environment'))
    expect(screen.getByText('Community Garden Day')).toBeInTheDocument()
    expect(useVolunteerStore.getState().opportunities).toBe(source)
    expect(useVolunteerStore.getState().opportunities.map((item) => item._id)).toEqual([
      'opportunity-1',
      'opportunity-2',
    ])
  })

  it('opens details with safe organisation, image, requirement, date, and capacity values', async () => {
    const user = userEvent.setup()
    useVolunteerStore.setState({ opportunities: [openOpportunity] })
    renderDiscovery()

    await user.click(screen.getByRole('button', { name: 'view Community Garden Day' }))
    const dialog = screen.getByRole('dialog', { name: 'Community Garden Day' })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText('Green Neighbours')).toBeInTheDocument()
    expect(within(dialog).getByAltText('Community Garden Day photo')).toBeInTheDocument()
    expect(within(dialog).getByText('Closed shoes')).toBeInTheDocument()
    expect(within(dialog).getByText('7 spots left')).toBeInTheDocument()
  })

  it('explains why Apply is blocked when availability does not cover the event', async () => {
    const user = userEvent.setup()
    useVolunteerStore.setState({ opportunities: [openOpportunity] })
    renderDiscovery()

    await user.click(screen.getByRole('button', { name: 'view Community Garden Day' }))
    expect(screen.getByRole('button', { name: 'Apply As Volunteer' })).toBeDisabled()
    expect(
      screen.getByText('Add your availability in your profile to apply for opportunities.'),
    ).toBeInTheDocument()
  })

  it('navigates from opportunity details to the public Organisation profile', async () => {
    const user = userEvent.setup()
    useVolunteerStore.setState({ opportunities: [openOpportunity] })
    renderDiscovery()

    await user.click(screen.getByRole('button', { name: 'view Community Garden Day' }))
    await user.click(screen.getByRole('button', { name: 'View organisation profile' }))
    expect(screen.getByRole('heading', { name: 'Public organisation profile' })).toBeInTheDocument()
  })

  it('renders loading, empty, error, and recovery states accessibly', () => {
    useVolunteerStore.setState({ isOpportunitiesLoading: true })
    const view = renderDiscovery()
    expect(screen.getByText('Loading opportunities...')).toBeInTheDocument()

    act(() => useVolunteerStore.setState({
      isOpportunitiesLoading: false,
      opportunitiesError: 'Unable to load opportunities.',
    }))
    expect(screen.getByText('Unable to load opportunities.')).toBeInTheDocument()

    act(() => useVolunteerStore.setState({ opportunitiesError: '' }))
    expect(screen.getByText('No active opportunities found.')).toBeInTheDocument()

    act(() => useVolunteerStore.setState({ opportunities: [openOpportunity] }))
    expect(screen.getByText('Community Garden Day')).toBeInTheDocument()
    view.unmount()
  })
})
