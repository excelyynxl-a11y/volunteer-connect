import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import AnalyticsChartCard from '../../src/components/AnalyticsChartCard.jsx'
import VolunteerAnalyticsCard from '../../src/components/VolunteerAnalyticsCard.jsx'
import OrganisationAnalyticsCard from '../../src/components/OrgansitionAnalyticsCard.jsx'
import OpportunityAnalyticsCard from '../../src/components/OpportunityAnalytics.jsx'
import ReportAnalyticsCard from '../../src/components/ReportAnalytics.jsx'

vi.mock('recharts', () => {
  const passthrough = ({ children }) => <div>{children}</div>

  return {
    Area: passthrough,
    AreaChart: passthrough,
    CartesianGrid: passthrough,
    ResponsiveContainer: passthrough,
    Tooltip: passthrough,
    XAxis: passthrough,
    YAxis: passthrough,
  }
})

const baseProps = {
  title: 'Monthly activity',
  subtitle: 'Activity subtitle',
  detailKey: 'items',
  data: [
    { month: '2026-01', count: 2, items: ['A', 'B'] },
    { month: '2026-02', count: 5, items: ['C'] },
  ],
}

describe('analytics chart cards', () => {
  it('renders loading, empty, and error states with a retry action', () => {
    const onRetry = vi.fn()
    const { rerender } = render(<AnalyticsChartCard {...baseProps} isLoading />)

    expect(screen.getByRole('heading', { name: 'Monthly activity' })).toBeInTheDocument()
    expect(screen.getByText('Loading analytics')).toBeInTheDocument()

    rerender(<AnalyticsChartCard {...baseProps} data={[]} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
    expect(screen.getByText('No activity recorded for this period.')).toBeInTheDocument()

    rerender(<AnalyticsChartCard {...baseProps} error="Analytics request failed" onRetry={onRetry} />)
    expect(screen.getByText('Could not load chart')).toBeInTheDocument()
    expect(screen.getByText('Analytics request failed')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('summarises populated chart data and renders the chart shell', () => {
    render(<AnalyticsChartCard {...baseProps} summaryLabel="sign-ups" />)

    expect(screen.getByText('Total sign-ups')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('Peak Feb 2026 (5)')).toBeInTheDocument()
    expect(document.querySelector('.admin-chart-shell')).toBeInTheDocument()
  })

  it('passes each analytics domain through its domain-specific card', () => {
    const { rerender } = render(
      <VolunteerAnalyticsCard volunteerSignUpList={[{ month: '2026-01', count: 1 }]} />,
    )
    expect(screen.getByRole('heading', { name: 'Volunteer Growth' })).toBeInTheDocument()

    rerender(
      <OrganisationAnalyticsCard organisationSignUpList={[{ month: '2026-01', count: 1 }]} />,
    )
    expect(screen.getByRole('heading', { name: 'Organisation Growth' })).toBeInTheDocument()

    rerender(
      <OpportunityAnalyticsCard opportunityCreatedList={[{ month: '2026-01', count: 1 }]} />,
    )
    expect(screen.getByRole('heading', { name: 'Opportunity Growth' })).toBeInTheDocument()

    rerender(<ReportAnalyticsCard reportList={[{ month: '2026-01', count: 1 }]} />)
    expect(screen.getByRole('heading', { name: 'Report Activity' })).toBeInTheDocument()
  })
})
