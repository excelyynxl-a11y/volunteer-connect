import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import ConfirmApplicationModal from '../../src/components/ConfirmApplicationModal.jsx'

const opportunity = {
  _id: 'opportunity-1',
  title: 'Community Garden Day',
  organisationId: { name: 'Green Neighbours' },
  startAt: '2030-01-07T01:00:00.000Z',
  endAt: '2030-01-07T03:00:00.000Z',
}

const matchingAvailability = [
  {
    dayOfWeek: new Intl.DateTimeFormat('en-MY', {
      weekday: 'long',
    }).format(new Date(opportunity.startAt)),
    startTime: '00:00',
    endTime: '23:59',
  },
]

describe('ConfirmApplicationModal', () => {
  it('lets the volunteer confirm an eligible application', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <ConfirmApplicationModal
        opportunity={opportunity}
        onCancel={vi.fn()}
        onConfirm={onConfirm}
        volunteerAvailability={matchingAvailability}
        isSubmitting={false}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Confirm your application' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Community Garden Day')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirm & Apply' }))

    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('blocks confirmation when the opportunity is outside availability', () => {
    render(
      <ConfirmApplicationModal
        opportunity={opportunity}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        volunteerAvailability={[
          {
            dayOfWeek: 'Not a matching day',
            startTime: '00:00',
            endTime: '23:59',
          },
        ]}
        isSubmitting={false}
      />,
    )

    expect(
      screen.getByText(
        'This opportunity is outside your set availability times.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Confirm & Apply' }),
    ).toBeDisabled()
  })

  it('disables both actions while submission is in progress', () => {
    render(
      <ConfirmApplicationModal
        opportunity={opportunity}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        volunteerAvailability={matchingAvailability}
        isSubmitting
      />,
    )

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Applying...' })).toBeDisabled()
  })
})
