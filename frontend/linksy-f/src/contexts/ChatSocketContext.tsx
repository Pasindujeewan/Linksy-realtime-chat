import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import { useUser } from "./UserContext";
import { createChatSocket } from "../features/chat/services/chatSocket";

interface ChatSocketContextValue {
  socket: Socket | null;
  connectionError: string | null;
  onlineUserIds: ReadonlySet<string>;
}

const ChatSocketContext = createContext<ChatSocketContextValue | null>(null);

export function ChatSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    if (!user?.id) {
      setSocket(null);
      setConnectionError(null);
      setOnlineUserIds(new Set());
      return;
    }

    const chatSocket = createChatSocket();
    const handleConnect = () => setConnectionError(null);
    const handleConnectError = (error: Error) => {
      setConnectionError(error.message || "We couldn't connect to the chat.");
    };
    const handleDisconnect = () => setOnlineUserIds(new Set());
    const handlePresenceSnapshot = (payload: unknown) => {
      if (!Array.isArray(payload)) return;
      setOnlineUserIds(
        new Set(
          payload.filter(
            (userId): userId is string =>
              typeof userId === "string" && userId.length > 0,
          ),
        ),
      );
    };
    const handlePresenceUpdate = (payload: unknown) => {
      if (
        typeof payload !== "object" ||
        payload === null ||
        !("userId" in payload) ||
        typeof payload.userId !== "string" ||
        !payload.userId ||
        !("isOnline" in payload) ||
        typeof payload.isOnline !== "boolean"
      ) {
        return;
      }

      const { userId, isOnline } = payload;
      setOnlineUserIds((currentIds) => {
        const nextIds = new Set(currentIds);
        if (isOnline) nextIds.add(userId);
        else nextIds.delete(userId);
        return nextIds;
      });
    };

    chatSocket.on("connect", handleConnect);
    chatSocket.on("connect_error", handleConnectError);
    chatSocket.on("disconnect", handleDisconnect);
    chatSocket.on("presence:snapshot", handlePresenceSnapshot);
    chatSocket.on("presence:update", handlePresenceUpdate);
    setSocket(chatSocket);
    chatSocket.connect();

    return () => {
      chatSocket.off("connect", handleConnect);
      chatSocket.off("connect_error", handleConnectError);
      chatSocket.off("disconnect", handleDisconnect);
      chatSocket.off("presence:snapshot", handlePresenceSnapshot);
      chatSocket.off("presence:update", handlePresenceUpdate);
      chatSocket.disconnect();
    };
  }, [user?.id]);

  return (
    <ChatSocketContext.Provider
      value={{ socket, connectionError, onlineUserIds }}
    >
      {children}
    </ChatSocketContext.Provider>
  );
}

export function useChatSocket() {
  const context = useContext(ChatSocketContext);
  if (!context) {
    throw new Error("useChatSocket must be used within a ChatSocketProvider.");
  }
  return context;
}
