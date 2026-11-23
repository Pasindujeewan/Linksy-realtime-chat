import { MessageCircle, X } from "lucide-react";
import { useEffect } from "react";
import type { IncomingMessageNotification } from "../types";
import "./MessageNotification.css";

interface MessageNotificationProps {
  notification: IncomingMessageNotification;
  onDismiss: (messageId: string) => void;
}

const NOTIFICATION_DURATION = 6000;

export default function MessageNotification({
  notification,
  onDismiss,
}: MessageNotificationProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => onDismiss(notification.messageId),
      NOTIFICATION_DURATION,
    );
    return () => window.clearTimeout(timeoutId);
  }, [notification.messageId, onDismiss]);

  return (
    <article className="message-notification" role="status" aria-atomic="true">
      <span className="message-notification-icon">
        <MessageCircle aria-hidden="true" />
      </span>
      <div className="message-notification-content">
        <p className="message-notification-title">
          New message from {notification.senderUsername}
        </p>
        <p className="message-notification-preview">{notification.preview}</p>
      </div>
      <button
        type="button"
        className="message-notification-dismiss"
        aria-label="Dismiss message notification"
        onClick={() => onDismiss(notification.messageId)}
      >
        <X aria-hidden="true" />
      </button>
    </article>
  );
}
