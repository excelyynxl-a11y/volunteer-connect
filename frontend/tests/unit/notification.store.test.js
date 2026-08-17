import { describe, it } from 'vitest'

describe('notification store (future)', () => {
  it.todo('loads notifications and unread count for the authenticated user')
  it.todo('marks one owned notification as read')
  it.todo('marks all owned notifications as read')
  it.todo('applies a realtime notification event without duplication')
  it.todo('clears stale private notification data after logout or request failure')
})
