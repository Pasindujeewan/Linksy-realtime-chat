import type { ApiResponse } from "../../../types/auth";
import {
  parseConversationMessage,
  parseRecentConversation,
  type ConversationHistoryPage,
  type ConversationMessage,
  type MessageCursor,
  type RecentConversation,
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

export async function getRecentConversations(): Promise<RecentConversation[]> {
  const response = await fetch(`${apiUrl}/api/conversations`, {
    credentials: "include",
  });
  const result = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok || !result.success || !Array.isArray(result.data)) {
    throw new Error(result.message || "We couldn't load your recent chats.");
  }

  const conversations = result.data.map(parseRecentConversation);
  if (conversations.some((conversation) => conversation === null)) {
    throw new Error("The recent chats response is invalid.");
  }

  return conversations.filter(
    (conversation): conversation is RecentConversation => conversation !== null,
  );
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

export async function deleteConversation(conversationId: string): Promise<void> {
  const response = await fetch(
    `${apiUrl}/api/conversations/${encodeURIComponent(conversationId)}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  const result = (await response.json()) as ApiResponse<null>;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "We couldn't clear this chat.");
  }
}
