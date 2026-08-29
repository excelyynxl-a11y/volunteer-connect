import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ManageReport from '../../src/pages/Admin/ManageReport.jsx'
import OrganisationReport from '../../src/pages/Organisation/OrganisationReport.jsx'
import ReportMadePage from '../../src/pages/Report/ReportMadePage.jsx'
import VolunteerReport from '../../src/pages/Volunteer/VolunteerReport.jsx'

const mocks = vi.hoisted(() => ({
  report: {
    createReport: vi.fn(),
    getMyReports: vi.fn(),
    previousReports: [],
    isPreviousReportsLoading: false,
  },
  application: {
    applications: [],
    getMyApplications: vi.fn(),
    getMyOrganisationApplications: vi.fn(),
  },
  admin: {
    reports: [],
    isReportsLoading: false,
    getAllReports: vi.fn(),
    updateReportStatus: vi.fn(),
  },
}))

vi.mock('../../src/store/useReportStore.js', () => ({
  useReportStore: () => mocks.report,
}))
vi.mock('../../src/store/useApplicationStore.js', () => ({
  useApplicationStore: () => mocks.application,
}))
vi.mock('../../src/store/useAdminStore.js', () => ({
  useAdminStore: () => mocks.admin,
}))

const opportunityReport = {
  _id: 'report-1',
  reportType: 'OpportunityViolation',
  opportunityViolationType: 'Hazardous Environment',
  reportedOpportunityId: { _id: 'opportunity-1', title: 'Beach Cleanup' },
  title: 'Unsafe cleanup site',
  details: 'Protective equipment was unavailable.',
  status: 'Pending',
  createdAt: '2026-08-20T10:00:00.000Z',
}

const userReport = {
  _id: 'report-2',
  reportType: 'UserViolation',
  userViolationType: 'Not Punctual',
  reportedUserId: { _id: 'volunteer-1', name: 'Alex Tan' },
  title: 'Repeated late arrival',
  details: 'The volunteer arrived after the shift ended.',
  status: 'Investigating',
  createdAt: '2026-08-21T10:00:00.000Z',
}

const renderPage = (element, path = '/volunteer-dashboard/report') => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="*" element={element} />
    </Routes>
  </MemoryRouter>,
)

const renderAdminDetail = () => render(
  <MemoryRouter initialEntries={['/admin-dashboard/manage-report/report-1']}>
    <Routes>
      <Route
        path="/admin-dashboard/manage-report/:reportId"
        element={<ReportMadePage />}
      />
    </Routes>
  </MemoryRouter>,
)

beforeEach(() => {
  vi.clearAllMocks()
  Object.assign(mocks.report, {
    previousReports: [],
    isPreviousReportsLoading: false,
  })
  mocks.report.createReport.mockResolvedValue({ success: true })
  mocks.report.getMyReports.mockResolvedValue({ success: true })
  Object.assign(mocks.application, { applications: [] })
  mocks.application.getMyApplications.mockResolvedValue({ success: true })
  mocks.application.getMyOrganisationApplications.mockResolvedValue({ success: true })
  Object.assign(mocks.admin, { reports: [], isReportsLoading: false })
  mocks.admin.getAllReports.mockResolvedValue({ success: true })
  mocks.admin.updateReportStatus.mockResolvedValue({ success: true })
})

describe('Reporting UI', () => {
  it('shows the correct report type and target fields for a Volunteer', () => {
    mocks.application.applications = [
      { opportunityId: { _id: 'opportunity-1', title: 'Beach Cleanup' } },
    ]

    renderPage(<VolunteerReport />)

    expect(screen.getByText('Reported Opportunity')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Beach Cleanup' })).toBeInTheDocument()
    expect(mocks.report.getMyReports).toHaveBeenCalledWith('OpportunityViolation')
    expect(mocks.application.getMyApplications).toHaveBeenCalledOnce()
  })

  it('shows the correct report type and target fields for an Organisation', () => {
    mocks.application.applications = [
      { volunteerId: { _id: 'volunteer-1', name: 'Alex Tan' } },
    ]

    renderPage(<OrganisationReport />, '/organisation-dashboard/report')

    expect(screen.getByText('Reported Volunteer')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Alex Tan' })).toBeInTheDocument()
    expect(mocks.report.getMyReports).toHaveBeenCalledWith('UserViolation')
    expect(mocks.application.getMyOrganisationApplications).toHaveBeenCalledOnce()
  })

  it('validates subtype, title, details, and selected target before submission', async () => {
    renderPage(<VolunteerReport />)

    await userEvent.click(screen.getByRole('button', { name: 'Send Report' }))

    expect(screen.getByText('Please select the opportunity you are reporting')).toBeInTheDocument()
    expect(screen.getByText('Please select a violation type')).toBeInTheDocument()
    expect(screen.getByText('Report title is required')).toBeInTheDocument()
    expect(screen.getByText('Report details are required')).toBeInTheDocument()
    expect(mocks.report.createReport).not.toHaveBeenCalled()
  })

  it('submits once and preserves the form after a recoverable server error', async () => {
    mocks.application.applications = [
      { opportunityId: { _id: 'opportunity-1', title: 'Beach Cleanup' } },
    ]
    mocks.report.createReport.mockResolvedValue({ success: false, error: 'Unavailable' })
    const view = renderPage(<VolunteerReport />)

    fireEvent.change(view.container.querySelector('[name="reportedOpportunityId"]'), {
      target: { value: 'opportunity-1' },
    })
    fireEvent.change(view.container.querySelector('[name="opportunityViolationType"]'), {
      target: { value: 'Hazardous Environment' },
    })
    fireEvent.change(screen.getByPlaceholderText('Briefly describe the issue'), {
      target: { value: '  Unsafe site  ' },
    })
    fireEvent.change(screen.getByPlaceholderText('Provide a full description of the event or concern...'), {
      target: { value: '  No protective equipment.  ' },
    })
    fireEvent.submit(view.container.querySelector('form'))

    await waitFor(() => expect(mocks.report.createReport).toHaveBeenCalledOnce())
    expect(mocks.report.createReport).toHaveBeenCalledWith({
      reportType: 'OpportunityViolation',
      reportedOpportunityId: 'opportunity-1',
      opportunityViolationType: 'Hazardous Environment',
      title: 'Unsafe site',
      details: 'No protective equipment.',
    })
    expect(screen.getByPlaceholderText('Briefly describe the issue')).toHaveValue('  Unsafe site  ')
  })

  it('lists current-user report history with loading and empty states', () => {
    mocks.report.isPreviousReportsLoading = true
    const loadingView = renderPage(<VolunteerReport />)
    expect(screen.getByText('Loading previous reports...')).toBeInTheDocument()
    loadingView.unmount()

    mocks.report.isPreviousReportsLoading = false
    const emptyView = renderPage(<VolunteerReport />)
    expect(screen.getByText('You have not submitted any reports yet.')).toBeInTheDocument()
    emptyView.unmount()

    mocks.report.previousReports = [opportunityReport]
    renderPage(<VolunteerReport />)
    expect(screen.getByText('Unsafe cleanup site')).toBeInTheDocument()
    expect(screen.queryByText('Repeated late arrival')).not.toBeInTheDocument()
  })

  it('lets an Admin filter, open, and update a report status', async () => {
    const user = userEvent.setup()
    mocks.admin.reports = [opportunityReport, userReport]

    render(
      <MemoryRouter initialEntries={['/admin-dashboard/manage-report']}>
        <Routes>
          <Route path="/admin-dashboard/manage-report" element={<ManageReport />} />
          <Route
            path="/admin-dashboard/manage-report/:reportId"
            element={<ReportMadePage />}
          />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('Search by title, type, or user...'), 'unsafe')
    expect(screen.getByText('Unsafe cleanup site')).toBeInTheDocument()
    expect(screen.queryByText('Repeated late arrival')).not.toBeInTheDocument()

    await user.click(screen.getByText('Unsafe cleanup site'))
    await user.click(screen.getByTitle('Edit report status'))
    await user.click(screen.getByRole('button', { name: 'Resolved' }))

    expect(mocks.admin.updateReportStatus).toHaveBeenCalledWith('report-1', 'Resolved')
    expect((await screen.findAllByText('Resolved')).length).toBeGreaterThan(0)
  })

  it('prevents repeated current-status actions and keeps safe state after failure', async () => {
    const user = userEvent.setup()
    mocks.admin.reports = [opportunityReport]
    renderAdminDetail()

    await user.click(screen.getByTitle('Edit report status'))
    await user.click(screen.getByRole('button', { name: 'Pending' }))
    expect(mocks.admin.updateReportStatus).not.toHaveBeenCalled()

    mocks.admin.updateReportStatus.mockResolvedValue({ success: false, error: 'Unavailable' })
    await user.click(screen.getByTitle('Edit report status'))
    await user.click(screen.getByRole('button', { name: 'Resolved' }))

    expect(mocks.admin.updateReportStatus).toHaveBeenCalledOnce()
    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0)
    expect(screen.queryByText('Report not found. It may have been removed.')).not.toBeInTheDocument()
  })
})
