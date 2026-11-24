import { MessageCircle, UserRound, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useChatSocket } from "../../contexts/ChatSocketContext";
import { useUser } from "../../contexts/UserContext";
import {
  getRecentConversations,
} from "../chat/services/chatApi";
import {
  parseIncomingMessageNotification,
  type RecentConversation,
} from "../chat/types";

function formatMessageTime(createdAt: string): string | null {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function RecentChats() {
  const { socket, onlineUserIds } = useChatSocket();
  const { user: currentUser } = useUser();
  const [conversations, setConversations] = useState<RecentConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;

    getRecentConversations()
      .then((result) => {
        if (!isCurrentRequest) return;
        setConversations(result);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (!isCurrentRequest) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "We couldn't load your recent chats.",
        );
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [reloadCount]);

  useEffect(() => {
    if (!socket) return;

    function handleNotification(payload: unknown) {
      if (parseIncomingMessageNotification(payload)) {
        setIsLoading(true);
        setError(null);
        setReloadCount((count) => count + 1);
      }
    }

    socket.on("notification:new", handleNotification);
    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, [socket]);

  return (
    <section
      aria-labelledby="recent-chats-heading"
      className="recent-chats-panel"
    >
      <div className="recent-chats-heading">
        <div>
          <p className="people-panel-kicker">PICK UP WHERE YOU LEFT OFF</p>
          <h2 id="recent-chats-heading">Recent chats</h2>
        </div>
        <a href="#people-heading" className="recent-chats-new-link">
          <UsersRound aria-hidden="true" />
          Find people
        </a>
      </div>

      {isLoading && (
        <p role="status" className="people-message">
          Loading recent chats…
        </p>
      )}

      {error && (
        <div className="people-message">
          <p role="alert" className="people-error">
            {error}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setError(null);
              setReloadCount((count) => count + 1);
            }}
            className="people-secondary-button"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && conversations.length === 0 && (
        <div className="people-empty-state">
          <MessageCircle aria-hidden="true" />
          <h3>No conversations yet</h3>
          <p>Find someone from the community and start a conversation.</p>
          <a href="#people-heading" className="recent-chats-empty-link">
            Browse people
          </a>
        </div>
      )}

      {conversations.length > 0 && (
        <ul className="recent-chats-list">
          {conversations.map((conversation) => {
            const { participant, lastMessage } = conversation;
            const messageTime = formatMessageTime(lastMessage.createdAt);
            const preview = `${
              lastMessage.senderId === currentUser?.id ? "You: " : ""
            }${lastMessage.content}`;

            return (
              <li key={conversation.id} className="recent-chats-item">
                <Link
                  to={`/users/${encodeURIComponent(participant.id)}`}
                  aria-label={`Open chat with ${participant.username}`}
                  className="recent-chat-link"
                >
                  {participant.avatarUrl ? (
                    <img
                      src={participant.avatarUrl}
                      alt=""
                      className="people-user-avatar"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="people-user-avatar people-user-avatar-fallback"
                    >
                      <UserRound />
                    </span>
                  )}
                  <span className="recent-chat-details">
                    <span className="recent-chat-name">{participant.username}</span>
                    <span className="recent-chat-preview" title={preview}>
                      {preview}
                    </span>
                  </span>
                  {onlineUserIds.has(participant.id) && (
                    <span
                      aria-label="Online"
                      className="recent-chat-online-dot"
                    />
                  )}
                  {messageTime && (
                    <time
                      dateTime={lastMessage.createdAt}
                      className="recent-chat-time"
                    >
                      {messageTime}
                    </time>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
