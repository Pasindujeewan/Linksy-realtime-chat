import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ToastProvider, useToast } from "./ToastContext";

function ToastActions() {
  const toast = useToast();

  return (
    <div>
      <button onClick={() => toast.success("Saved successfully")}>
        Show success
      </button>
      <button onClick={() => toast.warning("Check your details")}>
        Show warning
      </button>
      <button onClick={() => toast.error("Could not save")}>
        Show error
      </button>
    </div>
  );
}

describe("ToastContext", () => {
  it("shows and dismisses global success, warning, and error notifications", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastActions />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Show success" }));
    await user.click(screen.getByRole("button", { name: "Show warning" }));
    await user.click(screen.getByRole("button", { name: "Show error" }));

    expect(screen.getByRole("status")).toHaveTextContent("Saved successfully");
    const alerts = screen.getAllByRole("alert");
    expect(alerts[0]).toHaveTextContent("Check your details");
    expect(alerts[1]).toHaveTextContent("Could not save");

    const dismissButtons = screen.getAllByRole("button", {
      name: "Dismiss notification",
    });
    await user.click(dismissButtons[0]);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
