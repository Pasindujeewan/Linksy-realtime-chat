import type { ApiResponse } from "../../../types/auth";
import {
  parseConversationMessage,
  type ConversationHistoryPage,
  type ConversationMessage,
  type MessageCursor,
} from "../types";

const apiUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

interface BackendConversationHistoryPage {
  messages: unknown[];
  hasMore: boolean;
  nextCursor: MessageCursor | null;
}

export async function getConversationMessages(
  conversationId: string,
  before?: MessageCursor,
): Promise<ConversationHistoryPage> {
  const query = new URLSearchParams({ limit: "50" });
  if (before) {
    query.set("beforeCreatedAt", before.createdAt);
    query.set("beforeId", before.id);
  }

  const response = await fetch(
    `${apiUrl}/api/conversations/${encodeURIComponent(conversationId)}/messages?${query}`,
    { credentials: "include" },
  );
  const result =
    (await response.json()) as ApiResponse<BackendConversationHistoryPage>;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "We couldn't load this conversation.");
  }

  const { messages, hasMore, nextCursor } = result.data;
  if (
    !Array.isArray(messages) ||
    typeof hasMore !== "boolean" ||
    (nextCursor !== null &&
      (typeof nextCursor?.createdAt !== "string" ||
        typeof nextCursor?.id !== "string"))
  ) {
    throw new Error("The conversation response is invalid.");
  }

  const parsedMessages: ConversationMessage[] = [];
  for (const value of messages) {
    const message = parseConversationMessage(value);
    if (!message) {
      throw new Error("The conversation contains an invalid message.");
    }
    parsedMessages.push(message);
  }

  return {
    messages: parsedMessages,
    hasMore,
    nextCursor,
  };
}
