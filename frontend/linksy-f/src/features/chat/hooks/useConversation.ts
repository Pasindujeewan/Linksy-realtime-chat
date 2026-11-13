import { useCallback, useEffect, useRef, useState } from "react";
import {
  createChatSocket,
  joinConversation,
  sendConversationMessage,
} from "../services/chatSocket";
import {
  parseConversationMessage,
  type ConversationMessage,
} from "../types";

type ConnectionStatus = "connecting" | "ready" | "error";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useConversation(recipientId: string) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const socketRef = useRef<ReturnType<typeof createChatSocket> | null>(null);

  useEffect(() => {
    let isCurrent = true;
    const socket = createChatSocket();
    socketRef.current = socket;
    setMessages([]);
    setConversationId(null);
    setConnectionStatus("connecting");
    setError(null);

    function addMessage(payload: unknown) {
      const message = parseConversationMessage(payload);
      if (!message) return;

      setMessages((currentMessages) =>
        currentMessages.some(({ id }) => id === message.id)
          ? currentMessages
          : [...currentMessages, message],
      );
    }

    async function joinActiveConversation() {
      setConnectionStatus("connecting");
      try {
        const joinedConversationId = await joinConversation(socket, recipientId);
        if (!isCurrent || !socket.connected) return;

        setConversationId(joinedConversationId);
        setConnectionStatus("ready");
        setError(null);
      } catch (joinError) {
        if (!isCurrent) return;
        setConnectionStatus("error");
        setError(errorMessage(joinError, "We couldn't join this conversation."));
      }
    }

    function handleConnect() {
      void joinActiveConversation();
    }

    function handleDisconnect() {
      if (!isCurrent) return;
      setConversationId(null);
      setConnectionStatus("connecting");
    }

    function handleConnectError(connectError: Error) {
      if (!isCurrent) return;
      setConnectionStatus("error");
      setError(connectError.message || "We couldn't connect to the chat.");
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("message:new", addMessage);
    socket.connect();

    return () => {
      isCurrent = false;
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("message:new", addMessage);
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [recipientId, retryCount]);

  const retry = useCallback(() => {
    setRetryCount((currentCount) => currentCount + 1);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const socket = socketRef.current;
      if (!socket?.connected || !conversationId) {
        throw new Error("The conversation is not connected yet.");
      }

      const message = await sendConversationMessage(
        socket,
        conversationId,
        content,
      );
      setMessages((currentMessages) =>
        currentMessages.some(({ id }) => id === message.id)
          ? currentMessages
          : [...currentMessages, message],
      );
    },
    [conversationId],
  );

  return { messages, connectionStatus, error, retry, sendMessage };
}
