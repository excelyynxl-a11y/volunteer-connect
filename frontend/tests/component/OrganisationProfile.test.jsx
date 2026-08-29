import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import EditOrganisationProfile from '../../src/pages/Organisation/EditOrganisationProfile.jsx'
import OrganisationProfile from '../../src/pages/Organisation/OrganisationProfile.jsx'
import PublicOrganisationProfile from '../../src/pages/Organisation/PublicOrganisationProfile.jsx'

const mocks = vi.hoisted(() => ({
  auth: { authUser: null },
  organisation: {
    activeOpportunities: [],
    cancelledOpportunities: [],
    closedOpportunities: [],
    getMyOpportunities: vi.fn(),
    isOpportunitiesLoading: false,
    opportunitiesError: '',
    isUpdatingOrganisationProfile: false,
    updateOrganisationProfile: vi.fn(),
  },
  volunteer: {
    getAllOpportunities: vi.fn(),
    getPublicOrganisationProfile: vi.fn(),
    isOpportunitiesLoading: false,
    isPublicOrganisationProfileLoading: false,
    opportunities: [],
    opportunitiesError: '',
    publicOrganisationProfile: null,
    publicOrganisationProfileError: '',
  },
  application: {
    applications: [],
    createApplication: vi.fn(),
    getMyApplications: vi.fn(),
    isSubmittingApplication: false,
  },
  follow: {
    followError: '',
    followOrganisation: vi.fn(),
    getFollowStatus: vi.fn(),
    isFollowing: false,
    isFollowLoading: false,
    unfollowOrganisation: vi.fn(),
  },
}))

vi.mock('../../src/store/useAuthStore.js', () => ({
  useAuthStore: (selector) => selector ? selector(mocks.auth) : mocks.auth,
}))
vi.mock('../../src/store/useOrganisationStore.js', () => ({
  useOrganisationStore: () => mocks.organisation,
}))
vi.mock('../../src/store/useVolunteerStore.js', () => ({
  useVolunteerStore: () => mocks.volunteer,
}))
vi.mock('../../src/store/useApplicationStore.js', () => ({
  useApplicationStore: () => mocks.application,
}))
vi.mock('../../src/store/useFollowStore.js', () => ({
  useFollowStore: () => mocks.follow,
}))
vi.mock('../../src/components/OpportunityCard.jsx', () => ({
  default: ({ opportunity }) => <article>{opportunity.title}</article>,
}))
vi.mock('../../src/components/OpportunityDetailModal.jsx', () => ({ default: () => null }))
vi.mock('../../src/components/ConfirmApplicationModal.jsx', () => ({ default: () => null }))
vi.mock('../../src/components/BackButton.jsx', () => ({
  default: () => <button type="button">Back</button>,
}))
vi.mock('../../src/lib/utils.js', () => ({
  getInitials: (name) => name
    ? name.split(' ').filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase()
    : 'VC',
}))

const organisation = {
  _id: 'org-1',
  name: 'Green Neighbours',
  biodata: 'We organise local environmental projects.',
  avatar: '',
}

const renderPage = (element, path = '/organisation-dashboard/profile') => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route
        path={path.startsWith('/organisations/') ? '/organisations/:organisationId' : '*'}
        element={element}
      />
    </Routes>
  </MemoryRouter>,
)

beforeEach(() => {
  vi.clearAllMocks()
  mocks.auth.authUser = { ...organisation, role: 'organisation', approvalStatus: 'approved' }
  Object.assign(mocks.organisation, {
    activeOpportunities: [],
    cancelledOpportunities: [],
    closedOpportunities: [],
    isOpportunitiesLoading: false,
    opportunitiesError: '',
    isUpdatingOrganisationProfile: false,
  })
  mocks.organisation.getMyOpportunities.mockResolvedValue({ success: true })
  mocks.organisation.updateOrganisationProfile.mockResolvedValue({ success: true })
  Object.assign(mocks.volunteer, {
    isOpportunitiesLoading: false,
    isPublicOrganisationProfileLoading: false,
    opportunities: [],
    opportunitiesError: '',
    publicOrganisationProfile: { ...organisation },
    publicOrganisationProfileError: '',
  })
  mocks.volunteer.getAllOpportunities.mockResolvedValue({ success: true })
  mocks.volunteer.getPublicOrganisationProfile.mockResolvedValue({ success: true })
  Object.assign(mocks.application, { applications: [], isSubmittingApplication: false })
  Object.assign(mocks.follow, { followError: '', isFollowing: false, isFollowLoading: false })
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn(() => 'blob:avatar-preview'),
  })
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: vi.fn(),
  })
})

describe('Organisation profile UI', () => {
  it('renders the authenticated Organisation profile and active opportunities', () => {
    mocks.organisation.activeOpportunities = [{ _id: 'opp-1', title: 'Beach Cleanup' }]
    mocks.organisation.closedOpportunities = [{ _id: 'opp-2', title: 'Completed Workshop' }]

    renderPage(<OrganisationProfile />)

    expect(screen.getByRole('heading', { name: 'Green Neighbours' })).toBeInTheDocument()
    expect(screen.getByText('We organise local environmental projects.')).toBeInTheDocument()
    expect(screen.getByText('Beach Cleanup')).toBeInTheDocument()
    expect(screen.getByText('Completed Workshop')).toBeInTheDocument()
    expect(mocks.organisation.getMyOpportunities).toHaveBeenCalledOnce()
  })

  it('validates name and biodata before profile save', async () => {
    const user = userEvent.setup()
    renderPage(<EditOrganisationProfile />, '/organisation-dashboard/edit-organisation-profile')
    const name = await screen.findByLabelText(/Organisation Name/i)
    const biodata = screen.getByLabelText(/About Us \/ Biodata/i)

    await user.clear(name)
    await user.clear(biodata)
    await user.click(screen.getByRole('button', { name: 'Save Profile' }))

    expect(screen.getByText('Organisation name is required.')).toBeInTheDocument()
    expect(screen.getByText('About Us / Biodata is required.')).toBeInTheDocument()
    expect(mocks.organisation.updateOrganisationProfile).not.toHaveBeenCalled()
  })

  it('previews a valid avatar and rejects invalid or oversized files', async () => {
    const view = renderPage(
      <EditOrganisationProfile />,
      '/organisation-dashboard/edit-organisation-profile',
    )
    const input = view.container.querySelector('input[type="file"]')

    fireEvent.change(input, {
      target: { files: [new File(['gif'], 'avatar.gif', { type: 'image/gif' })] },
    })
    expect(screen.getByText('Please select a PNG, JPG, or JPEG image.')).toBeInTheDocument()

    fireEvent.change(input, {
      target: {
        files: [new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', {
          type: 'image/png',
        })],
      },
    })
    expect(screen.getByText('Avatar must be 5MB or smaller.')).toBeInTheDocument()

    const valid = new File(['png'], 'avatar.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [valid] } })
    expect(URL.createObjectURL).toHaveBeenCalledWith(valid)
    expect(screen.getByAltText('Organisation avatar preview')).toHaveAttribute(
      'src',
      'blob:avatar-preview',
    )
  })

  it('disables duplicate save actions and shows success or recoverable failure', async () => {
    mocks.organisation.isUpdatingOrganisationProfile = true
    const loadingView = renderPage(
      <EditOrganisationProfile />,
      '/organisation-dashboard/edit-organisation-profile',
    )
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled()
    loadingView.unmount()

    mocks.organisation.isUpdatingOrganisationProfile = false
    mocks.organisation.updateOrganisationProfile.mockResolvedValue({
      success: false,
      error: 'Profile update unavailable',
    })
    renderPage(<EditOrganisationProfile />, '/organisation-dashboard/edit-organisation-profile')
    await screen.findByDisplayValue('Green Neighbours')
    await userEvent.click(screen.getByRole('button', { name: 'Save Profile' }))

    expect(mocks.organisation.updateOrganisationProfile).toHaveBeenCalledOnce()
    expect(await screen.findByText('Profile update unavailable')).toBeInTheDocument()
  })

  it('renders only safe fields on a public Organisation profile', () => {
    mocks.volunteer.publicOrganisationProfile = {
      ...organisation,
      password: 'must-not-render',
      email: 'private@example.com',
    }
    mocks.volunteer.opportunities = [
      { _id: 'opp-1', title: 'Beach Cleanup', organisationId: 'org-1', status: 'active' },
      { _id: 'opp-2', title: 'Other Organisation', organisationId: 'org-2', status: 'active' },
    ]

    renderPage(<PublicOrganisationProfile />, '/organisations/org-1')

    expect(screen.getByRole('heading', { name: 'Green Neighbours' })).toBeInTheDocument()
    expect(screen.getByText('We organise local environmental projects.')).toBeInTheDocument()
    expect(screen.getByText('Beach Cleanup')).toBeInTheDocument()
    expect(screen.queryByText('Other Organisation')).not.toBeInTheDocument()
    expect(screen.queryByText('must-not-render')).not.toBeInTheDocument()
    expect(screen.queryByText('private@example.com')).not.toBeInTheDocument()
  })

  it('renders safe loading, missing, error, and avatar fallback states', async () => {
    mocks.volunteer.isPublicOrganisationProfileLoading = true
    const loading = renderPage(<PublicOrganisationProfile />, '/organisations/org-1')
    expect(screen.getByRole('status')).toHaveTextContent('Loading organisation profile...')
    loading.unmount()

    mocks.volunteer.isPublicOrganisationProfileLoading = false
    mocks.volunteer.publicOrganisationProfile = null
    const missing = renderPage(<PublicOrganisationProfile />, '/organisations/org-1')
    expect(screen.getByRole('alert')).toHaveTextContent('Organisation profile is unavailable.')
    missing.unmount()

    mocks.volunteer.publicOrganisationProfileError = 'Profile unavailable'
    const failed = renderPage(<PublicOrganisationProfile />, '/organisations/org-1')
    expect(screen.getByRole('alert')).toHaveTextContent('Profile unavailable')
    failed.unmount()

    mocks.volunteer.publicOrganisationProfileError = ''
    mocks.volunteer.publicOrganisationProfile = {
      ...organisation,
      avatar: 'https://example.com/broken.jpg',
    }
    renderPage(<PublicOrganisationProfile />, '/organisations/org-1')
    fireEvent.error(screen.getByAltText('Green Neighbours avatar'))
    await waitFor(() => expect(screen.queryByAltText('Green Neighbours avatar')).not.toBeInTheDocument())
    expect(screen.getByText('GN')).toBeInTheDocument()
  })
})
