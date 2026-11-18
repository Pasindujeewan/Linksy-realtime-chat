import { io, type Socket } from "socket.io-client";
import { parseConversationMessage, type ConversationMessage } from "../types";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function createChatSocket(): Socket {
  return io(new URL(apiUrl).origin, {
    autoConnect: false,
    withCredentials: true,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function emitWithAcknowledgement(
  socket: Socket,
  event: string,
  payload: Record<string, string>,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    socket.timeout(10_000).emit(
      event,
      payload,
      (timeoutError: Error | null, response: unknown) => {
        if (timeoutError) {
          reject(new Error("The chat server did not respond. Please try again."));
          return;
        }

        if (!isRecord(response)) {
          reject(new Error("The chat server returned an invalid response."));
          return;
        }

        if (response.success !== true) {
          reject(
            new Error(
              typeof response.message === "string"
                ? response.message
                : "The chat request could not be completed.",
            ),
          );
          return;
        }

        resolve(response);
      },
    );
  });
}

function readConversationId(value: unknown): string | null {
  if (!isRecord(value)) return null;
  if (typeof value._id === "string") return value._id;
  if (typeof value.id === "string") return value.id;
  return null;
}

export async function joinConversation(
  socket: Socket,
  recipientId: string,
): Promise<string> {
  const response = await emitWithAcknowledgement(socket, "conversation:join", {
    recipientId,
  });
  const conversationId = readConversationId(response.conversation);

  if (!conversationId) {
    throw new Error("The chat server did not return a conversation.");
  }

  return conversationId;
}

export async function sendConversationMessage(
  socket: Socket,
  conversationId: string,
  content: string,
): Promise<ConversationMessage> {
  const response = await emitWithAcknowledgement(socket, "message:send", {
    conversationId,
    content,
  });
  const message = parseConversationMessage(response.message);

  if (!message) {
    throw new Error("The chat server returned an invalid message.");
  }

  return message;
}
