import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import Login from '../../src/pages/Auth/Login.jsx'
import SignUp from '../../src/pages/Auth/SignUp.jsx'
import { useAuthStore } from '../../src/store/useAuthStore.js'

const resetAuthStore = () => {
  useAuthStore.setState({
    authUser: null,
    isLoggingIn: false,
    isSigningUp: false,
  })
}

const renderAuthRoute = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/volunteer-dashboard" element={<h1>Volunteer dashboard</h1>} />
        <Route
          path="/organisation-dashboard"
          element={<h1>Organisation dashboard</h1>}
        />
        <Route path="/pending-approval" element={<h1>Pending approval</h1>} />
        <Route path="/" element={<h1>Home</h1>} />
      </Routes>
    </MemoryRouter>,
  )

const fillBaseSignup = async (user) => {
  await user.type(screen.getByPlaceholderText('Enter your full name'), 'Alex Tan')
  await user.type(screen.getByPlaceholderText('Enter your email'), 'alex@example.com')
  await user.type(screen.getByPlaceholderText('Enter your password'), 'StrongPass1')
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  resetAuthStore()
})

describe('login and signup forms', () => {
  it('validates login email and password before submission', async () => {
    const user = userEvent.setup()
    const login = vi.fn()
    useAuthStore.setState({ login })
    renderAuthRoute('/login')

    await user.type(screen.getByPlaceholderText('Enter your email'), 'invalid')
    fireEvent.submit(screen.getByRole('button', { name: 'Log In' }).closest('form'))

    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('shows login loading and a safe server error', async () => {
    const user = userEvent.setup()
    const login = vi.fn().mockResolvedValue({
      success: false,
      error: 'Unable to sign in. Please try again.',
    })
    useAuthStore.setState({ login, isLoggingIn: true })
    const view = renderAuthRoute('/login')

    expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled()

    useAuthStore.setState({ isLoggingIn: false })
    await act(async () => view.rerender(
      <MemoryRouter initialEntries={['/login']}>
        <Routes><Route path="/login" element={<Login />} /></Routes>
      </MemoryRouter>,
    ))
    await user.type(screen.getByPlaceholderText('Enter your email'), 'alex@example.com')
    await user.type(screen.getByPlaceholderText('Enter your password'), 'StrongPass1')
    await user.click(screen.getByRole('button', { name: 'Log In' }))

    expect(await screen.findByText('Unable to sign in. Please try again.')).toBeInTheDocument()
  })

  it('navigates an approved user to the correct role dashboard', async () => {
    vi.useFakeTimers()
    useAuthStore.setState({
      login: vi.fn().mockResolvedValue({
        success: true,
        role: 'organisation',
        approvalStatus: 'approved',
      }),
    })
    renderAuthRoute('/login')

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'org@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'StrongPass1' },
    })
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Log In' })))
    expect(screen.getByText('Welcome Aboard!')).toBeInTheDocument()

    await act(async () => vi.advanceTimersByTime(2500))
    expect(screen.getByRole('heading', { name: 'Organisation dashboard' })).toBeInTheDocument()
  })

  it.each(['pending', 'rejected'])(
    'shows a %s account outcome without protected access',
    async (approvalStatus) => {
      vi.useFakeTimers()
      useAuthStore.setState({
        login: vi.fn().mockResolvedValue({
          success: false,
          role: 'volunteer',
          approvalStatus,
        }),
      })
      renderAuthRoute('/login')

      fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
        target: { value: 'alex@example.com' },
      })
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
        target: { value: 'StrongPass1' },
      })
      await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Log In' })))
      expect(screen.getByText('Welcome Aboard!')).toBeInTheDocument()

      await act(async () => vi.advanceTimersByTime(2500))
      expect(screen.getByRole('heading', { name: 'Pending approval' })).toBeInTheDocument()
      expect(screen.queryByText('Volunteer dashboard')).not.toBeInTheDocument()
    },
  )

  it('shows only the fields required by the selected signup role', async () => {
    const user = userEvent.setup()
    renderAuthRoute('/sign-up')

    expect(screen.queryByText('Age Group')).not.toBeInTheDocument()
    expect(screen.queryByText('Organisation Bio')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Volunteer' }))
    expect(screen.getByText('Age Group')).toBeInTheDocument()
    expect(screen.getByText('Resume (PDF)')).toBeInTheDocument()
    expect(screen.queryByText('Organisation Bio')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Organisation' }))
    expect(screen.getByText('Organisation Bio')).toBeInTheDocument()
    expect(screen.queryByText('Age Group')).not.toBeInTheDocument()
  })

  it('requires the Volunteer age group and resume', async () => {
    const user = userEvent.setup()
    const signUp = vi.fn()
    useAuthStore.setState({ signUp })
    renderAuthRoute('/sign-up')

    await user.click(screen.getByRole('button', { name: 'Volunteer' }))
    await fillBaseSignup(user)
    await user.click(screen.getByRole('button', { name: 'Create Account' }))

    expect(screen.getAllByText('Select your age group')).toHaveLength(2)
    expect(screen.getAllByText('Upload your resume')).toHaveLength(2)
    expect(signUp).not.toHaveBeenCalled()
  })

  it('requires Organisation biodata', async () => {
    const user = userEvent.setup()
    const signUp = vi.fn()
    useAuthStore.setState({ signUp })
    renderAuthRoute('/sign-up')

    await user.click(screen.getByRole('button', { name: 'Organisation' }))
    await fillBaseSignup(user)
    await user.click(screen.getByRole('button', { name: 'Create Account' }))

    expect(screen.getByText('Enter your organisation bio')).toBeInTheDocument()
    expect(signUp).not.toHaveBeenCalled()
  })

  it('submits valid multipart signup data once and prevents duplicate clicks', async () => {
    const user = userEvent.setup()
    let finishSignup
    const signUp = vi.fn().mockImplementation(() => {
      useAuthStore.setState({ isSigningUp: true })
      return new Promise((resolve) => {
        finishSignup = resolve
      })
    })
    useAuthStore.setState({ signUp })
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const view = renderAuthRoute('/sign-up')

    await user.click(screen.getByRole('button', { name: 'Volunteer' }))
    await fillBaseSignup(user)
    await user.selectOptions(screen.getByRole('combobox'), '21-30')
    const resume = new File(['resume'], 'resume.pdf', { type: 'application/pdf' })
    await user.upload(view.container.querySelector('input[type="file"]'), resume)
    await user.click(screen.getByRole('button', { name: 'Create Account' }))

    expect(signUp).toHaveBeenCalledOnce()
    const payload = signUp.mock.calls[0][0]
    expect(payload).toBeInstanceOf(FormData)
    expect(payload.get('name')).toBe('Alex Tan')
    expect(payload.get('role')).toBe('volunteer')
    expect(payload.get('ageGroup')).toBe('21-30')
    expect(payload.get('resume')).toBe(resume)
    expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Loading...' }))
    expect(signUp).toHaveBeenCalledOnce()

    await act(async () => {
      useAuthStore.setState({ isSigningUp: false })
      finishSignup({ success: false, error: 'Test complete' })
    })
  })
})
