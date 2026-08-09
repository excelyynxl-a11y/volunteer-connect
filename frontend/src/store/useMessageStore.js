import { create } from "zustand";

import { axiosInstance } from "../lib/axios";
import { messageSocket } from "../lib/messageSocket";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

const getId = (value) => String(value?._id ?? value ?? "");

const appendUniqueMessage = (messages, message) => {
  if (!message || messages.some((item) => getId(item._id) === getId(message._id))) {
    return messages;
  }

  return [...messages, message];
};

const updateConversation = (conversations, conversationId, updates) =>
  conversations.map((conversation) =>
    getId(conversation._id) === getId(conversationId)
      ? { ...conversation, ...updates }
      : conversation,
  );

let realtimeListenersBound = false;
let messageRequestSequence = 0;

export const useMessageStore = create((set, get) => ({
  conversations: [],
  messages: [],
  selectedConversationId: null,
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  isEndingConversation: false,
  messageError: "",
  draftMessage: "",

  setDraftMessage: (value) => set({ draftMessage: value }),
  clearMessageError: () => set({ messageError: "" }),

  getMyConversations: async ({ silent = false } = {}) => {
    if (!silent) {
      set({ isLoadingConversations: true, messageError: "" });
    }

    try {
      const response = await axiosInstance.get("/message/conversations");
      const conversations = Array.isArray(response.data?.data)
        ? response.data.data
        : [];
      const selectedConversationId = conversations.some(
        (conversation) =>
          getId(conversation._id) === getId(get().selectedConversationId),
      )
        ? get().selectedConversationId
        : null;
      const selectionWasCleared =
        getId(selectedConversationId) !== getId(get().selectedConversationId);

      if (selectionWasCleared) {
        messageRequestSequence += 1;
      }

      set({
        conversations,
        selectedConversationId,
        messages: selectedConversationId ? get().messages : [],
        draftMessage: selectedConversationId ? get().draftMessage : "",
        isLoadingMessages: selectionWasCleared
          ? false
          : get().isLoadingMessages,
        isLoadingConversations: false,
      });
      return { success: true, conversations };
    } catch (error) {
      const message = getErrorMessage(error, "Unable to load conversations.");
      set({
        messageError: message,
        isLoadingConversations: false,
      });
      return { success: false, error: message };
    }
  },

  getConversationMessages: async (conversationId) => {
    const requestId = ++messageRequestSequence;

    set({
      isLoadingMessages: true,
      messageError: "",
      selectedConversationId: conversationId,
      messages: [],
      draftMessage: "",
    });

    try {
      const response = await axiosInstance.get(
        `/message/conversations/${conversationId}/messages`,
      );
      const responseData = response.data?.data ?? {};
      const messages = Array.isArray(responseData.messages)
        ? responseData.messages
        : [];
      const responseDeadline = responseData.conversation?.responseDeadline ?? null;

      if (
        requestId !== messageRequestSequence ||
        getId(get().selectedConversationId) !== getId(conversationId)
      ) {
        return { success: false, stale: true };
      }

      set((state) => ({
        messages,
        conversations: updateConversation(state.conversations, conversationId, {
          responseDeadline,
          unreadCount: 0,
        }),
        isLoadingMessages: false,
      }));

      await get().markConversationAsRead(conversationId);
      return { success: true, messages };
    } catch (error) {
      if (
        requestId !== messageRequestSequence ||
        getId(get().selectedConversationId) !== getId(conversationId)
      ) {
        return { success: false, stale: true };
      }

      const message = getErrorMessage(error, "Unable to load messages.");
      set({ messageError: message, isLoadingMessages: false });

      if ([404, 410].includes(error.response?.status)) {
        set((state) => ({
          conversations: state.conversations.filter(
            (conversation) => getId(conversation._id) !== getId(conversationId),
          ),
          selectedConversationId: null,
          messages: [],
        }));
      }

      return { success: false, error: message };
    }
  },

  clearSelectedConversation: () => {
    messageRequestSequence += 1;
    set({
      selectedConversationId: null,
      messages: [],
      draftMessage: "",
      isLoadingMessages: false,
    });
  },

  markConversationAsRead: async (conversationId) => {
    try {
      await axiosInstance.patch(`/message/conversations/${conversationId}/read`);
      set((state) => ({
        conversations: updateConversation(state.conversations, conversationId, {
          unreadCount: 0,
        }),
      }));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error, "Unable to mark conversation as read."),
      };
    }
  },

  sendMessage: async (conversationId, { content = "", attachment = null }) => {
    if (!content.trim() && !attachment) {
      return { success: false, error: "Message text or an attachment is required." };
    }

    set({ isSendingMessage: true, messageError: "" });

    try {
      const formData = new FormData();
      formData.append("content", content.trim());
      if (attachment) formData.append("attachment", attachment);

      const response = await axiosInstance.post(
        `/message/conversations/${conversationId}/messages`,
        formData,
      );
      const message = response.data?.data?.message;
      const responseDeadline = response.data?.data?.responseDeadline ?? null;

      set((state) => {
        const isSelectedConversation =
          getId(state.selectedConversationId) === getId(conversationId);

        return {
          messages: isSelectedConversation
            ? appendUniqueMessage(state.messages, message)
            : state.messages,
          conversations: updateConversation(
            state.conversations,
            conversationId,
            {
              lastMessage: message,
              lastMessageAt: message?.createdAt,
              responseDeadline,
            },
          ),
          draftMessage: isSelectedConversation
            ? ""
            : state.draftMessage,
          isSendingMessage: false,
        };
      });
      await get().getMyConversations({ silent: true });
      return { success: true, data: response.data?.data };
    } catch (error) {
      const message = getErrorMessage(error, "Unable to send message.");
      set((state) => ({
        messageError:
          getId(state.selectedConversationId) === getId(conversationId)
            ? message
            : state.messageError,
        isSendingMessage: false,
      }));
      return { success: false, error: message };
    }
  },

  initiateConversation: async (
    organisationId,
    { content = "", attachment = null },
  ) => {
    if (!content.trim() && !attachment) {
      return { success: false, error: "Message text or an attachment is required." };
    }

    set({ isSendingMessage: true, messageError: "" });

    try {
      const formData = new FormData();
      formData.append("organisationId", organisationId);
      formData.append("content", content.trim());
      if (attachment) formData.append("attachment", attachment);

      const response = await axiosInstance.post("/message/conversations", formData);
      const conversationId = response.data?.data?.conversation?._id;
      set({ draftMessage: "", isSendingMessage: false });
      await get().getMyConversations();
      if (conversationId) await get().getConversationMessages(conversationId);
      return { success: true, data: response.data?.data };
    } catch (error) {
      const existingConversationId = error.response?.data?.data?.conversationId;
      if (error.response?.status === 409 && existingConversationId) {
        set({ isSendingMessage: false });
        await get().getMyConversations();
        await get().getConversationMessages(existingConversationId);
        return { success: true, existingConversationId };
      }

      const message = getErrorMessage(error, "Unable to start conversation.");
      set({ messageError: message, isSendingMessage: false });
      return { success: false, error: message };
    }
  },

  endConversation: async (conversationId) => {
    set({ isEndingConversation: true, messageError: "" });

    try {
      await axiosInstance.delete(`/message/conversations/${conversationId}`);
      const wasSelected =
        getId(get().selectedConversationId) === getId(conversationId);

      if (wasSelected) {
        messageRequestSequence += 1;
      }

      set((state) => ({
        conversations: state.conversations.filter(
          (conversation) => getId(conversation._id) !== getId(conversationId),
        ),
        ...(wasSelected
          ? {
              selectedConversationId: null,
              messages: [],
              draftMessage: "",
              isLoadingMessages: false,
            }
          : {}),
        isEndingConversation: false,
      }));
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, "Unable to end conversation.");
      set({ messageError: message, isEndingConversation: false });
      return { success: false, error: message };
    }
  },

  downloadAttachment: (conversationId, messageId) => {
    const baseUrl = String(axiosInstance.defaults.baseURL).replace(/\/$/, "");
    const link = document.createElement("a");
    link.href = `${baseUrl}/message/conversations/${conversationId}/messages/${messageId}/attachment`;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  connectRealtime: () => {
    if (!realtimeListenersBound) {
      messageSocket.on("conversation:created", () => {
        void get().getMyConversations({ silent: true });
      });

      messageSocket.on(
        "message:created",
        ({ conversationId, message, responseDeadline }) => {
          set((state) => ({
            messages:
              getId(state.selectedConversationId) === getId(conversationId)
                ? appendUniqueMessage(state.messages, message)
                : state.messages,
            conversations: updateConversation(state.conversations, conversationId, {
              lastMessage: message,
              lastMessageAt: message?.createdAt,
              responseDeadline: responseDeadline ?? null,
            }),
          }));
          void get().getMyConversations({ silent: true });
        },
      );

      messageSocket.on(
        "conversation:deadline-changed",
        ({ conversationId, responseDeadline }) => {
          set((state) => ({
            conversations: updateConversation(state.conversations, conversationId, {
              responseDeadline: responseDeadline ?? null,
            }),
          }));
        },
      );

      messageSocket.on("conversation:deleted", ({ conversationId }) => {
        const wasSelected =
          getId(get().selectedConversationId) === getId(conversationId);

        if (wasSelected) {
          messageRequestSequence += 1;
        }

        set((state) => {
          return {
            conversations: state.conversations.filter(
              (conversation) => getId(conversation._id) !== getId(conversationId),
            ),
            selectedConversationId: wasSelected
              ? null
              : state.selectedConversationId,
            messages: wasSelected ? [] : state.messages,
            draftMessage: wasSelected ? "" : state.draftMessage,
            isLoadingMessages: wasSelected
              ? false
              : state.isLoadingMessages,
          };
        });
      });

      realtimeListenersBound = true;
    }

    if (!messageSocket.connected) messageSocket.connect();
  },

  disconnectRealtime: () => {
    messageSocket.disconnect();
  },
}));
