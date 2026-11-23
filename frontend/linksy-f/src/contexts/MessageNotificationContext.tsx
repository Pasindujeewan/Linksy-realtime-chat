import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import MessageNotification from "../features/chat/components/MessageNotification";
import {
  parseIncomingMessageNotification,
  type IncomingMessageNotification,
} from "../features/chat/types";
import { useChatSocket } from "./ChatSocketContext";

interface MessageNotificationContextValue {
  setActiveConversationId: (conversationId: string | null) => void;
}

const MessageNotificationContext =
  createContext<MessageNotificationContextValue | null>(null);
const MAX_VISIBLE_NOTIFICATIONS = 3;

export function MessageNotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { socket } = useChatSocket();
  const [notifications, setNotifications] = useState<
    IncomingMessageNotification[]
  >([]);
  const activeConversationId = useRef<string | null>(null);

  const dismiss = useCallback((messageId: string) => {
    setNotifications((current) =>
      current.filter((notification) => notification.messageId !== messageId),
    );
  }, []);

  const setActiveConversationId = useCallback(
    (conversationId: string | null) => {
      activeConversationId.current = conversationId;
    },
    [],
  );

  useEffect(() => {
    if (!socket) {
      activeConversationId.current = null;
      setNotifications([]);
      return;
    }

    function handleNotification(payload: unknown) {
      const notification = parseIncomingMessageNotification(payload);
      if (
        !notification ||
        activeConversationId.current === notification.conversationId
      ) {
        return;
      }

      setNotifications((current) => {
        if (
          current.some(
            (existing) => existing.messageId === notification.messageId,
          )
        ) {
          return current;
        }

        return [...current, notification].slice(-MAX_VISIBLE_NOTIFICATIONS);
      });
    }

    socket.on("notification:new", handleNotification);
    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, [socket]);

  return (
    <MessageNotificationContext.Provider value={{ setActiveConversationId }}>
      {children}
      <div
        className="message-notification-container"
        role="region"
        aria-label="Message notifications"
        aria-live="polite"
      >
        {notifications.map((notification) => (
          <MessageNotification
            key={notification.messageId}
            notification={notification}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </MessageNotificationContext.Provider>
  );
}

export function useMessageNotifications() {
  const context = useContext(MessageNotificationContext);
  if (!context) {
    throw new Error(
      "useMessageNotifications must be used within a MessageNotificationProvider.",
    );
  }
  return context;
}
