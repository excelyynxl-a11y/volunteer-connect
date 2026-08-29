import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AdminAnalytics from '../../src/pages/Admin/AdminAnalytics.jsx'
import { useAnalyticsStore } from '../../src/store/useAnalyticsStore.js'

vi.mock('../../src/store/useAnalyticsStore.js', () => ({
  useAnalyticsStore: vi.fn(),
}))

vi.mock('../../src/components/VolunteerAnalyticsCard.jsx', () => ({
  default: ({ volunteerSignUpList = [], onRetry }) => (
    <div data-testid="volunteer-analytics-card">
      Volunteer chart ({volunteerSignUpList.length})
      <button type="button" onClick={onRetry}>Retry volunteer analytics</button>
    </div>
  ),
}))

vi.mock('../../src/components/OrgansitionAnalyticsCard.jsx', () => ({
  default: ({ organisationSignUpList = [] }) => (
    <div data-testid="organisation-analytics-card">
      Organisation chart ({organisationSignUpList.length})
    </div>
  ),
}))

vi.mock('../../src/components/OpportunityAnalytics.jsx', () => ({
  default: ({ opportunityCreatedList = [] }) => (
    <div data-testid="opportunity-analytics-card">
      Opportunity chart ({opportunityCreatedList.length})
    </div>
  ),
}))

vi.mock('../../src/components/ReportAnalytics.jsx', () => ({
  default: ({ reportList = [] }) => (
    <div data-testid="report-analytics-card">Report chart ({reportList.length})</div>
  ),
}))

const getAnalyticsOverview = vi.fn().mockResolvedValue({ success: true })

const state = {
  volunteerSignUpAnaltyics: [{ month: '2026-01', count: 2 }],
  isVolunteerSignUpAnaltyicsLoading: false,
  volunteerSignUpAnalyticsError: '',
  organisationSignUpAnaltyics: [{ month: '2026-01', count: 1 }],
  isOrganisationSignUpAnaltyicsLoading: false,
  organisationSignUpAnalyticsError: '',
  opportunityCreatedAnaltyics: [{ month: '2026-01', count: 3 }],
  isOpportunityCreatedAnaltyicsLoading: false,
  opportunityCreatedAnalyticsError: '',
  reportAnaltyics: [{ month: '2026-01', count: 4 }],
  isReportAnaltyicsLoading: false,
  reportAnalyticsError: '',
  getAnalyticsOverview,
}

beforeEach(() => {
  vi.clearAllMocks()
  useAnalyticsStore.mockImplementation((selector) => selector(state))
})

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminAnalytics />
    </MemoryRouter>,
  )

describe('admin analytics page', () => {
  it('loads the overview, shows summary totals, and renders all chart domains', async () => {
    renderPage()

    await waitFor(() => expect(getAnalyticsOverview).toHaveBeenCalledOnce())
    expect(getAnalyticsOverview).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}$/), expect.stringMatching(/^\d{4}-\d{2}$/))
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText(/Showing data from/)).toBeInTheDocument()
    expect(screen.getByTestId('volunteer-analytics-card')).toHaveTextContent('Volunteer chart (1)')
    expect(screen.getByTestId('organisation-analytics-card')).toHaveTextContent('Organisation chart (1)')
    expect(screen.getByTestId('opportunity-analytics-card')).toHaveTextContent('Opportunity chart (1)')
    expect(screen.getByTestId('report-analytics-card')).toHaveTextContent('Report chart (1)')
  })

  it('blocks an invalid month range and allows resetting the range', async () => {
    renderPage()
    await waitFor(() => expect(getAnalyticsOverview).toHaveBeenCalledOnce())

    const startMonth = screen.getByLabelText(/Start month/i)
    const endMonth = screen.getByLabelText(/End month/i)
    fireEvent.change(startMonth, { target: { value: '2027-02' } })
    fireEvent.change(endMonth, { target: { value: '2027-01' } })

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid month range')
    const callsBeforeReset = getAnalyticsOverview.mock.calls.length
    fireEvent.click(screen.getByRole('button', { name: /Reset range/i }))

    await waitFor(() => expect(getAnalyticsOverview.mock.calls.length).toBeGreaterThan(callsBeforeReset))
    expect(screen.queryByText('Invalid month range')).not.toBeInTheDocument()
  })
})
