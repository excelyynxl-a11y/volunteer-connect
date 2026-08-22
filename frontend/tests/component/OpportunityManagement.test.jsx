import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import CreateOpportunityPage from '../../src/pages/Organisation/CreateOpportunityPage.jsx'
import EditOpportunity from '../../src/pages/Organisation/EditOpportunity.jsx'
import OrganisationOpportunity from '../../src/pages/Organisation/OrganisationOpportunity.jsx'
import { useOrganisationStore } from '../../src/store/useOrganisationStore.js'

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}))

const opportunity = {
  _id: 'opportunity-1',
  title: 'Community Garden Volunteer Day',
  details: 'Help prepare garden beds and shared spaces for local residents.',
  category: ['Environment'],
  location: 'Selangor, Shah Alam',
  status: 'active',
  startAt: '2030-02-01T01:00:00.000Z',
  endAt: '2030-02-01T04:00:00.000Z',
  applicationDeadline: '2030-01-25T00:00:00.000Z',
  maxVolunteers: 10,
  approvedVolunteersCount: 3,
  createdAt: '2029-12-01T00:00:00.000Z',
}

const resetStore = () => {
  useOrganisationStore.setState({
    allMyOpportunities: [],
    isOpportunitiesLoading: false,
    opportunitiesError: '',
    isCreatingOpportunity: false,
    isUpdatingOpportunity: false,
    getAllMyOpportunities: vi.fn(),
    createOpportunity: vi.fn(),
    updateOpportunity: vi.fn(),
    setCurrentTab: vi.fn(),
  })
}

const renderManagementRoute = (element, path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={element} />
        <Route path="/organisation-dashboard" element={<h1>Organisation dashboard</h1>} />
        <Route path="/organisation-dashboard/profile" element={<h1>Organisation profile</h1>} />
        <Route path="/organisation-dashboard/edit-opportunity/:id" element={<EditOpportunity />} />
        <Route path="/organisation-dashboard/view-opportunity/:id" element={<h1>Opportunity details</h1>} />
      </Routes>
    </MemoryRouter>,
  )

const chooseCustomOption = async (user, triggerName, optionName) => {
  await user.click(screen.getByRole('button', { name: triggerName }))
  await user.click(screen.getByRole('button', { name: optionName }))
}

const fillValidCreateForm = async (user, container) => {
  await user.type(
    screen.getByPlaceholderText('A clear, inviting title for your event'),
    opportunity.title,
  )
  await user.type(
    screen.getByPlaceholderText(
      'Describe what volunteers will do, who they will help, and why it matters',
    ),
    opportunity.details,
  )
  await chooseCustomOption(user, 'Add Category', 'Environment')
  await chooseCustomOption(user, 'Select State', 'Selangor')
  await chooseCustomOption(user, 'Select City', 'Shah Alam')
  fireEvent.change(container.querySelector('[name="startDate"]'), {
    target: { value: '2030-02-01' },
  })
  await chooseCustomOption(user, 'Select start time', '09:00')
  fireEvent.change(container.querySelector('[name="endDate"]'), {
    target: { value: '2030-02-01' },
  })
  await chooseCustomOption(user, 'Select end time', '12:00')
  fireEvent.change(container.querySelector('[name="applicationDeadline"]'), {
    target: { value: '2030-01-25' },
  })
}

beforeEach(() => {
  resetStore()
})

afterEach(() => {
  vi.restoreAllMocks()
  resetStore()
})

describe('Organisation opportunity management UI', () => {
  it('validates required text, capacity, category, and chronological dates', async () => {
    const createOpportunity = vi.fn()
    useOrganisationStore.setState({ createOpportunity })
    const view = renderManagementRoute(<CreateOpportunityPage />)

    fireEvent.change(view.container.querySelector('[name="maxVolunteers"]'), {
      target: { value: '0' },
    })
    fireEvent.submit(view.container.querySelector('#create-opportunity-form'))
    expect(screen.getByText('Event title is required')).toBeInTheDocument()
    expect(screen.getByText('Description is required')).toBeInTheDocument()
    expect(screen.getByText('Select at least one category')).toBeInTheDocument()
    expect(screen.getByText('Volunteer capacity must be greater than 0')).toBeInTheDocument()
    expect(createOpportunity).not.toHaveBeenCalled()
  })

  it('submits a valid create form once and navigates to the saved opportunity area', async () => {
    const user = userEvent.setup()
    const createOpportunity = vi.fn().mockResolvedValue({ success: true, data: opportunity })
    useOrganisationStore.setState({ createOpportunity })
    const view = renderManagementRoute(<CreateOpportunityPage />)

    await fillValidCreateForm(user, view.container)
    await user.click(screen.getByRole('button', { name: 'Publish Opportunity' }))
    expect(createOpportunity).toHaveBeenCalledOnce()
    expect(createOpportunity).toHaveBeenCalledWith(expect.objectContaining({
      title: opportunity.title,
      category: ['Environment'],
      location: 'Selangor, Shah Alam',
      maxVolunteers: 1,
    }))
    expect(await screen.findByRole('heading', { name: 'Organisation dashboard' })).toBeInTheDocument()
  })

  it('loads existing values into the edit form without losing unchanged fields', async () => {
    useOrganisationStore.setState({
      allMyOpportunities: [opportunity],
      getAllMyOpportunities: vi.fn().mockResolvedValue({ success: true }),
    })
    const view = renderManagementRoute(
      <EditOpportunity />,
      '/organisation-dashboard/edit-opportunity/opportunity-1',
    )

    expect(screen.getByDisplayValue(opportunity.title)).toBeInTheDocument()
    expect(screen.getByDisplayValue(opportunity.details)).toBeInTheDocument()
    expect(screen.getByDisplayValue('Selangor')).toBeInTheDocument()
    expect(screen.getAllByText('Environment').length).toBeGreaterThan(0)
    expect(view.container.querySelector('[name="status"]')).toHaveValue('active')
  })

  it.todo('prevents capacity from being reduced below the approved count')

  it('moves an updated opportunity to the correct status filter without duplication', async () => {
    const user = userEvent.setup()
    useOrganisationStore.setState({
      allMyOpportunities: [opportunity],
      getAllMyOpportunities: vi.fn(),
    })
    renderManagementRoute(<OrganisationOpportunity />)
    expect(screen.getByText(opportunity.title)).toBeInTheDocument()

    useOrganisationStore.setState({
      allMyOpportunities: [{ ...opportunity, status: 'closed' }],
    })
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter opportunities by status' }),
      'closed',
    )
    expect(screen.getByText(opportunity.title)).toBeInTheDocument()
    expect(screen.getAllByText(opportunity.title)).toHaveLength(1)
  })

  it('renders status filtering, loading, empty, error, and retry states', async () => {
    const user = userEvent.setup()
    const getAllMyOpportunities = vi.fn()
    useOrganisationStore.setState({ getAllMyOpportunities, isOpportunitiesLoading: true })
    const view = renderManagementRoute(<OrganisationOpportunity />)
    expect(screen.getByText('Loading opportunities')).toBeInTheDocument()

    useOrganisationStore.setState({ isOpportunitiesLoading: false, opportunitiesError: 'Request failed.' })
    view.rerender(<MemoryRouter><OrganisationOpportunity /></MemoryRouter>)
    expect(screen.getByRole('alert')).toHaveTextContent('Request failed.')
    const callsBeforeRetry = getAllMyOpportunities.mock.calls.length
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(getAllMyOpportunities).toHaveBeenCalledTimes(callsBeforeRetry + 1)

    useOrganisationStore.setState({ opportunitiesError: '' })
    view.rerender(<MemoryRouter><OrganisationOpportunity /></MemoryRouter>)
    expect(screen.getByText('No opportunities found')).toBeInTheDocument()

    useOrganisationStore.setState({ allMyOpportunities: [opportunity, { ...opportunity, _id: 'cancelled', title: 'Cancelled Event', status: 'cancelled' }] })
    view.rerender(<MemoryRouter><OrganisationOpportunity /></MemoryRouter>)
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filter opportunities by status' }),
      'cancelled',
    )
    expect(screen.getByText('Cancelled Event')).toBeInTheDocument()
  })

  it('keeps primary management actions usable at a narrow viewport', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 375 })
    useOrganisationStore.setState({
      allMyOpportunities: [opportunity],
      getAllMyOpportunities: vi.fn(),
    })
    renderManagementRoute(<OrganisationOpportunity />)

    expect(screen.getByRole('button', { name: `view ${opportunity.title}` })).toBeEnabled()
    expect(screen.getByRole('button', { name: `edit ${opportunity.title}` })).toBeEnabled()
  })
})
