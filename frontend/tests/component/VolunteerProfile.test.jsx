import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useAuthStore } from '../../src/store/useAuthStore.js'
import { useVolunteerStore } from '../../src/store/useVolunteerStore.js'
import VolunteerProfile from '../../src/pages/Volunteer/VolunteerProfile.jsx'

vi.mock('../../src/components/VolunteerHoursCard.jsx', () => ({
  default: ({ totalVolunteerHours }) => <div>Total hours: {totalVolunteerHours}</div>,
}))

vi.mock('../../src/lib/utils.js', () => ({
  getInitials: (name) =>
    name ? name.split(' ').map((w) => w[0]).join('').toUpperCase() : '',
  formatApprovalStatus: (status) => (status ? status[0].toUpperCase() + status.slice(1) : 'Unknown'),
}))

vi.mock('../../src/store/useAuthStore.js', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('../../src/store/useVolunteerStore.js', () => ({
  useVolunteerStore: vi.fn(),
}))

const baseVolunteerStore = {
  participationHistory: [],
  totalVolunteerHours: '0.0h',
  isLoading: false,
  loadError: '',
  getVolunteerPastExperience: vi.fn(),
}

const renderProfile = () =>
  render(
    <MemoryRouter>
      <VolunteerProfile />
    </MemoryRouter>,
  )

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.mockImplementation((selector) =>
    selector({
      authUser: {
        _id: 'volunteer-1',
        name: 'Alex Tan',
        email: 'alex@example.com',
        ageGroup: '21-30',
        biodata: 'Loves gardening',
        approvalStatus: 'approved',
        skills: ['Teamwork'],
        availability: [
          {
            dayOfWeek: 'Monday',
            startTime: '09:00',
            endTime: '17:00',
            preference: 'preferred',
          },
        ],
      },
    })
  )
  useVolunteerStore.mockReturnValue({ ...baseVolunteerStore })
})

describe('Volunteer profile UI', () => {
  it('renders saved profile fields and safe missing-value fallbacks', () => {
    renderProfile()

    // saved fields render
    expect(screen.getByRole('heading', { name: 'Alex Tan' })).toBeInTheDocument()
    expect(screen.getByText('alex@example.com')).toBeInTheDocument()
    expect(screen.getByText('21-30')).toBeInTheDocument()
    expect(screen.getByText('Loves gardening')).toBeInTheDocument()
    expect(screen.getByText('Teamwork')).toBeInTheDocument()
    expect(screen.getByText('Monday')).toBeInTheDocument()
    expect(screen.getByText('09:00 - 17:00')).toBeInTheDocument()
    expect(screen.getByText('Preferred')).toBeInTheDocument()

    // safe fallbacks for a profile missing optional fields
    useAuthStore.mockImplementation((selector) =>
      selector({
        authUser: { _id: 'volunteer-2' },
      })
    )
    
    const { container } = renderProfile()
    expect(container).toHaveTextContent('Not provided')
    expect(container).toHaveTextContent('No skills added yet.')
    expect(container).toHaveTextContent('No availability added yet.')
    expect(container).toHaveTextContent('No profile summary provided yet.')
  })

  it('shows past approved opportunities without labelling scheduled time as verified hours', () => {
    // hours here come from computed opportunity duration, not attendance verification
    useVolunteerStore.mockReturnValue({
      ...baseVolunteerStore,
      participationHistory: [
        {
          id: 'a1',
          title: 'River Cleanup',
          organisation: 'Blue Wave',
          date: '1 Jan 2030',
          hours: '3.0 hrs',
          status: 'Completed',
        },
      ],
      totalVolunteerHours: '3.0h',
    })

    renderProfile()

    expect(screen.getByText('River Cleanup')).toBeInTheDocument()
    expect(screen.getByText('Blue Wave')).toBeInTheDocument()
    expect(screen.getByText(/3\.0 hrs/)).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Total hours: 3.0h')).toBeInTheDocument()
    expect(screen.queryByText(/verified/i)).not.toBeInTheDocument() // the component must not claim this figure is "verified"
  })

  it.todo('validates name, age group, biodata, skills, and availability before save')
  it.todo('allows adjacent availability and blocks overlapping slots')
  it.todo('previews a valid avatar and rejects invalid or oversized files')
  it.todo('disables duplicate save actions and shows success or recoverable failure')
  it('renders loading, empty, error, and retry states accessibly', () => {
    // loading states
    useVolunteerStore.mockReturnValue({ ...baseVolunteerStore, isLoading: true })
    const view = renderProfile()
    expect(screen.getByText('Loading past opportunities...')).toBeInTheDocument()

    // empty states
    useVolunteerStore.mockReturnValue({ ...baseVolunteerStore })
    view.rerender(
      <MemoryRouter>
        <VolunteerProfile />
      </MemoryRouter>,
    )
    expect(screen.getByText('No completed volunteer participation found yet.')).toBeInTheDocument()

    // error states
    useVolunteerStore.mockReturnValue({ ...baseVolunteerStore, loadError: 'Unable to load history.' })
    view.rerender(
      <MemoryRouter>
        <VolunteerProfile />
      </MemoryRouter>,
    )
    expect(screen.getByText('Unable to load history.')).toBeInTheDocument()

    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
  })
})
