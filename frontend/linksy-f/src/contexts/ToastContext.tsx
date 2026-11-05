import {
  CheckCircle2,
  CircleAlert,
  Info,
  X,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastKind = "success" | "warning" | "error";

interface ToastMessage {
  id: number;
  kind: ToastKind;
  message: string;
  duration: number;
}

interface ToastContextValue {
  success: (message: string) => void;
  warning: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const DEFAULT_DURATION = 5000;

const toastStyles: Record<ToastKind, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    if (toast.duration <= 0) return;

    const timeoutId = window.setTimeout(
      () => onDismiss(toast.id),
      toast.duration,
    );
    return () => window.clearTimeout(timeoutId);
  }, [onDismiss, toast.duration, toast.id]);

  const Icon =
    toast.kind === "success"
      ? CheckCircle2
      : toast.kind === "warning"
        ? Info
        : CircleAlert;

  return (
    <div
      role={toast.kind === "success" ? "status" : "alert"}
      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${toastStyles[toast.kind]}`}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm font-medium leading-5">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="grid h-6 w-6 shrink-0 place-items-center rounded-md opacity-70 transition hover:bg-black/5 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
      >
        <X aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((kind: ToastKind, message: string) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const id = ++nextId.current;
    setToasts((current) => [
      ...current,
      { id, kind, message: trimmedMessage, duration: DEFAULT_DURATION },
    ]);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message) => addToast("success", message),
      warning: (message) => addToast("warning", message),
      error: (message) => addToast("error", message),
    }),
    [addToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }
  return context;
}
