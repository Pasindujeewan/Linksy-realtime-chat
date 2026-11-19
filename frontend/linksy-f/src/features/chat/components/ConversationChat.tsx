import { MessageCircle, RotateCw } from "lucide-react";
import { useEffect, useRef } from "react";
import MessageComposer from "./MessageComposer";
import { useConversation } from "../hooks/useConversation";
import "./ConversationChat.css";

interface ConversationChatProps {
  recipientId: string;
  currentUserId: string;
  recipientName: string;
}

function formatMessageTime(createdAt?: string): string | null {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function ConversationChat({
  recipientId,
  currentUserId,
  recipientName,
}: ConversationChatProps) {
  const {
    messages,
    connectionStatus,
    error,
    retry,
    sendMessage,
    hasMoreMessages,
    isLoadingOlderMessages,
    loadOlderMessages,
  } = useConversation(recipientId, currentUserId);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const latestMessageId = messages.at(-1)?.id;
  const connectionLabel =
    connectionStatus === "ready"
      ? "Connected"
      : connectionStatus === "connecting"
        ? "Connecting"
        : "Connection issue";

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [latestMessageId]);

  return (
    <div className="conversation-chat">
      <div
        className={`conversation-status conversation-status-${connectionStatus}`}
        role="status"
      >
        <span aria-hidden="true" />
        {connectionLabel}
      </div>
      <div
        ref={messagesContainerRef}
        aria-live="polite"
        className="conversation-messages"
      >
        {hasMoreMessages && (
          <div className="conversation-history-control">
            <button
              type="button"
              onClick={loadOlderMessages}
              disabled={isLoadingOlderMessages}
              className="conversation-history-button"
            >
              {isLoadingOlderMessages ? "Loading…" : "Load older messages"}
            </button>
          </div>
        )}

        {connectionStatus === "connecting" && messages.length === 0 && (
          <p className="conversation-joining">
            Joining conversation…
          </p>
        )}

        {error && (
          <div className="conversation-error">
            <p role="alert">
              {error}
            </p>
            <button
              type="button"
              onClick={retry}
              className="conversation-retry"
            >
              <RotateCw aria-hidden="true" />
              Try again
            </button>
          </div>
        )}

        {connectionStatus === "ready" && messages.length === 0 && (
          <div className="conversation-empty-state">
            <div>
              <span className="conversation-empty-icon">
                <MessageCircle aria-hidden="true" />
              </span>
              <p className="conversation-empty-title">
                Start a conversation with {recipientName}.
              </p>
              <p className="conversation-empty-copy">
                Messages will appear here.
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => {
          const isOwnMessage = message.senderId === currentUserId;
          const messageTime = formatMessageTime(message.createdAt);

          return (
            <div
              key={message.id}
              className={`conversation-message-row ${
                isOwnMessage ? "conversation-message-row-own" : ""
              }`}
            >
              <article
                aria-label={isOwnMessage ? "Your message" : `${recipientName}'s message`}
                className={`conversation-message ${
                  isOwnMessage ? "conversation-message-own" : ""
                }`}
              >
                <p className="conversation-message-content">
                  {message.content}
                </p>
                {messageTime && (
                  <time
                    dateTime={message.createdAt}
                    className="conversation-message-time"
                  >
                    {messageTime}
                  </time>
                )}
                {isOwnMessage && message.readBy?.includes(recipientId) && (
                  <span className="conversation-seen">
                    Seen
                  </span>
                )}
              </article>
            </div>
          );
        })}
      </div>

      <MessageComposer
        disabled={connectionStatus !== "ready"}
        onSend={sendMessage}
      />
    </div>
  );
}
