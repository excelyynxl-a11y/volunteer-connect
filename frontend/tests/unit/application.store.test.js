import { describe, it } from 'vitest'

describe('application store', () => {
  it.todo('loads Volunteer applications with an optional status filter')
  it.todo('loads Organisation applications with status and opportunity filters')
  it.todo('loads and clears the selected application safely')
  it.todo('adds a newly created application without duplicating existing state')
  it.todo('replaces the matching application after approve, reject, or withdraw')
  it.todo('sends rejection and withdrawal reasons in the confirmed API shape')
  it.todo('sets and clears loading and error state for every failed action')
})
