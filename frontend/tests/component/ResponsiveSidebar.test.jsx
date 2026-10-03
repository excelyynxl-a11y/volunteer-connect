import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import VolunteerSidebar from '../../src/components/VolunteerSidebar'
import OrganisationSidebar from '../../src/components/OrganisationSidebar'
import AdminSidebar from '../../src/components/AdminSidebar'
import { useVolunteerStore } from '../../src/store/useVolunteerStore'
import { useOrganisationStore } from '../../src/store/useOrganisationStore'
import { useAdminStore } from '../../src/store/useAdminStore'

const roles = [
  ['Volunteer', VolunteerSidebar, useVolunteerStore, 'Opportunities', 'opportunities'],
  ['Organisation', OrganisationSidebar, useOrganisationStore, 'Opportunity', 'opportunities'],
  ['Admin', AdminSidebar, useAdminStore, 'Analytics', 'analytics'],
]
let mobile
let listeners

const RouteControls = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  return <>
    <output aria-label="Current route">{pathname}</output>
    <button onClick={() => navigate('profile')}>External navigation</button>
    <button onClick={() => navigate(-1)}>Back</button>
  </>
}

const setMobile = (next) => act(() => {
  mobile = next
  listeners.forEach(listener => listener())
})

const renderSidebar = (Component, label) => {
  const role = label.toLowerCase()
  return render(<MemoryRouter initialEntries={[`/${role}-dashboard`]}>
    <div className={`${role}-dashboard`}>
      <Component />
      <main><RouteControls /></main>
    </div>
  </MemoryRouter>)
}

beforeEach(() => {
  mobile = true
  listeners = new Set()
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    get matches() { return mobile },
    addEventListener: (_event, callback) => listeners.add(callback),
    removeEventListener: (_event, callback) => listeners.delete(callback),
  })))
  roles.forEach(([, , store]) => store.setState({ sidebarCollapsed: false, currentTab: 'homepage' }))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe.each(roles)('%s responsive sidebar', (label, Component, store, item, path) => {
  it('opens full mobile navigation even after collapsing the desktop sidebar', async () => {
    const user = userEvent.setup()
    store.setState({ sidebarCollapsed: true })
    const view = renderSidebar(Component, label)
    const aside = view.container.querySelector('aside')
    expect(aside).toHaveAttribute('aria-hidden', 'true')
    expect(aside).toHaveAttribute('inert')
    const trigger = screen.getByRole('button', { name: 'Open navigation menu' })
    await user.click(trigger)
    const dialog = screen.getByRole('dialog', { name: `${label} navigation` })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(dialog).toHaveClass('mobile-open')
    expect(dialog).not.toHaveClass('collapsed')
    expect(within(dialog).getByRole('button', { name: item })).toHaveTextContent(item)
    expect(screen.getByRole('main').inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    await user.click(within(dialog).getByRole('button', { name: 'Close navigation menu' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('main').inert).not.toBe(true)
    expect(document.body.style.overflow).toBe('')
    expect(trigger).toHaveFocus()
    expect(store.getState().sidebarCollapsed).toBe(true)
  })

  it('traps keyboard focus and restores it when Escape closes the menu', async () => {
    const user = userEvent.setup()
    renderSidebar(Component, label)
    const trigger = screen.getByRole('button', { name: 'Open navigation menu' })
    await user.click(trigger)
    const close = screen.getByRole('button', { name: 'Close navigation menu' })
    expect(close).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'Logout' })).toHaveFocus()
    await user.tab()
    expect(close).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes from the backdrop and after navigating to a menu item', async () => {
    const user = userEvent.setup()
    renderSidebar(Component, label)
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    await user.click(screen.getByRole('button', { name: 'Close navigation overlay' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    await user.click(screen.getByRole('button', { name: item }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Current route')).toHaveTextContent(`/${label.toLowerCase()}-dashboard/${path}`)
  })

  it('closes on an external route change and stays closed when returning', async () => {
    const user = userEvent.setup()
    renderSidebar(Component, label)
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    fireEvent.click(screen.getByRole('button', { name: 'External navigation' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('preserves desktop collapse and resets an open drawer when resizing', async () => {
    const user = userEvent.setup()
    const view = renderSidebar(Component, label)
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    setMobile(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect(store.getState().sidebarCollapsed).toBe(true)
    expect(view.container.querySelector('aside')).toHaveClass('collapsed')
    await user.click(screen.getByRole('button', { name: 'Expand sidebar' }))
    expect(store.getState().sidebarCollapsed).toBe(false)
    setMobile(true)
    expect(view.container.querySelector('aside')).toHaveAttribute('aria-hidden', 'true')
  })
})
