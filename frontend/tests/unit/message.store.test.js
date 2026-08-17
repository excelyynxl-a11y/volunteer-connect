import { describe, it } from 'vitest'

describe('message store', () => {
  it.todo('loads conversations and preserves the selected valid conversation')
  it.todo('loads messages, selects the conversation, and marks it read')
  it.todo('sends text, attachment, and combined messages as the correct request type')
  it.todo('starts a conversation only with a valid first message')
  it.todo('removes an ended conversation and clears selected message state')
  it.todo('uses an authenticated download URL for an attachment')
  it.todo('applies created, deadline, and deleted Socket events without duplication')
  it.todo('connects and disconnects Socket listeners exactly once')
  it.todo('keeps each loading and error state recoverable after failure')
})
