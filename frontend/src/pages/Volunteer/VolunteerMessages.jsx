import React, { useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useMessageStore } from "../../store/useMessageStore";
import { formatMessageTime, getInitials } from "../../lib/utils";
import "./Volunteer.css";
import "./Messages.css";

const MessageAvatar = ({ name, avatar }) => {
  if (avatar) {
    return <img src={avatar} alt={`${name} avatar`} className="message-avatar" />;
  }

  return <div className="message-avatar message-avatar-fallback">{getInitials(name)}</div>;
};

const VolunteerMessages = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const {
    conversations,
    messages,
    selectedConversationId,
    draftMessage,
    isLoadingConversations,
    isLoadingMessages,
    messageError,
    setDraftMessage,
    getMyConversations,
    getConversationMessages,
    sendMessage,
  } = useMessageStore();

  useEffect(() => {
    getMyConversations();
  }, [getMyConversations]);

  const selectedConversation = conversations.find(
    (conversation) => conversation._id === selectedConversationId,
  );

  const onConversationClick = async (conversation) => {
    await getConversationMessages(conversation._id);
  };

  const onSendMessage = async () => {
    if (!selectedConversationId || !draftMessage.trim()) return;
    await sendMessage(selectedConversationId, draftMessage);
  };

  const conversationSubtitle =
    selectedConversation?.participant?.subtitle ||
    selectedConversation?.participant?.role ||
    "Volunteer";

  return (
    <div className="messages-page">
      <div className="messages-hero">
        <div className="messages-hero-copy">
          <div className="messages-hero-label">MESSAGES</div>
          <h1>Inbox</h1>
          <p>Continue conversations about volunteering activities.</p>
        </div>
      </div>

      <div className="messages-grid">
        <aside className="messages-panel messages-panel-left">
          <div className="messages-panel-header">
            <div>
              <h2>Conversations</h2>
              <p>Continue the conversation with volunteer partners and organisations.</p>
            </div>
            <div className="messages-search-field">
              <input
                type="search"
                placeholder="Search conversations"
                disabled
              />
            </div>
          </div>

          <div className="messages-conversation-list">
            {isLoadingConversations ? (
              <div className="messages-loading">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="messages-empty">No conversations yet.</div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation._id}
                  type="button"
                  className={`messages-conversation-item${conversation._id === selectedConversationId ? " active" : ""}`}
                  onClick={() => onConversationClick(conversation)}
                >
                  <MessageAvatar
                    name={conversation.participant?.name || "Unknown"}
                    avatar={conversation.participant?.avatar}
                  />

                  <div className="messages-conversation-copy">
                    <div>
                      <strong>{conversation.participant?.name || "Unknown"}</strong>
                      <span>{conversation.lastMessage?.content || "No messages yet."}</span>
                    </div>
                    <div className="messages-conversation-meta">
                      <span>{conversation.lastMessage?.createdAt ? formatMessageTime(conversation.lastMessage.createdAt) : ""}</span>
                      {conversation.unreadCount > 0 && (
                        <span className="messages-unread-count">{conversation.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="messages-panel messages-panel-right">
          <div className="messages-thread-header">
            {selectedConversation ? (
              <>
                <div className="messages-thread-header-left">
                  <MessageAvatar
                    name={selectedConversation.participant?.name || "Unknown"}
                    avatar={selectedConversation.participant?.avatar}
                  />
                  <div>
                    <h3>{selectedConversation.participant?.name || "Unknown"}</h3>
                    <p>{conversationSubtitle}</p>
                  </div>
                </div>
                <button type="button" className="messages-view-profile">View Profile</button>
              </>
            ) : (
              <div className="messages-no-selection">Select a conversation to view the chat.</div>
            )}
          </div>

          <div className="messages-thread-content">
            {messageError && <div className="messages-error">{messageError}</div>}
            {isLoadingMessages ? (
              <div className="messages-loading">Loading messages...</div>
            ) : selectedConversation ? (
              <>
                <div className="messages-date-pill">Today</div>
                <div className="messages-bubble-list">
                  {messages.length === 0 ? (
                    <div className="messages-empty">No messages yet.</div>
                  ) : (
                    messages.map((message) => {
                      const isOwn =
                        message.senderId === authUser?._id ||
                        message.senderId === "user-mock-self";
                      return (
                        <div
                          key={message._id}
                          className={`messages-bubble${isOwn ? " own" : ""}`}
                        >
                          {message.content && <p>{message.content}</p>}
                          {message.attachments?.length > 0 && (
                            <div className="messages-attachments">
                              {message.attachments.map((attachment) => (
                                <div key={attachment.fileUrl} className="messages-attachment-item">
                                  <span className="messages-attachment-icon">📎</span>
                                  <div>
                                    <strong>{attachment.fileName}</strong>
                                    <small>{attachment.fileType || "File"}</small>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <small>{formatMessageTime(message.createdAt)}</small>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <div className="messages-empty-state">
                <p>Select a conversation from the list to view the thread.</p>
              </div>
            )}
          </div>

          <div className="messages-compose-row">
            <button type="button" className="messages-attach-button" disabled>
              📎
            </button>
            <textarea
              value={draftMessage}
              onChange={(e) => setDraftMessage(e.target.value)}
              placeholder={selectedConversation ? "Write a message..." : "Select a conversation to start messaging."}
              disabled={!selectedConversation}
            />
            <button
              type="button"
              className="messages-send-button"
              onClick={onSendMessage}
              disabled={!selectedConversation || !draftMessage.trim()}
            >
              ➤
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VolunteerMessages;
