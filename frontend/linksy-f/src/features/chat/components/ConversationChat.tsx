import { MessageCircle, RotateCw } from "lucide-react";
import MessageComposer from "./MessageComposer";
import { useConversation } from "../hooks/useConversation";

interface ConversationChatProps {
  recipientId: string;
  currentUserId: string;
  recipientName: string;
}

function formatMessageTime(createdAt?: string): string | null {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function ConversationChat({
  recipientId,
  currentUserId,
  recipientName,
}: ConversationChatProps) {
  const { messages, connectionStatus, error, retry, sendMessage } =
    useConversation(recipientId);

  return (
    <div className="flex min-h-[22rem] flex-1 flex-col">
      <div
        aria-live="polite"
        className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6"
      >
        {connectionStatus === "connecting" && messages.length === 0 && (
          <p role="status" className="py-8 text-center text-sm text-slate-500">
            Joining conversation…
          </p>
        )}

        {error && (
          <div className="mx-auto max-w-md rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
            <p role="alert" className="text-sm text-rose-700">
              {error}
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              <RotateCw aria-hidden="true" className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}

        {connectionStatus === "ready" && messages.length === 0 && (
          <div className="grid min-h-48 place-items-center text-center">
            <div>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-indigo-50 text-indigo-600">
                <MessageCircle aria-hidden="true" className="h-6 w-6" />
              </span>
              <p className="mt-4 text-sm font-medium text-slate-700">
                Start a conversation with {recipientName}.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Messages will appear here.
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => {
          const isOwnMessage = message.senderId === currentUserId;
          const messageTime = formatMessageTime(message.createdAt);

          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
            >
              <article
                aria-label={isOwnMessage ? "Your message" : `${recipientName}'s message`}
                className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                  isOwnMessage
                    ? "rounded-br-md bg-indigo-600 text-white"
                    : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                }`}
              >
                <p className="whitespace-pre-wrap break-words text-sm leading-6">
                  {message.content}
                </p>
                {messageTime && (
                  <time
                    dateTime={message.createdAt}
                    className={`mt-1 block text-right text-xs ${
                      isOwnMessage ? "text-indigo-100" : "text-slate-400"
                    }`}
                  >
                    {messageTime}
                  </time>
                )}
              </article>
            </div>
          );
        })}
      </div>

      <MessageComposer
        disabled={connectionStatus !== "ready"}
        onSend={sendMessage}
      />
    </div>
  );
}
