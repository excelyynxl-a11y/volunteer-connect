import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axiosInstance } from '../../src/lib/axios.js'
import { useMessageStore } from '../../src/store/useMessageStore.js'

vi.mock('../../src/lib/axios.js', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    defaults: { baseURL: 'http://localhost:5000/api' },
  },
}))

vi.mock('../../src/lib/messageSocket.js', () => ({
  messageSocket: {
    on: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    connected: false,
  },
}))

const initialState = useMessageStore.getState()

beforeEach(() => {
  useMessageStore.setState(initialState, true)
  vi.clearAllMocks()
})

describe('message store', () => {
  it('loads conversations and preserves the selected valid conversation', async () => {
    useMessageStore.setState({
      selectedConversationId: 'c1',
      messages: [{ _id: 'm1' }],
      draftMessage: 'hi',
    })
    axiosInstance.get.mockResolvedValueOnce({ data: { data: [{ _id: 'c1' }, { _id: 'c2' }] } })

    await useMessageStore.getState().getMyConversations()

    const state = useMessageStore.getState()
    expect(state.conversations).toHaveLength(2)
    expect(state.selectedConversationId).toBe('c1')
    expect(state.messages).toEqual([{ _id: 'm1' }])
  })

  it('clears the selection when the previously selected conversation no longer exists', async () => {
    useMessageStore.setState({
      selectedConversationId: 'gone',
      messages: [{ _id: 'm1' }],
      draftMessage: 'hi',
    })
    axiosInstance.get.mockResolvedValueOnce({ data: { data: [{ _id: 'c1' }] } })

    await useMessageStore.getState().getMyConversations()

    const state = useMessageStore.getState()
    expect(state.selectedConversationId).toBeNull()
    expect(state.messages).toEqual([])
    expect(state.draftMessage).toBe('')
  })

  it('loads messages, selects the conversation, and marks it read', async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: {
        data: {
          messages: [{ _id: 'm1' }],
          conversation: { responseDeadline: '2030-01-01T00:00:00.000Z' },
        },
      },
    })
    axiosInstance.patch.mockResolvedValueOnce({})

    await useMessageStore.getState().getConversationMessages('c1')

    expect(axiosInstance.get).toHaveBeenCalledWith('/message/conversations/c1/messages')
    expect(axiosInstance.patch).toHaveBeenCalledWith('/message/conversations/c1/read')
    const state = useMessageStore.getState()
    expect(state.selectedConversationId).toBe('c1')
    expect(state.messages).toEqual([{ _id: 'm1' }])
    expect(state.isLoadingMessages).toBe(false)
  })

  it('discards a stale message response when the selection changes mid-request', async () => {
    // first request hangs, second resolves immediately
    let resolveFirst
    axiosInstance.get.mockImplementationOnce(
      () => new Promise((resolve) => { resolveFirst = resolve }),
    )
    axiosInstance.get.mockResolvedValueOnce({
      data: { data: { messages: [{ _id: 'm2' }], conversation: {} } },
    })
    axiosInstance.patch.mockResolvedValue({})

    const firstCall = useMessageStore.getState().getConversationMessages('c1')
    await useMessageStore.getState().getConversationMessages('c2')
    resolveFirst({ data: { data: { messages: [{ _id: 'm1-stale' }], conversation: {} } } })
    const firstResult = await firstCall

    expect(firstResult).toEqual({ success: false, stale: true })
    expect(useMessageStore.getState().selectedConversationId).toBe('c2')
    expect(useMessageStore.getState().messages).toEqual([{ _id: 'm2' }])
  })

  it('sends text, attachment, and combined messages as the correct request type', async () => {
    axiosInstance.get.mockResolvedValue({ data: { data: [] } })
    const file = new File(['bytes'], 'photo.png', { type: 'image/png' })

    // text only
    axiosInstance.post.mockResolvedValueOnce({ data: { data: { message: { _id: 'm1' }, responseDeadline: null } } })
    await useMessageStore.getState().sendMessage('c1', { content: 'hello' })
    let payload = axiosInstance.post.mock.calls[0][1]
    expect(payload).toBeInstanceOf(FormData)
    expect(payload.get('content')).toBe('hello')
    expect(payload.get('attachment')).toBeNull()

    // attachment only
    axiosInstance.post.mockResolvedValueOnce({ data: { data: { message: { _id: 'm2' }, responseDeadline: null } } })
    await useMessageStore.getState().sendMessage('c1', { attachment: file })
    payload = axiosInstance.post.mock.calls[1][1]
    expect(payload.get('content')).toBe('')
    expect(payload.get('attachment')).toBe(file)

    // text and attachment
    axiosInstance.post.mockResolvedValueOnce({ data: { data: { message: { _id: 'm3' }, responseDeadline: null } } })
    await useMessageStore.getState().sendMessage('c1', { content: 'see attached', attachment: file })
    payload = axiosInstance.post.mock.calls[2][1]
    expect(payload.get('content')).toBe('see attached')
    expect(payload.get('attachment')).toBe(file)

    // rejects an empty message before calling the API
    const rejected = await useMessageStore.getState().sendMessage('c1', {})
    expect(rejected).toEqual({ success: false, error: 'Message text or an attachment is required.' })
    expect(axiosInstance.post).toHaveBeenCalledTimes(3)
  })

  it('starts a conversation only with a valid first message', async () => {
    // empty message rejected without calling the API
    const rejected = await useMessageStore.getState().initiateConversation('org-1', {})
    expect(rejected.success).toBe(false)
    expect(axiosInstance.post).not.toHaveBeenCalled()

    // valid message starts the conversation
    axiosInstance.post.mockResolvedValueOnce({ data: { data: { conversation: { _id: 'c-new' } } } })
    axiosInstance.get.mockResolvedValue({ data: { data: [{ _id: 'c-new' }] } })
    const accepted = await useMessageStore.getState().initiateConversation('org-1', { content: 'hi there' })
    expect(accepted.success).toBe(true)
    const [url, payload] = axiosInstance.post.mock.calls[0]
    expect(url).toBe('/message/conversations')
    expect(payload.get('organisationId')).toBe('org-1')
    expect(payload.get('content')).toBe('hi there')
  })

  it('re-opens the existing conversation instead of duplicating one on a 409 conflict', async () => {
    axiosInstance.post.mockRejectedValueOnce({
      response: { status: 409, data: { data: { conversationId: 'existing-c1' } } },
    })
    axiosInstance.get.mockResolvedValue({ data: { data: { messages: [], conversation: {} } } })

    const result = await useMessageStore.getState().initiateConversation('org-1', { content: 'hi' })

    expect(result).toEqual({ success: true, existingConversationId: 'existing-c1' })
    expect(useMessageStore.getState().selectedConversationId).toBe('existing-c1')
  })

  it('removes an ended conversation and clears selected message state', async () => {
    useMessageStore.setState({
      conversations: [{ _id: 'c1' }, { _id: 'c2' }],
      selectedConversationId: 'c1',
      messages: [{ _id: 'm1' }],
      draftMessage: 'draft',
    })
    axiosInstance.delete.mockResolvedValueOnce({})

    await useMessageStore.getState().endConversation('c1')

    const state = useMessageStore.getState()
    expect(state.conversations.map((c) => c._id)).toEqual(['c2'])
    expect(state.selectedConversationId).toBeNull()
    expect(state.messages).toEqual([])
    expect(state.draftMessage).toBe('')
  })

  it('leaves the current selection untouched when ending a different conversation', async () => {
    useMessageStore.setState({
      conversations: [{ _id: 'c1' }, { _id: 'c2' }],
      selectedConversationId: 'c1',
      messages: [{ _id: 'm1' }],
    })
    axiosInstance.delete.mockResolvedValueOnce({})

    await useMessageStore.getState().endConversation('c2')

    const state = useMessageStore.getState()
    expect(state.selectedConversationId).toBe('c1')
    expect(state.messages).toEqual([{ _id: 'm1' }])
  })

  it('uses an authenticated download URL for an attachment', () => {
    const clickSpy = vi.fn()
    const removeSpy = vi.fn()
    vi.spyOn(document, 'createElement').mockReturnValue({ click: clickSpy, remove: removeSpy, href: '', rel: '' })
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})

    useMessageStore.getState().downloadAttachment('c1', 'm1')

    const createdLink = document.createElement.mock.results[0].value
    expect(createdLink.href).toBe('http://localhost:5000/api/message/conversations/c1/messages/m1/attachment')
    expect(clickSpy).toHaveBeenCalledOnce()
    appendSpy.mockRestore()
  })

  it('keeps each loading and error state recoverable after failure', async () => {
    // getMyConversations
    axiosInstance.get.mockRejectedValueOnce({ response: { data: { message: 'Conversations failed' } } })
    const convResult = await useMessageStore.getState().getMyConversations()
    expect(convResult.success).toBe(false)
    expect(useMessageStore.getState().isLoadingConversations).toBe(false)

    // getConversationMessages
    axiosInstance.get.mockRejectedValueOnce({ response: { status: 500, data: { message: 'Messages failed' } } })
    const msgResult = await useMessageStore.getState().getConversationMessages('c1')
    expect(msgResult.success).toBe(false)
    expect(useMessageStore.getState().isLoadingMessages).toBe(false)

    // sendMessage
    axiosInstance.post.mockRejectedValueOnce({ response: { data: { message: 'Send failed' } } })
    const sendResult = await useMessageStore.getState().sendMessage('c1', { content: 'hi' })
    expect(sendResult.success).toBe(false)
    expect(useMessageStore.getState().isSendingMessage).toBe(false)

    // endConversation
    axiosInstance.delete.mockRejectedValueOnce({ response: { data: { message: 'End failed' } } })
    const endResult = await useMessageStore.getState().endConversation('c1')
    expect(endResult.success).toBe(false)
    expect(useMessageStore.getState().isEndingConversation).toBe(false)
  })

  it('applies created, deadline, and deleted Socket events without duplication', async () => {
    afterEach(() => {
      vi.doUnmock('../../src/lib/messageSocket.js')
      vi.doUnmock('../../src/lib/axios.js')
      vi.resetModules()
    })

    vi.resetModules()
    const handlers = {}
    vi.doMock('../../src/lib/messageSocket.js', () => ({
      messageSocket: {
        on: vi.fn((event, handler) => { handlers[event] = handler }),
        connect: vi.fn(),
        disconnect: vi.fn(),
        connected: false,
      },
    }))
    vi.doMock('../../src/lib/axios.js', () => ({
      axiosInstance: {
        get: vi.fn().mockResolvedValue({ data: { data: [] } }),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        defaults: { baseURL: '' },
      },
    }))

    const { useMessageStore: freshStore } = await import('../../src/store/useMessageStore.js')
    freshStore.getState().connectRealtime()
    freshStore.setState({ selectedConversationId: 'c1', conversations: [{ _id: 'c1' }], messages: [] })

    // same message event delivered twice
    const message = { _id: 'm1', createdAt: '2030-01-01T00:00:00.000Z' }
    handlers['message:created']({ conversationId: 'c1', message, responseDeadline: '2030-01-02T00:00:00.000Z' })
    handlers['message:created']({ conversationId: 'c1', message, responseDeadline: '2030-01-02T00:00:00.000Z' })

    // no duplicate message added
    expect(freshStore.getState().messages).toHaveLength(1)
    expect(freshStore.getState().conversations[0].responseDeadline).toBe('2030-01-02T00:00:00.000Z')

    // deadline change applies
    handlers['conversation:deadline-changed']({ conversationId: 'c1', responseDeadline: '2030-02-01T00:00:00.000Z' })
    expect(freshStore.getState().conversations[0].responseDeadline).toBe('2030-02-01T00:00:00.000Z')

    // deletion clears the selected conversation
    handlers['conversation:deleted']({ conversationId: 'c1' })
    expect(freshStore.getState().conversations).toEqual([])
    expect(freshStore.getState().selectedConversationId).toBeNull()
    expect(freshStore.getState().messages).toEqual([])
  })
  
  it('connects and disconnects Socket listeners exactly once', async () => {
    afterEach(() => {
      vi.doUnmock('../../src/lib/messageSocket.js')
      vi.doUnmock('../../src/lib/axios.js')
      vi.resetModules()
    })

    vi.resetModules()
    const onSpy = vi.fn()
    const connectSpy = vi.fn()
    const disconnectSpy = vi.fn()
    vi.doMock('../../src/lib/messageSocket.js', () => ({
      messageSocket: { on: onSpy, connect: connectSpy, disconnect: disconnectSpy, connected: false },
    }))
    vi.doMock('../../src/lib/axios.js', () => ({
      axiosInstance: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(), defaults: { baseURL: '' } },
    }))
    const { useMessageStore: freshStore } = await import('../../src/store/useMessageStore.js')

    // call connectRealTime twice
    freshStore.getState().connectRealtime()
    freshStore.getState().connectRealtime()

    // listeners registered only once, connect attempted each call
    expect(onSpy).toHaveBeenCalledTimes(4)
    expect(connectSpy).toHaveBeenCalledTimes(2)

    freshStore.getState().disconnectRealtime()
    expect(disconnectSpy).toHaveBeenCalledOnce()
  })
})
