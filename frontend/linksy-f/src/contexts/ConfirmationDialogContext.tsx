import { X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import "./ConfirmationDialogContext.css";

interface ConfirmationDialog {
  message: string;
  onConfirm: () => void;
}

interface ConfirmationDialogContextValue {
  showConfirmation: (message: string, onConfirm: () => void) => void;
}

const ConfirmationDialogContext =
  createContext<ConfirmationDialogContextValue | null>(null);

export function ConfirmationDialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [dialog, setDialog] = useState<ConfirmationDialog | null>(null);

  const showConfirmation = useCallback(
    (message: string, onConfirm: () => void) => {
      setDialog({ message, onConfirm });
    },
    [],
  );

  const closeDialog = useCallback(() => {
    setDialog(null);
  }, []);

  const confirmAction = useCallback(() => {
    const onConfirm = dialog?.onConfirm;
    setDialog(null);
    onConfirm?.();
  }, [dialog]);

  const value = useMemo(
    () => ({ showConfirmation }),
    [showConfirmation],
  );

  return (
    <ConfirmationDialogContext.Provider value={value}>
      {children}
      {dialog && (
        <div
          className="confirmation-dialog-backdrop"
          onClick={closeDialog}
        >
          <section
            aria-labelledby="confirmation-dialog-title"
            aria-modal="true"
            className="confirmation-dialog"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              type="button"
              aria-label="Close confirmation dialog"
              className="confirmation-dialog-close"
              onClick={closeDialog}
            >
              <X aria-hidden="true" />
            </button>
            <h2 id="confirmation-dialog-title">Please confirm</h2>
            <p>{dialog.message}</p>
            <div className="confirmation-dialog-actions">
              <button
                type="button"
                className="confirmation-dialog-cancel"
                onClick={closeDialog}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirmation-dialog-confirm"
                onClick={confirmAction}
              >
                Yes
              </button>
            </div>
          </section>
        </div>
      )}
    </ConfirmationDialogContext.Provider>
  );
}

export function useConfirmationDialog() {
  const context = useContext(ConfirmationDialogContext);
  if (!context) {
    throw new Error(
      "useConfirmationDialog must be used within a ConfirmationDialogProvider.",
    );
  }
  return context;
}
