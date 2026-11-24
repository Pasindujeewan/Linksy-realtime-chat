export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername?: string;
  content: string;
  createdAt?: string;
  readBy?: string[];
}

export interface IncomingMessageNotification {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  preview: string;
  createdAt?: string;
}

export interface MessageCursor {
  createdAt: string;
  id: string;
}

export interface ConversationHistoryPage {
  messages: ConversationMessage[];
  hasMore: boolean;
  nextCursor: MessageCursor | null;
}

export interface RecentConversation {
  id: string;
  participant: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: string;
  };
  updatedAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readIdentifier(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) return value;
  if (!isRecord(value)) return null;

  if (typeof value.id === "string" && value.id.length > 0) return value.id;
  if (typeof value._id === "string" && value._id.length > 0) return value._id;
  return null;
}

export function parseRecentConversation(
  value: unknown,
): RecentConversation | null {
  if (!isRecord(value) || !isRecord(value.participant)) return null;
  if (!isRecord(value.lastMessage)) return null;

  const id = readIdentifier(value.id);
  const participantId = readIdentifier(value.participant.id);
  const senderId = readIdentifier(value.lastMessage.senderId);
  if (
    !id ||
    !participantId ||
    typeof value.participant.username !== "string" ||
    (value.participant.avatarUrl !== null &&
      typeof value.participant.avatarUrl !== "string") ||
    !senderId ||
    typeof value.lastMessage.content !== "string" ||
    typeof value.lastMessage.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    id,
    participant: {
      id: participantId,
      username: value.participant.username,
      avatarUrl: value.participant.avatarUrl,
    },
    lastMessage: {
      content: value.lastMessage.content,
      senderId,
      createdAt: value.lastMessage.createdAt,
    },
    updatedAt: value.updatedAt,
  };
}

export function parseIncomingMessageNotification(
  value: unknown,
): IncomingMessageNotification | null {
  if (!isRecord(value)) return null;

  const { messageId, conversationId, senderId, senderUsername, preview } =
    value;
  if (
    typeof messageId !== "string" ||
    !messageId ||
    typeof conversationId !== "string" ||
    !conversationId ||
    typeof senderId !== "string" ||
    !senderId ||
    typeof senderUsername !== "string" ||
    !senderUsername ||
    typeof preview !== "string"
  ) {
    return null;
  }

  return {
    messageId,
    conversationId,
    senderId,
    senderUsername,
    preview,
    createdAt:
      typeof value.createdAt === "string" ? value.createdAt : undefined,
  };
}

export function parseConversationMessage(
  value: unknown,
): ConversationMessage | null {
  if (!isRecord(value)) return null;

  const id = readIdentifier(value._id ?? value.id);
  const conversationId = readIdentifier(value.conversationId);
  const senderId = readIdentifier(value.senderId);
  if (
    !id ||
    !conversationId ||
    !senderId ||
    typeof value.content !== "string"
  ) {
    return null;
  }

  const senderUsername =
    isRecord(value.senderId) && typeof value.senderId.username === "string"
      ? value.senderId.username
      : undefined;
  const readBy = Array.isArray(value.readBy)
    ? value.readBy
        .map(readIdentifier)
        .filter((userId): userId is string => userId !== null)
    : undefined;

  return {
    id,
    conversationId,
    senderId,
    senderUsername,
    content: value.content,
    createdAt:
      typeof value.createdAt === "string" ? value.createdAt : undefined,
    readBy,
  };
}
