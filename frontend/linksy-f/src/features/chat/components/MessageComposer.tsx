import { SendHorizontal } from "lucide-react";
import { useState, type FormEvent } from "react";

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
    <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
      {error && (
        <p role="alert" className="mb-2 px-1 text-sm text-rose-600">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
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
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50"
        />
        <button
          type="submit"
          disabled={disabled || isSending || !content.trim()}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SendHorizontal aria-hidden="true" className="h-4 w-4" />
          <span>{isSending ? "Sending…" : "Send"}</span>
        </button>
      </form>
    </div>
  );
}
