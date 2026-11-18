export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername?: string;
  content: string;
  createdAt?: string;
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

  return {
    id,
    conversationId,
    senderId,
    senderUsername,
    content: value.content,
    createdAt:
      typeof value.createdAt === "string" ? value.createdAt : undefined,
  };
}
