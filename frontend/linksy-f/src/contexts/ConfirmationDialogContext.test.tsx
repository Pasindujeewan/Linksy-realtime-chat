import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  ConfirmationDialogProvider,
  useConfirmationDialog,
} from "./ConfirmationDialogContext";

function ConfirmationActions({ onConfirm }: { onConfirm: () => void }) {
  const { showConfirmation } = useConfirmationDialog();

  return (
    <button
      type="button"
      onClick={() => showConfirmation("Delete this conversation?", onConfirm)}
    >
      Open confirmation
    </button>
  );
}

describe("ConfirmationDialogContext", () => {
  it("runs the action on Yes and closes without running it on Cancel", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ConfirmationDialogProvider>
        <ConfirmationActions onConfirm={onConfirm} />
      </ConfirmationDialogProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Open confirmation" }));
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Delete this conversation?",
    );
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Open confirmation" }));
    await user.click(screen.getByRole("button", { name: "Yes" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
