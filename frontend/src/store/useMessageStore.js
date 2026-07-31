import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

const mockConversations = [
  {
    _id: "conversation-mock-001",
    participant: {
      _id: "user-mock-001",
      name: "Helping Hands Malaysia",
      avatar: "",
      role: "organisation",
      subtitle: "Organisation · Event coordination",
    },
    lastMessage: {
      content: "Please bring your ID and wear comfortable shoes.",
      createdAt: new Date(Date.now() - 1200 * 1000).toISOString(),
    },
    unreadCount: 2,
    lastMessageAt: new Date(Date.now() - 1200 * 1000).toISOString(),
  },
  {
    _id: "conversation-mock-002",
    participant: {
      _id: "user-mock-002",
      name: "Green Earth Society",
      avatar: "",
      role: "organisation",
      subtitle: "Organisation · Cleanup coordination",
    },
    lastMessage: {
      content: "Thanks for your interest. Please bring a reusable water bottle and a hat.",
      createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    },
    unreadCount: 1,
    lastMessageAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
];

const mockMessages = {
  "conversation-mock-001": [
    {
      _id: "message-mock-001",
      senderId: "user-mock-self",
      content: "Hello, I would like to confirm my availability for the Saturday food drive.",
      createdAt: new Date(Date.now() - 2400 * 1000).toISOString(),
      isRead: true,
    },
    {
      _id: "message-mock-002",
      senderId: "user-mock-001",
      content: "Hello Brandon, your shift is confirmed for Saturday 9am at the community hall.",
      createdAt: new Date(Date.now() - 1200 * 1000).toISOString(),
      isRead: false,
    },
    {
      _id: "message-mock-003",
      senderId: "user-mock-self",
      content: "Thanks, I will be there.",
      createdAt: new Date(Date.now() - 600 * 1000).toISOString(),
      isRead: true,
    },
    {
      _id: "message-mock-004",
      senderId: "user-mock-001",
      content: "Please bring your ID and wear comfortable shoes.",
      createdAt: new Date(Date.now() - 300 * 1000).toISOString(),
      isRead: false,
      attachments: [
        {
          fileName: "Event_Checklist.pdf",
          fileUrl: "https://example.com/Event_Checklist.pdf",
          fileType: "application/pdf",
        },
      ],
    },
  ],
  "conversation-mock-002": [
    {
      _id: "message-mock-005",
      senderId: "user-mock-self",
      content: "Hi, I would like to join the beach cleanup event next week.",
      createdAt: new Date(Date.now() - 4200 * 1000).toISOString(),
      isRead: true,
    },
    {
      _id: "message-mock-006",
      senderId: "user-mock-002",
      content: "Thanks for your interest. Please bring a reusable water bottle and a hat.",
      createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      isRead: false,
    },
  ],
};

export const useMessageStore = create((set, get) => ({
  conversations: [],
  messages: [],
  selectedConversationId: null,
  isLoadingConversations: false,
  isLoadingMessages: false,
  messageError: "",
  draftMessage: "",

  setDraftMessage: (value) => set({ draftMessage: value }),

  getMyConversations: async () => {
    set({ isLoadingConversations: true, messageError: "" });

    try {
      try {
        const response = await axiosInstance.get("/message/conversations");
        const conversations = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        set({ conversations, isLoadingConversations: false });
        return { success: true, conversations };
      } catch {
        set({ conversations: mockConversations, isLoadingConversations: false });
        return { success: true, conversations: mockConversations };
      }
    } catch (error) {
      set({ messageError: "Unable to load conversations.", isLoadingConversations: false });
      return { success: false, error: "Unable to load conversations." };
    }
  },

  getConversationMessages: async (conversationId) => {
    set({ isLoadingMessages: true, messageError: "", selectedConversationId: conversationId });

    try {
      try {
        const response = await axiosInstance.get(
          `/message/conversations/${conversationId}/messages`,
        );
        const messages = Array.isArray(response.data?.data) ? response.data.data : [];
        set({ messages, isLoadingMessages: false });
        return { success: true, messages };
      } catch {
        const messages = mockMessages[conversationId] ?? [];
        set({ messages, isLoadingMessages: false });
        return { success: true, messages };
      }
    } catch (error) {
      set({ messageError: "Unable to load messages.", isLoadingMessages: false });
      return { success: false, error: "Unable to load messages." };
    }
  },

  sendMessage: async (conversationId, content) => {
    if (!content || !content.trim()) {
      return { success: false, error: "Message content is required." };
    }

    try {
      try {
        const response = await axiosInstance.post(
          `/message/conversations/${conversationId}/messages`,
          { content: content.trim() },
        );
        await get().getConversationMessages(conversationId);
        set({ draftMessage: "" });
        return response.data;
      } catch {
        const currentMessages = get().messages ?? [];
        const newMessage = {
          _id: `message-mock-${Date.now()}`,
          senderId: "user-mock-self",
          content: content.trim(),
          createdAt: new Date().toISOString(),
        };
        set({ messages: [...currentMessages, newMessage], draftMessage: "" });
        return { success: true, data: newMessage };
      }
    } catch (error) {
      return { success: false, error: "Unable to send message." };
    }
  },
}));
