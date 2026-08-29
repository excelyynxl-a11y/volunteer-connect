import { render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import AdminStatsCard from '../../src/components/AdminStatsCard.jsx'

const Icon = () => <span aria-hidden="true" />

const LocationProbe = () => {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}</output>
}

const renderCard = (statKey) =>
  render(
    <MemoryRouter initialEntries={['/admin-dashboard']}>
      <AdminStatsCard Icon={Icon} value={3} label="Volunteers" statKey={statKey} />
      <LocationProbe />
    </MemoryRouter>,
  )

describe('AdminStatsCard', () => {
  it('renders an accessible value and label', () => {
    renderCard('volunteers')

    expect(screen.getByRole('button', { name: 'Volunteers: 3' })).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Volunteers')).toBeInTheDocument()
  })

  it.each([
    ['volunteers', '/admin-dashboard/manage-volunteer'],
    ['organisations', '/admin-dashboard/manage-organisation'],
    ['opportunities', '/admin-dashboard/manage-opportunity'],
    ['reports', '/admin-dashboard/manage-report'],
  ])('navigates %s cards to the corresponding management page', async (statKey, expectedPath) => {
    const user = userEvent.setup()
    renderCard(statKey)

    await user.click(screen.getByRole('button', { name: 'Volunteers: 3' }))
    expect(screen.getByTestId('location')).toHaveTextContent(expectedPath)
  })

  it('leaves the current page unchanged for an unknown stat key', async () => {
    const user = userEvent.setup()
    renderCard('unknown')

    await user.click(screen.getByRole('button', { name: 'Volunteers: 3' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/admin-dashboard')
  })
})
