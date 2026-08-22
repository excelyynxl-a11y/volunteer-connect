import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import VolunteerMessages from '../../src/pages/Volunteer/VolunteerMessages.jsx'
import { useAuthStore } from '../../src/store/useAuthStore.js'
import { useMessageStore } from '../../src/store/useMessageStore.js'

const conversation = {
  _id: 'conversation-1',
  participant: { _id: 'organisation-1', name: 'Green Neighbours' },
  unreadCount: 2,
  lastMessage: {
    _id: 'message-1',
    content: 'Welcome',
    createdAt: '2030-01-01T01:00:00.000Z',
  },
  responseDeadline: null,
}

const message = {
  _id: 'message-1',
  senderId: 'organisation-1',
  content: 'Welcome',
  createdAt: '2030-01-01T01:00:00.000Z',
}

const defaultActions = () => ({
  getMyConversations: vi.fn(),
  getConversationMessages: vi.fn(),
  sendMessage: vi.fn(),
  initiateConversation: vi.fn(),
  endConversation: vi.fn(),
  downloadAttachment: vi.fn(),
  connectRealtime: vi.fn(),
  disconnectRealtime: vi.fn(),
  clearMessageError: vi.fn(),
  clearSelectedConversation: vi.fn(),
})

const resetStores = () => {
  useAuthStore.setState({ authUser: { _id: 'volunteer-1', role: 'volunteer' } })
  useMessageStore.setState({
    conversations: [],
    messages: [],
    selectedConversationId: null,
    draftMessage: '',
    isLoadingConversations: false,
    isLoadingMessages: false,
    isSendingMessage: false,
    isEndingConversation: false,
    messageError: '',
    ...defaultActions(),
  })
}

const renderMessages = (entry = '/messages') =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <VolunteerMessages />
    </MemoryRouter>,
  )

const selectConversationState = (overrides = {}) => {
  useMessageStore.setState({
    conversations: [conversation],
    selectedConversationId: conversation._id,
    messages: [message],
    ...overrides,
  })
}

beforeAll(() => {
  HTMLElement.prototype.scrollTo = vi.fn()
})

afterEach(() => {
  vi.restoreAllMocks()
  resetStores()
})

describe('Messaging UI', () => {
  it('renders conversation and thread loading, error, empty, and recovery states', () => {
    useMessageStore.setState({ isLoadingConversations: true })
    const view = renderMessages()
    expect(screen.getByText('Loading conversations...')).toBeInTheDocument()

    useMessageStore.setState({
      isLoadingConversations: false,
      isLoadingMessages: true,
      messageError: 'Unable to load messages.',
    })
    view.rerender(<MemoryRouter><VolunteerMessages /></MemoryRouter>)
    expect(screen.getByText('Unable to load messages.')).toBeInTheDocument()
    expect(screen.getByText('Loading messages...')).toBeInTheDocument()

    useMessageStore.setState({ isLoadingMessages: false, messageError: '' })
    view.rerender(<MemoryRouter><VolunteerMessages /></MemoryRouter>)
    expect(screen.getByText('No active conversations.')).toBeInTheDocument()
    expect(screen.getByText('Select a conversation from the list to view the chat.')).toBeInTheDocument()
  })

  it('lets a Volunteer start a conversation with one valid first message', async () => {
    const user = userEvent.setup()
    const initiateConversation = vi.fn().mockResolvedValue({ success: true })
    useMessageStore.setState({ initiateConversation })
    renderMessages('/messages?organisationId=organisation-1&organisationName=Green+Neighbours')

    expect(screen.getByText('Write the first message to start this conversation.')).toBeInTheDocument()
    await user.type(screen.getByPlaceholderText('Write a message...'), 'Hello there')
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    expect(initiateConversation).toHaveBeenCalledOnce()
    expect(initiateConversation).toHaveBeenCalledWith('organisation-1', {
      content: 'Hello there',
      attachment: null,
    })
  })

  it('sends text, attachment, and combined messages once', async () => {
    const user = userEvent.setup()
    const sendMessage = vi.fn().mockResolvedValue({ success: true })
    useMessageStore.setState({ sendMessage })
    selectConversationState()
    const view = renderMessages()

    await user.type(screen.getByPlaceholderText('Write a message...'), 'Text only')
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    expect(sendMessage).toHaveBeenLastCalledWith('conversation-1', {
      content: 'Text only',
      attachment: null,
    })

    useMessageStore.setState({ draftMessage: '' })
    const attachment = new File(['pdf'], 'guide.pdf', { type: 'application/pdf' })
    await user.upload(view.container.querySelector('input[type="file"]'), attachment)
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    expect(sendMessage).toHaveBeenLastCalledWith('conversation-1', {
      content: '',
      attachment,
    })

    await user.upload(view.container.querySelector('input[type="file"]'), attachment)
    await user.type(screen.getByPlaceholderText('Write a message...'), 'With file')
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    expect(sendMessage).toHaveBeenLastCalledWith('conversation-1', {
      content: 'With file',
      attachment,
    })
    expect(sendMessage).toHaveBeenCalledTimes(3)
  })

  it('rejects invalid or oversized attachments before sending', () => {
    const sendMessage = vi.fn()
    useMessageStore.setState({ sendMessage })
    selectConversationState()
    const view = renderMessages()
    const input = view.container.querySelector('input[type="file"]')

    fireEvent.change(input, {
      target: { files: [new File(['text'], 'notes.txt', { type: 'text/plain' })] },
    })
    expect(screen.getByText('Only PDF, JPG, JPEG, and PNG files are supported.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()

    const oversized = new File(['image'], 'large.png', { type: 'image/png' })
    Object.defineProperty(oversized, 'size', { value: 5 * 1024 * 1024 + 1 })
    fireEvent.change(input, { target: { files: [oversized] } })
    expect(screen.getByText('Attachments must be 5 MB or smaller.')).toBeInTheDocument()
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('shows unread state and marks the selected conversation as read', async () => {
    const user = userEvent.setup()
    const getConversationMessages = vi.fn().mockResolvedValue({ success: true })
    useMessageStore.setState({
      conversations: [conversation],
      getConversationMessages,
    })
    renderMessages()

    expect(screen.getByText('2')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Green Neighbours/ }))
    expect(getConversationMessages).toHaveBeenCalledWith('conversation-1')
  })

  it('updates messages and deadline state after realtime events without duplication', () => {
    selectConversationState()
    const view = renderMessages()
    expect(screen.getAllByText('Welcome')).toHaveLength(2)

    useMessageStore.setState({
      messages: [message, { ...message, _id: 'message-2', content: 'Realtime update' }],
      conversations: [{ ...conversation, responseDeadline: '2030-01-01T02:00:00.000Z' }],
    })
    view.rerender(<MemoryRouter><VolunteerMessages /></MemoryRouter>)
    expect(screen.getByText('Realtime update')).toBeInTheDocument()
    expect(screen.getAllByText('Welcome')).toHaveLength(2)
    expect(screen.getByRole('status')).toHaveTextContent('Volunteer reply deadline')
  })

  it('shows End chat only to the Organisation and requires confirmation', async () => {
    const user = userEvent.setup()
    const endConversation = vi.fn().mockResolvedValue({ success: true })
    useMessageStore.setState({ endConversation })
    selectConversationState()
    const volunteerView = renderMessages()
    expect(screen.queryByRole('button', { name: 'End chat' })).not.toBeInTheDocument()

    volunteerView.unmount()
    useAuthStore.setState({ authUser: { _id: 'organisation-1', role: 'organisation' } })
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
    renderMessages()
    await user.click(screen.getByRole('button', { name: 'End chat' }))
    expect(endConversation).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'End chat' }))
    expect(endConversation).toHaveBeenCalledWith('conversation-1')
  })

  it('removes a conversation after end or expiry and handles reconnect safely', () => {
    const connectRealtime = vi.fn()
    const disconnectRealtime = vi.fn()
    useMessageStore.setState({ connectRealtime, disconnectRealtime })
    selectConversationState()
    const view = renderMessages()
    expect(connectRealtime).toHaveBeenCalledOnce()

    act(() => {
      useMessageStore.setState({
        conversations: [],
        selectedConversationId: null,
        messages: [],
      })
    })
    expect(screen.getByText('No active conversations.')).toBeInTheDocument()
    expect(screen.queryByText('Welcome')).not.toBeInTheDocument()

    view.unmount()
    expect(disconnectRealtime).toHaveBeenCalledOnce()
  })
})
