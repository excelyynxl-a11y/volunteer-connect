import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import OrganisationFollowers from '../../src/pages/Organisation/OrganisationFollowers.jsx'
import PublicOrganisationProfile from '../../src/pages/Organisation/PublicOrganisationProfile.jsx'
import FollowedOrganisations from '../../src/pages/Volunteer/FollowedOrganisations.jsx'
import { useApplicationStore } from '../../src/store/useApplicationStore.js'
import { useAuthStore } from '../../src/store/useAuthStore.js'
import { useFollowStore } from '../../src/store/useFollowStore.js'
import { useVolunteerStore } from '../../src/store/useVolunteerStore.js'

const organisations = [
  { _id: 'org-1', name: 'Green Neighbours', biodata: 'Community gardens' },
  { _id: 'org-2', name: 'Animal Friends', biodata: 'Animal welfare' },
]

const renderWithRouter = (element, initialEntry = '/') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/volunteer-dashboard/organisations/:organisationId" element={element} />
        <Route path="/organisations/:organisationId" element={element} />
        <Route path="*" element={element} />
      </Routes>
    </MemoryRouter>,
  )

const setPublicProfileDependencies = () => {
  useAuthStore.setState({ authUser: { _id: 'volunteer-1', role: 'volunteer', availability: [] } })
  useVolunteerStore.setState({
    publicOrganisationProfile: organisations[0],
    isPublicOrganisationProfileLoading: false,
    publicOrganisationProfileError: '',
    opportunities: [],
    isOpportunitiesLoading: false,
    opportunitiesError: '',
    getPublicOrganisationProfile: vi.fn(),
    getAllOpportunities: vi.fn(),
  })
  useApplicationStore.setState({ applications: [], getMyApplications: vi.fn() })
}

const resetStores = () => {
  useFollowStore.setState({
    followedOrganisations: [],
    followers: [],
    isFollowing: false,
    isFollowLoading: false,
    isFollowedOrganisationsLoading: false,
    followMutationOrganisationId: null,
    followError: '',
    followersError: '',
  })
  useAuthStore.setState({ authUser: null })
  useVolunteerStore.setState({ publicOrganisationProfile: null, opportunities: [] })
  useApplicationStore.setState({ applications: [] })
}

afterEach(() => {
  vi.restoreAllMocks()
  resetStores()
})

describe('Follow feature UI', () => {
  it('loads followed Organisations with loading, error, empty, and retry states', async () => {
    const getMyFollowedOrganisations = vi.fn()
    useFollowStore.setState({ getMyFollowedOrganisations, isFollowedOrganisationsLoading: true })
    const view = renderWithRouter(<FollowedOrganisations />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    useFollowStore.setState({ isFollowedOrganisationsLoading: false, followError: 'Unable to load follows.' })
    view.rerender(<MemoryRouter><FollowedOrganisations /></MemoryRouter>)
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load follows.')

    useFollowStore.setState({ followError: '' })
    view.rerender(<MemoryRouter><FollowedOrganisations /></MemoryRouter>)
    expect(screen.getByText('No followed organisations.')).toBeInTheDocument()

    const getOrganisationFollowers = vi.fn()
    useAuthStore.setState({ authUser: { _id: 'org-1', role: 'organisation' } })
    useFollowStore.setState({ followersError: 'Access temporarily unavailable.', getOrganisationFollowers })
    view.rerender(<OrganisationFollowers />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }))
    expect(getOrganisationFollowers).toHaveBeenCalledWith('org-1')
  })

  it('searches followed Organisations by visible name', async () => {
    const user = userEvent.setup()
    useFollowStore.setState({
      followedOrganisations: organisations,
      getMyFollowedOrganisations: vi.fn(),
    })
    renderWithRouter(<FollowedOrganisations />)

    await user.type(screen.getByPlaceholderText('Search followed organisations'), 'animal')
    expect(screen.getByText('Animal Friends')).toBeInTheDocument()
    expect(screen.queryByText('Green Neighbours')).not.toBeInTheDocument()
  })

  it('follows and unfollows from a public Organisation profile', async () => {
    const user = userEvent.setup()
    const followOrganisation = vi.fn()
    const unfollowOrganisation = vi.fn()
    setPublicProfileDependencies()
    useFollowStore.setState({
      getFollowStatus: vi.fn(),
      followOrganisation,
      unfollowOrganisation,
      isFollowing: false,
    })
    const view = renderWithRouter(
      <PublicOrganisationProfile />,
      '/volunteer-dashboard/organisations/org-1',
    )

    await user.click(screen.getByRole('button', { name: 'Follow' }))
    expect(followOrganisation).toHaveBeenCalledWith('org-1')
    useFollowStore.setState({ isFollowing: true })
    view.rerender(
      <MemoryRouter initialEntries={['/volunteer-dashboard/organisations/org-1']}>
        <Routes><Route path="/volunteer-dashboard/organisations/:organisationId" element={<PublicOrganisationProfile />} /></Routes>
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('button', { name: 'Following' }))
    expect(unfollowOrganisation).toHaveBeenCalledWith('org-1')
  })

  it('prevents duplicate mutation clicks and keeps the prior state on failure', async () => {
    const user = userEvent.setup()
    setPublicProfileDependencies()
    const followOrganisation = vi.fn().mockResolvedValue({ success: false, error: 'Follow failed.' })
    useFollowStore.setState({
      getFollowStatus: vi.fn(),
      followOrganisation,
      isFollowing: false,
      isFollowLoading: true,
      followError: 'Follow failed.',
    })
    renderWithRouter(<PublicOrganisationProfile />, '/organisations/org-1')

    const button = screen.getByRole('button', { name: 'Updating...' })
    expect(button).toBeDisabled()
    await user.click(button)
    expect(followOrganisation).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Follow failed.')
  })

  it('removes an unfollowed Organisation from the visible followed list', async () => {
    const user = userEvent.setup()
    const unfollowOrganisation = vi.fn((organisationId) => {
      useFollowStore.setState({
        followedOrganisations: organisations.filter((item) => item._id !== organisationId),
      })
    })
    useFollowStore.setState({
      followedOrganisations: organisations,
      getMyFollowedOrganisations: vi.fn(),
      unfollowOrganisation,
    })
    renderWithRouter(<FollowedOrganisations />)

    await user.click(screen.getAllByRole('button', { name: 'Unfollow' })[0])
    expect(unfollowOrganisation).toHaveBeenCalledWith('org-1')
    expect(screen.queryByText('Green Neighbours')).not.toBeInTheDocument()
    expect(screen.getByText('Animal Friends')).toBeInTheDocument()
  })

  it('shows only safe follower profile fields to an authorised Organisation', () => {
    useAuthStore.setState({ authUser: { _id: 'org-1', role: 'organisation' } })
    useFollowStore.setState({
      followers: [{ _id: 'volunteer-1', name: 'Alex Volunteer', email: 'private@example.com' }],
      getOrganisationFollowers: vi.fn(),
    })
    render(<OrganisationFollowers />)

    expect(screen.getByText('Alex Volunteer')).toBeInTheDocument()
    expect(screen.queryByText('private@example.com')).not.toBeInTheDocument()
  })

  it('shows a safe access error to an unauthorised follower viewer', () => {
    useAuthStore.setState({ authUser: { _id: 'org-1', role: 'organisation' } })
    useFollowStore.setState({
      followersError: 'You are not authorised to view these followers.',
      getOrganisationFollowers: vi.fn(),
    })
    render(<OrganisationFollowers />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'You are not authorised to view these followers.',
    )
    expect(screen.queryByText('private@example.com')).not.toBeInTheDocument()
  })
})
