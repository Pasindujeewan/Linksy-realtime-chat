import { SendHorizontal } from "lucide-react";
import { useState, type FormEvent } from "react";
import "./ConversationChat.css";

interface MessageComposerProps {
  disabled: boolean;
  onSend: (content: string) => Promise<void>;
}

export default function MessageComposer({
  disabled,
  onSend,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent || disabled || isSending) return;

    setIsSending(true);
    setError(null);
    try {
      await onSend(trimmedContent);
      setContent("");
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "We couldn't send your message. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="message-composer">
      {error && (
        <p role="alert" className="message-composer-error">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit} className="message-composer-form">
        <label className="sr-only" htmlFor="conversation-message">
          Type a message
        </label>
        <input
          id="conversation-message"
          type="text"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={5000}
          placeholder={
            disabled ? "Connecting to conversation…" : "Write a message…"
          }
          autoComplete="off"
          disabled={disabled || isSending}
          className="message-composer-input"
        />
        <button
          type="submit"
          disabled={disabled || isSending || !content.trim()}
          aria-label={isSending ? "Sending message" : "Send message"}
          className="message-composer-send"
        >
          <SendHorizontal aria-hidden="true" />
          <span>{isSending ? "Sending…" : "Send"}</span>
        </button>
      </form>
    </div>
  );
}
