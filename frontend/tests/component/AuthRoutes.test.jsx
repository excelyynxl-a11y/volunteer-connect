import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import {
  GuestRoute,
  ProtectedRoute,
  RoleRoute,
} from '../../src/components/AuthRoutes.jsx'
import { useAuthStore } from '../../src/store/useAuthStore.js'

const approvedUser = (role = 'volunteer') => ({
  _id: `${role}-1`,
  role,
  approvalStatus: 'approved',
})

const setAuthState = ({ authUser = null, isCheckingAuth = false } = {}) => {
  useAuthStore.setState({ authUser, isCheckingAuth })
}

const renderProtectedRoute = ({
  authUser = null,
  isCheckingAuth = false,
  allowedRoles,
} = {}) => {
  setAuthState({ authUser, isCheckingAuth })

  const protectedElement = allowedRoles ? (
    <Route element={<RoleRoute allowedRoles={allowedRoles} />}>
      <Route path="/protected" element={<h1>Protected content</h1>} />
    </Route>
  ) : (
    <Route path="/protected" element={<h1>Protected content</h1>} />
  )

  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route element={<ProtectedRoute />}>{protectedElement}</Route>
        <Route path="/login" element={<h1>Login page</h1>} />
        <Route path="/volunteer-dashboard" element={<h1>Volunteer dashboard</h1>} />
        <Route
          path="/organisation-dashboard"
          element={<h1>Organisation dashboard</h1>}
        />
        <Route path="/admin-dashboard" element={<h1>Admin dashboard</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

const renderGuestRoute = ({ authUser = null, isCheckingAuth = false } = {}) => {
  setAuthState({ authUser, isCheckingAuth })

  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<h1>Login page</h1>} />
        </Route>
        <Route path="/volunteer-dashboard" element={<h1>Volunteer dashboard</h1>} />
        <Route
          path="/organisation-dashboard"
          element={<h1>Organisation dashboard</h1>}
        />
        <Route path="/admin-dashboard" element={<h1>Admin dashboard</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

afterEach(() => {
  setAuthState()
})

describe('authentication route guards', () => {
  it('shows loading while the current session is being checked', () => {
    renderProtectedRoute({ isCheckingAuth: true })

    expect(screen.getByText('Checking your session...')).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('redirects a guest away from a protected route', () => {
    renderProtectedRoute()

    expect(screen.getByRole('heading', { name: 'Login page' })).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('redirects an authenticated user away from a guest-only route', () => {
    renderGuestRoute({ authUser: approvedUser('volunteer') })

    expect(
      screen.getByRole('heading', { name: 'Volunteer dashboard' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
  })

  it('allows an authenticated user through a protected route', () => {
    renderProtectedRoute({ authUser: approvedUser() })

    expect(
      screen.getByRole('heading', { name: 'Protected content' }),
    ).toBeInTheDocument()
  })

  it('allows only a role listed by the role route', () => {
    renderProtectedRoute({
      authUser: approvedUser('organisation'),
      allowedRoles: ['organisation', 'admin'],
    })

    expect(
      screen.getByRole('heading', { name: 'Protected content' }),
    ).toBeInTheDocument()
  })

  it('sends an authenticated wrong-role user to the correct safe page', () => {
    renderProtectedRoute({
      authUser: approvedUser('admin'),
      allowedRoles: ['volunteer'],
    })

    expect(
      screen.getByRole('heading', { name: 'Admin dashboard' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })
})
