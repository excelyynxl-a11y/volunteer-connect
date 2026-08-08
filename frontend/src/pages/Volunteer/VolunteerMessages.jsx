import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  FileText,
  Image,
  Paperclip,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { formatMessageTime, getInitials } from "../../lib/utils";
import { useAuthStore } from "../../store/useAuthStore";
import { useMessageStore } from "../../store/useMessageStore";
import "./Volunteer.css";
import "./Messages.css";

const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);
const ALLOWED_ATTACHMENT_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png"]);

const getId = (value) => String(value?._id ?? value ?? "");

const formatFileSize = (size = 0) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const validateAttachment = (file) => {
  if (!file) return "";
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (
    !ALLOWED_ATTACHMENT_TYPES.has(file.type) ||
    !ALLOWED_ATTACHMENT_EXTENSIONS.has(extension)
  ) {
    return "Only PDF, JPG, JPEG, and PNG files are supported.";
  }
  if (file.size > MAX_ATTACHMENT_SIZE) {
    return "Attachments must be 5 MB or smaller.";
  }
  return "";
};

const MessageAvatar = ({ name, avatar }) => {
  if (avatar) {
    return <img src={avatar} alt={`${name} avatar`} className="message-avatar" />;
  }

  return (
    <div className="message-avatar message-avatar-fallback">
      {getInitials(name)}
    </div>
  );
};

const DeadlineNotice = ({ deadline }) => {
  const [now, setNow] = useState(null);

  useEffect(() => {
    if (!deadline) return undefined;
    const initialTimer = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [deadline]);

  if (!deadline) return null;
  if (now === null) {
    return (
      <div className="messages-deadline" role="status">
        Volunteer reply deadline is active.
      </div>
    );
  }

  const remaining = Math.max(0, new Date(deadline).getTime() - now);
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  return (
    <div className="messages-deadline" role="status">
      Volunteer reply required within {hours > 0 ? `${hours}h ` : ""}
      {String(minutes).padStart(2, "0")}m {String(seconds).padStart(2, "0")}s
    </div>
  );
};

const MessageAttachment = ({ message, conversationId, onDownload }) => {
  if (!message.attachment) return null;
  const isImage = message.attachment.mimeType?.startsWith("image/");
  const Icon = isImage ? Image : FileText;

  return (
    <button
      type="button"
      className="messages-attachment-item"
      onClick={() => onDownload(conversationId, message._id)}
      aria-label={`Download ${message.attachment.fileName}`}
    >
      <span className="messages-attachment-icon">
        <Icon size={17} />
      </span>
      <span>
        <strong>{message.attachment.fileName}</strong>
        <small>{formatFileSize(message.attachment.size)}</small>
      </span>
      <Download size={17} aria-hidden="true" />
    </button>
  );
};

const VolunteerMessages = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [attachmentError, setAttachmentError] = useState("");
  const fileInputRef = useRef(null);
  const messageListRef = useRef(null);
  const organisationId = searchParams.get("organisationId");
  const organisationName = searchParams.get("organisationName") || "Organisation";

  const {
    conversations,
    messages,
    selectedConversationId,
    draftMessage,
    isLoadingConversations,
    isLoadingMessages,
    isSendingMessage,
    isEndingConversation,
    messageError,
    setDraftMessage,
    clearMessageError,
    clearSelectedConversation,
    getMyConversations,
    getConversationMessages,
    sendMessage,
    initiateConversation,
    endConversation,
    downloadAttachment,
    connectRealtime,
    disconnectRealtime,
  } = useMessageStore();

  const isOrganisation = authUser?.role === "organisation";
  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => getId(conversation._id) === getId(selectedConversationId),
      ),
    [conversations, selectedConversationId],
  );

  useEffect(() => {
    void getMyConversations();
    connectRealtime();
    return disconnectRealtime;
  }, [connectRealtime, disconnectRealtime, getMyConversations]);

  useEffect(() => {
    if (!organisationId || isOrganisation || isLoadingConversations) return;
    const existingConversation = conversations.find(
      (conversation) => getId(conversation.participant) === organisationId,
    );
    if (!existingConversation) {
      clearSelectedConversation();
      return;
    }

    if (getId(existingConversation._id) !== getId(selectedConversationId)) {
      void getConversationMessages(existingConversation._id);
    }
  }, [
    clearSelectedConversation,
    conversations,
    getConversationMessages,
    isLoadingConversations,
    isOrganisation,
    organisationId,
    selectedConversationId,
  ]);

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const onConversationClick = async (conversation) => {
    setSelectedFile(null);
    setAttachmentError("");
    clearMessageError();
    if (organisationId) setSearchParams({}, { replace: true });
    await getConversationMessages(conversation._id);
  };

  const onFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    const validationError = validateAttachment(file);
    event.target.value = "";
    setAttachmentError(validationError);
    setSelectedFile(validationError ? null : file);
  };

  const onSendMessage = async () => {
    const payload = { content: draftMessage, attachment: selectedFile };
    let result;
    const selectedConversationMatchesOrganisation =
      !organisationId ||
      getId(selectedConversation?.participant) === organisationId;

    if (selectedConversationId && selectedConversationMatchesOrganisation) {
      result = await sendMessage(selectedConversationId, payload);
    } else if (organisationId && !isOrganisation) {
      result = await initiateConversation(organisationId, payload);
    } else {
      return;
    }

    if (result.success) {
      setSelectedFile(null);
      setAttachmentError("");
      if (organisationId) setSearchParams({}, { replace: true });
    }
  };

  const onEndConversation = async () => {
    if (!selectedConversationId) return;
    const confirmed = window.confirm(
      "End this chat? The conversation, messages, and attachments will be permanently deleted for both participants.",
    );
    if (confirmed) await endConversation(selectedConversationId);
  };

  const selectedConversationMatchesOrganisation =
    !organisationId ||
    getId(selectedConversation?.participant) === organisationId;
  const canCompose = Boolean(
    (selectedConversation && selectedConversationMatchesOrganisation) ||
      (organisationId && !isOrganisation),
  );
  const hasMessagePayload = Boolean(draftMessage.trim() || selectedFile);
  const headerParticipant = selectedConversation?.participant;

  return (
    <div className="messages-page">
      <div className="messages-hero">
        <div className="messages-hero-copy">
          <div className="messages-hero-label">MESSAGES</div>
          <h1>Inbox</h1>
          <p>
            {isOrganisation
              ? "Reply to volunteers and manage active conversations."
              : "Continue conversations with organisations."}
          </p>
        </div>
      </div>

      <div className="messages-grid">
        <aside className="messages-panel messages-panel-left">
          <div className="messages-panel-header">
            <div>
              <h2>Conversations</h2>
              <p>
                {isOrganisation
                  ? "Conversations initiated by volunteers."
                  : "Your active organisation conversations."}
              </p>
            </div>
          </div>

          <div className="messages-conversation-list">
            {isLoadingConversations ? (
              <div className="messages-loading">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="messages-empty">No active conversations.</div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation._id}
                  type="button"
                  className={`messages-conversation-item${
                    getId(conversation._id) === getId(selectedConversationId)
                      ? " active"
                      : ""
                  }`}
                  onClick={() => onConversationClick(conversation)}
                >
                  <MessageAvatar
                    name={conversation.participant?.name || "Unknown"}
                    avatar={conversation.participant?.avatar}
                  />
                  <div className="messages-conversation-copy">
                    <strong>{conversation.participant?.name || "Unknown"}</strong>
                    <span>
                      {conversation.lastMessage?.content ||
                        conversation.lastMessage?.attachment?.fileName ||
                        "Attachment"}
                    </span>
                  </div>
                  <div className="messages-conversation-meta">
                    <span>
                      {conversation.lastMessage?.createdAt
                        ? formatMessageTime(conversation.lastMessage.createdAt)
                        : ""}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="messages-unread-count">
                        {conversation.unreadCount}
                      </span>
                    )}
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
                    name={headerParticipant?.name || "Unknown"}
                    avatar={headerParticipant?.avatar}
                  />
                  <div>
                    <h3>{headerParticipant?.name || "Unknown"}</h3>
                    <p>{isOrganisation ? "Volunteer" : "Organisation"}</p>
                  </div>
                </div>
                {isOrganisation && (
                  <button
                    type="button"
                    className="messages-end-chat"
                    onClick={onEndConversation}
                    disabled={isEndingConversation}
                  >
                    <Trash2 size={17} />
                    {isEndingConversation ? "Ending..." : "End chat"}
                  </button>
                )}
              </>
            ) : organisationId && !isOrganisation ? (
              <div className="messages-thread-header-left">
                <MessageAvatar name={organisationName} avatar="" />
                <div>
                  <h3>{organisationName}</h3>
                  <p>New conversation</p>
                </div>
              </div>
            ) : (
              <div className="messages-no-selection">
                Select a conversation to view the chat.
              </div>
            )}
          </div>

          <DeadlineNotice deadline={selectedConversation?.responseDeadline} />

          <div className="messages-thread-content" ref={messageListRef}>
            {messageError && <div className="messages-error">{messageError}</div>}
            {isLoadingMessages ? (
              <div className="messages-loading">Loading messages...</div>
            ) : selectedConversation ? (
              <div className="messages-bubble-list">
                {messages.map((message) => {
                  const isOwn = getId(message.senderId) === getId(authUser?._id);
                  return (
                    <div
                      key={message._id}
                      className={`messages-bubble${isOwn ? " own" : ""}`}
                    >
                      {message.content && <p>{message.content}</p>}
                      <MessageAttachment
                        message={message}
                        conversationId={selectedConversationId}
                        onDownload={downloadAttachment}
                      />
                      <small>{formatMessageTime(message.createdAt)}</small>
                    </div>
                  );
                })}
              </div>
            ) : organisationId && !isOrganisation ? (
              <div className="messages-empty-state">
                <p>Write the first message to start this conversation.</p>
              </div>
            ) : (
              <div className="messages-empty-state">
                <p>Select a conversation from the list to view the thread.</p>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="messages-selected-file">
              <Paperclip size={17} />
              <span>{selectedFile.name}</span>
              <small>{formatFileSize(selectedFile.size)}</small>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                aria-label="Remove selected attachment"
              >
                <X size={17} />
              </button>
            </div>
          )}
          {attachmentError && (
            <div className="messages-attachment-error">{attachmentError}</div>
          )}

          <div className="messages-compose-row">
            <input
              ref={fileInputRef}
              className="messages-file-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={onFileChange}
            />
            <button
              type="button"
              className="messages-attach-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!canCompose || isSendingMessage}
              aria-label="Attach PDF or image"
            >
              <Paperclip size={21} />
            </button>
            <div className="messages-compose-input">
              <textarea
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
                placeholder={
                  canCompose
                    ? "Write a message..."
                    : "Select a conversation to start messaging."
                }
                disabled={!canCompose || isSendingMessage}
                maxLength={2000}
              />
              <small>{draftMessage.length}/2000</small>
            </div>
            <button
              type="button"
              className="messages-send-button"
              onClick={onSendMessage}
              disabled={!canCompose || !hasMessagePayload || isSendingMessage}
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VolunteerMessages;
