import { describe, it } from 'vitest'

describe('Messaging UI', () => {
  it.todo('renders conversation and thread loading, error, empty, and retry states')
  it.todo('lets a Volunteer start a conversation with one valid first message')
  it.todo('sends text, attachment, and combined messages once')
  it.todo('rejects invalid or oversized attachments before sending')
  it.todo('shows unread state and marks the selected conversation as read')
  it.todo('updates messages and deadline state after Socket events without duplication')
  it.todo('shows End Chat only to the Organisation and requires confirmation')
  it.todo('removes a conversation after end or expiry and handles reconnect safely')
})
