import { useCallback, useEffect, useRef, useState } from "react";
import {
  leaveConversation,
  joinConversation,
  markConversationRead,
  sendConversationMessage,
} from "../services/chatSocket";
import {
  deleteConversation,
  getConversationMessages,
} from "../services/chatApi";
import {
  parseConversationMessage,
  type ConversationMessage,
  type MessageCursor,
} from "../types";
import { useChatSocket } from "../../../contexts/ChatSocketContext";
import { useMessageNotifications } from "../../../contexts/MessageNotificationContext";

type ConnectionStatus = "connecting" | "ready" | "error";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function mergeMessages(
  currentMessages: ConversationMessage[],
  newMessages: ConversationMessage[],
): ConversationMessage[] {
  const messagesById = new Map<string, ConversationMessage>();
  for (const message of currentMessages) {
    messagesById.set(message.id, message);
  }
  for (const message of newMessages) {
    if (!messagesById.has(message.id)) {
      messagesById.set(message.id, message);
    }
  }

  return [...messagesById.values()].sort(
    (left, right) =>
      (left.createdAt ?? "").localeCompare(right.createdAt ?? "") ||
      left.id.localeCompare(right.id),
  );
}

export function useConversation(recipientId: string, currentUserId: string) {
  const { socket, connectionError } = useChatSocket();
  const { setActiveConversationId } = useMessageNotifications();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [messageCursor, setMessageCursor] = useState<MessageCursor | null>(
    null,
  );
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const currentConversationIdRef = useRef<string | null>(null);
  const currentRecipientIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    let activeConversationId: string | null = null;
    currentRecipientIdRef.current = recipientId;
    currentConversationIdRef.current = null;
    setActiveConversationId(null);
    setMessages([]);
    setConversationId(null);
    setConnectionStatus("connecting");
    setError(null);
    setHasMoreMessages(false);
    setMessageCursor(null);
    setIsLoadingOlderMessages(false);

    if (!socket) {
      return () => {
        isCurrent = false;
      };
    }
    const chatSocket = socket;

    function addMessage(payload: unknown) {
      const message = parseConversationMessage(payload);
      console.log("Received new message:", message);
      if (!message || message.conversationId !== activeConversationId) return;

      setMessages((currentMessages) =>
        mergeMessages(currentMessages, [message]),
      );

      if (message.senderId !== currentUserId) {
        void markConversationRead(chatSocket, message.conversationId).catch(
          (readError) =>
            console.error("Failed to mark conversation as read:", readError),
        );
      }
    }

    function handleMessageRead(payload: unknown) {
      if (
        typeof payload !== "object" ||
        payload === null ||
        !("conversationId" in payload) ||
        typeof payload.conversationId !== "string" ||
        payload.conversationId !== activeConversationId ||
        !("userId" in payload) ||
        typeof payload.userId !== "string"
      ) {
        return;
      }

      const readConversationId = payload.conversationId;
      const readerId = payload.userId;
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.conversationId === readConversationId &&
          message.senderId === currentUserId
            ? {
                ...message,
                readBy: [...new Set([...(message.readBy ?? []), readerId])],
              }
            : message,
        ),
      );
    }

    async function joinActiveConversation() {
      if (!chatSocket.connected) return;
      setConnectionStatus("connecting");
      try {
        const joinedConversationId = await joinConversation(
          chatSocket,
          recipientId,
        );
        if (!isCurrent || !chatSocket.connected) {
          if (!isCurrent && chatSocket.connected) {
            void leaveConversation(chatSocket, joinedConversationId).catch(
              (leaveError) =>
                console.error("Failed to leave conversation:", leaveError),
            );
          }
          return;
        }

        activeConversationId = joinedConversationId;
        currentConversationIdRef.current = joinedConversationId;
        setActiveConversationId(joinedConversationId);
        setConversationId(joinedConversationId);
        const history = await getConversationMessages(joinedConversationId);
        if (
          !isCurrent ||
          !chatSocket.connected ||
          activeConversationId !== joinedConversationId
        ) {
          return;
        }

        setMessages((currentMessages) =>
          mergeMessages(currentMessages, history.messages),
        );
        setHasMoreMessages(history.hasMore);
        setMessageCursor(history.nextCursor);
        setConnectionStatus("ready");
        setError(null);
        void markConversationRead(chatSocket, joinedConversationId).catch(
          (readError) =>
            console.error("Failed to mark conversation as read:", readError),
        );
      } catch (joinError) {
        if (!isCurrent) return;
        setConnectionStatus("error");
        setError(
          errorMessage(joinError, "We couldn't join this conversation."),
        );
      }
    }

    function handleConnect() {
      void joinActiveConversation();
    }

    function handleDisconnect() {
      if (!isCurrent) return;
      activeConversationId = null;
      currentConversationIdRef.current = null;
      setActiveConversationId(null);
      setConversationId(null);
      setConnectionStatus("connecting");
    }

    function handleConnectError(connectError: Error) {
      if (!isCurrent) return;
      setConnectionStatus("error");
      setError(connectError.message || "We couldn't connect to the chat.");
    }

    chatSocket.on("connect", handleConnect);
    chatSocket.on("disconnect", handleDisconnect);
    chatSocket.on("connect_error", handleConnectError);
    chatSocket.on("message:new", addMessage);
    chatSocket.on("message:read", handleMessageRead);
    if (chatSocket.connected) {
      void joinActiveConversation();
    }

    return () => {
      isCurrent = false;
      chatSocket.off("connect", handleConnect);
      chatSocket.off("disconnect", handleDisconnect);
      chatSocket.off("connect_error", handleConnectError);
      chatSocket.off("message:new", addMessage);
      chatSocket.off("message:read", handleMessageRead);
      if (
        activeConversationId &&
        currentConversationIdRef.current === activeConversationId &&
        chatSocket.connected
      ) {
        void leaveConversation(chatSocket, activeConversationId).catch(
          (leaveError) =>
            console.error("Failed to leave conversation:", leaveError),
        );
      }
      currentConversationIdRef.current = null;
      setActiveConversationId(null);
      if (currentRecipientIdRef.current === recipientId) {
        currentRecipientIdRef.current = null;
      }
    };
  }, [currentUserId, recipientId, retryCount, setActiveConversationId, socket]);

  useEffect(() => {
    if (socket && !socket.connected && connectionError) {
      setConnectionStatus("error");
      setError(connectionError);
    }
  }, [connectionError, socket]);

  const retry = useCallback(() => {
    setRetryCount((currentCount) => currentCount + 1);
    socket?.connect();
  }, [socket]);

  const loadOlderMessages = useCallback(async () => {
    if (
      !conversationId ||
      !messageCursor ||
      !hasMoreMessages ||
      isLoadingOlderMessages
    ) {
      return;
    }

    setIsLoadingOlderMessages(true);
    try {
      const history = await getConversationMessages(
        conversationId,
        messageCursor,
      );
      if (currentConversationIdRef.current !== conversationId) return;
      setMessages((currentMessages) =>
        mergeMessages(currentMessages, history.messages),
      );
      setHasMoreMessages(history.hasMore);
      setMessageCursor(history.nextCursor);
    } catch (historyError) {
      if (currentConversationIdRef.current === conversationId) {
        setError(
          errorMessage(historyError, "We couldn't load older messages."),
        );
      }
    } finally {
      if (currentConversationIdRef.current === conversationId) {
        setIsLoadingOlderMessages(false);
      }
    }
  }, [conversationId, hasMoreMessages, isLoadingOlderMessages, messageCursor]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!socket?.connected || !conversationId) {
        throw new Error("The conversation is not connected yet.");
      }

      const message = await sendConversationMessage(
        socket,
        conversationId,
        content,
      );
      setMessages((currentMessages) =>
        mergeMessages(currentMessages, [message]),
      );
    },
    [conversationId, socket],
  );

  const clearConversation = useCallback(async () => {
    if (!conversationId) {
      throw new Error("The conversation is not ready to be cleared.");
    }

    if (socket?.connected) {
      await leaveConversation(socket, conversationId);
    }

    try {
      await deleteConversation(conversationId);
    } catch (deleteError) {
      if (socket?.connected && currentRecipientIdRef.current === recipientId) {
        try {
          await joinConversation(socket, recipientId);
        } catch (joinError) {
          console.error(
            "Failed to rejoin conversation after clear error:",
            joinError,
          );
        }
      }
      throw deleteError;
    }

    if (currentRecipientIdRef.current !== recipientId) return;

    if (currentConversationIdRef.current === conversationId) {
      currentConversationIdRef.current = null;
    }
    setMessages([]);
    setHasMoreMessages(false);
    setMessageCursor(null);
    setRetryCount((currentCount) => currentCount + 1);
  }, [conversationId, recipientId, socket]);

  return {
    messages,
    conversationId,
    connectionStatus,
    error,
    retry,
    clearConversation,
    sendMessage,
    hasMoreMessages,
    isLoadingOlderMessages,
    loadOlderMessages,
  };
}
