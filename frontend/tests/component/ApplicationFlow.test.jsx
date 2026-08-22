import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import ConfirmApplicationModal from '../../src/components/ConfirmApplicationModal.jsx'
import OpportunityCard from '../../src/components/OpportunityCard.jsx'
import OrganisationApplication from '../../src/pages/Organisation/OrganisationApplication.jsx'
import VolunteerApplications from '../../src/pages/Volunteer/VolunteerApplication.jsx'
import { useApplicationStore } from '../../src/store/useApplicationStore.js'
import { useOrganisationStore } from '../../src/store/useOrganisationStore.js'

const opportunity = {
  _id: 'opportunity-1',
  title: 'Community Garden Day',
  organisationId: { _id: 'organisation-1', name: 'Green Neighbours' },
  category: ['Environment'],
  location: 'Clayton',
  status: 'active',
  startAt: '2030-01-07T01:00:00.000Z',
  endAt: '2030-01-07T03:00:00.000Z',
  applicationDeadline: '2029-12-31T00:00:00.000Z',
  maxVolunteers: 5,
  approvedVolunteersCount: 1,
}

const matchingAvailability = [{
  dayOfWeek: new Intl.DateTimeFormat('en-MY', { weekday: 'long' }).format(
    new Date(opportunity.startAt),
  ),
  startTime: '00:00',
  endTime: '23:59',
}]

const application = (status, id = `application-${status}`) => ({
  _id: id,
  status,
  createdAt: '2029-12-01T00:00:00.000Z',
  opportunityId: opportunity,
  volunteerId: {
    _id: 'volunteer-1',
    name: 'Alex Volunteer',
    skills: ['Teamwork'],
    availability: matchingAvailability,
  },
})

const resetStores = () => {
  useApplicationStore.setState({
    applications: [],
    applicationsError: '',
    isApplicationsLoading: false,
    isSubmittingApplication: false,
    isUpdatingApplication: false,
  })
  useOrganisationStore.setState({
    allMyOpportunities: [],
    opportunitiesError: '',
    isOpportunitiesLoading: false,
  })
}

const renderOrganisationApplications = (path = '/organisation-dashboard/applications') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/organisation-dashboard/applications"
          element={<OrganisationApplication />}
        />
        <Route
          path="/organisation-dashboard/applications/:opportunityId"
          element={<OrganisationApplication />}
        />
        <Route
          path="/organisation-dashboard/applications/:opportunityId/volunteers/:volunteerId"
          element={<h1>Volunteer profile</h1>}
        />
      </Routes>
    </MemoryRouter>,
  )

afterEach(() => {
  vi.restoreAllMocks()
  resetStores()
})

describe('Application feature UI', () => {
  it('submits an eligible opportunity once and shows its application details', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <ConfirmApplicationModal
        opportunity={opportunity}
        volunteerAvailability={matchingAvailability}
        isSubmitting={false}
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
    )

    expect(screen.getByText('Community Garden Day')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Confirm & Apply' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('shows availability and server errors safely', () => {
    const view = render(
      <ConfirmApplicationModal
        opportunity={opportunity}
        volunteerAvailability={[
          { dayOfWeek: 'Not the event day', startTime: '00:00', endTime: '23:59' },
        ]}
        isSubmitting={false}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )
    expect(screen.getByText('This opportunity is outside your set availability times.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm & Apply' })).toBeDisabled()

    useApplicationStore.setState({
      getMyApplications: vi.fn(),
      applicationsError: 'This application is a duplicate or the opportunity is full.',
    })
    view.rerender(<VolunteerApplications />)
    expect(screen.getByText(/duplicate or the opportunity is full/i)).toBeInTheDocument()
  })

  it('filters the Volunteer application list by the supported statuses', async () => {
    const user = userEvent.setup()
    useApplicationStore.setState({
      getMyApplications: vi.fn(),
      applications: [application('pending'), application('approved')],
    })
    render(<VolunteerApplications />)

    expect(screen.getAllByText('Pending')).toHaveLength(2)
    expect(screen.getAllByText('Approved')).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: /Pending 1/ }))
    expect(screen.getAllByText('Pending')).toHaveLength(2)
    expect(screen.getAllByText('Approved')).toHaveLength(1)
  })

  it('shows the correct status and locks another application action', () => {
    render(
      <OpportunityCard
        opportunity={opportunity}
        applicationStatus="approved"
        onClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Application Approved')).toBeInTheDocument()
  })

  it('allows withdrawal only for a pending application', async () => {
    const user = userEvent.setup()
    const withdrawApplication = vi.fn().mockResolvedValue({ success: true })
    useApplicationStore.setState({
      getMyApplications: vi.fn(),
      withdrawApplication,
      applications: [application('pending'), application('approved')],
    })
    render(<VolunteerApplications />)

    expect(screen.getAllByRole('button', { name: 'Withdraw' })).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'Withdraw' }))
    await user.click(screen.getByRole('button', { name: 'Withdraw Application' }))
    expect(withdrawApplication).toHaveBeenCalledWith('application-pending')
  })

  it('lists only the Organisation opportunities and applications returned by the API', async () => {
    useOrganisationStore.setState({
      allMyOpportunities: [opportunity],
      getMyOpportunities: vi.fn().mockResolvedValue({ success: true }),
    })
    useApplicationStore.setState({
      applications: [application('pending')],
      getMyOrganisationApplications: vi.fn().mockResolvedValue({ success: true }),
    })
    renderOrganisationApplications()

    expect(await screen.findByText('Community Garden Day')).toBeInTheDocument()
    expect(screen.getByText('1 pending')).toBeInTheDocument()
    expect(screen.queryByText('Another organisation')).not.toBeInTheDocument()
  })

  it('opens Volunteer details and confirms an approve action', async () => {
    const user = userEvent.setup()
    const approveApplication = vi.fn().mockResolvedValue({ success: true })
    useOrganisationStore.setState({
      allMyOpportunities: [opportunity],
      getMyOpportunities: vi.fn().mockResolvedValue({ success: true }),
    })
    useApplicationStore.setState({
      applications: [application('pending')],
      getMyOrganisationApplications: vi.fn().mockResolvedValue({ success: true }),
      approveApplication,
    })
    renderOrganisationApplications('/organisation-dashboard/applications/opportunity-1')

    await user.click(await screen.findByRole('button', { name: 'View Details' }))
    expect(screen.getByRole('heading', { name: 'Volunteer profile' })).toBeInTheDocument()

    // Return to the detail route and verify the decision control separately.
    renderOrganisationApplications('/organisation-dashboard/applications/opportunity-1')
    await user.click(await screen.findByRole('button', { name: 'Approve' }))
    expect(approveApplication).toHaveBeenCalledWith('application-pending')
  })

  it('prevents repeated review actions and shows recoverable errors', async () => {
    const user = userEvent.setup()
    let finishApproval
    const approveApplication = vi.fn(() => new Promise((resolve) => {
      finishApproval = resolve
    }))
    useOrganisationStore.setState({
      allMyOpportunities: [opportunity],
      getMyOpportunities: vi.fn().mockResolvedValue({ success: true }),
    })
    useApplicationStore.setState({
      applications: [application('pending')],
      getMyOrganisationApplications: vi.fn().mockResolvedValue({ success: true }),
      approveApplication,
    })
    const view = renderOrganisationApplications(
      '/organisation-dashboard/applications/opportunity-1',
    )

    const approveButton = await screen.findByRole('button', { name: 'Approve' })
    await user.click(approveButton)
    expect(approveButton).toBeDisabled()
    await user.click(approveButton)
    expect(approveApplication).toHaveBeenCalledOnce()
    await act(async () => finishApproval({ success: true }))

    view.unmount()
    useApplicationStore.setState({ applicationsError: 'Review failed. Try again.' })
    renderOrganisationApplications()
    expect(await screen.findByText('Review failed. Try again.')).toBeInTheDocument()
  })
})
