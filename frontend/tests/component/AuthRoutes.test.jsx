import { describe, it } from 'vitest'

describe('authentication route guards', () => {
  it.todo('shows loading while the current session is being checked')
  it.todo('redirects a guest away from a protected route')
  it.todo('redirects an authenticated user away from a guest-only route')
  it.todo('allows an authenticated user through a protected route')
  it.todo('allows only a role listed by the role route')
  it.todo('sends an authenticated wrong-role user to the correct safe page')
})
