import { describe, it } from 'vitest'

describe('authentication store', () => {
  it.todo('stores the authenticated user after a successful auth check')
  it.todo('clears stale user data when the auth check fails')
  it.todo('sets and resets signup loading state on success and failure')
  it.todo('keeps a pending or rejected signup out of the authenticated state')
  it.todo('stores an approved user after successful login')
  it.todo('preserves the server approval status in a failed login outcome')
  it.todo('clears the authenticated user after logout even when UI navigation follows')
})
