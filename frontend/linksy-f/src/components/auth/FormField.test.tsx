import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FormField from "./FormField";

describe("FormField", () => {
  it("connects its label to the input and supports typing", async () => {
    const user = userEvent.setup();
    render(<FormField label="Email address" name="email" type="email" />);

    const input = screen.getByRole("textbox", { name: "Email address" });
    await user.type(input, "user@example.com");

    expect(input).toHaveValue("user@example.com");
  });

  it("announces a field error accessibly", () => {
    render(
      <FormField
        label="Username"
        name="username"
        error="Username is required"
      />,
    );

    const input = screen.getByRole("textbox", { name: "Username" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Username is required");
    expect(screen.getByText("Username is required")).toBeInTheDocument();
  });

  it("calls the supplied change handler", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FormField label="Username" name="username" onChange={onChange} />);

    await user.type(screen.getByRole("textbox", { name: "Username" }), "sam");

    expect(onChange).toHaveBeenCalled();
  });
});
