import { describe, it } from 'vitest'

describe('follow store', () => {
  it.todo('loads followed Organisations and clears stale data on failure')
  it.todo('loads the follow status for the selected Organisation')
  it.todo('adds a followed Organisation without duplicating list state')
  it.todo('removes an unfollowed Organisation and leaves the final state false')
  it.todo('keeps mutation loading state scoped to the affected Organisation')
  it.todo('loads safe followers and reports access errors without stale data')
})
