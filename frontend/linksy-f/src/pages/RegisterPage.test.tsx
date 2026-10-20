import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterPage from "./RegisterPage";

vi.mock("../services/authService", () => ({
  registerUser: vi.fn(),
}));

import { registerUser } from "../services/authService";

const mockedRegisterUser = vi.mocked(registerUser);

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Username"), "  alex_morgan  ");
  await user.type(screen.getByLabelText("Email address"), " alex@example.com ");
  await user.type(screen.getByLabelText("Password", { selector: "input" }), "securepass123");
  await user.type(screen.getByLabelText("Confirm password"), "securepass123");
  await user.type(
    screen.getByLabelText(/Profile image URL/),
    "https://example.com/avatar.png",
  );
  await user.type(screen.getByLabelText(/A little about you/), "Hello there");
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRegisterUser.mockResolvedValue({
      id: "user-1",
      username: "alex_morgan",
      email: "alex@example.com",
      avatarUrl: "https://example.com/avatar.png",
      bio: "Hello there",
    });
  });

  it("shows validation errors and does not submit invalid data", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText("Use 3–20 letters, numbers, or underscores.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(mockedRegisterUser).not.toHaveBeenCalled();
  });

  it("submits normalized registration fields without the confirmation password", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(mockedRegisterUser).toHaveBeenCalledWith({
      username: "alex_morgan",
      email: "alex@example.com",
      password: "securepass123",
      avatarUrl: "https://example.com/avatar.png",
      bio: "Hello there",
    }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Welcome to Linksy, alex_morgan! Your account is ready.",
    );
    expect(screen.queryByLabelText("Confirm password")).toHaveValue("");
  });

  it("shows the API error when registration fails", async () => {
    mockedRegisterUser.mockRejectedValue(new Error("Email is already registered"));
    const user = userEvent.setup();
    render(<RegisterPage />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email is already registered",
    );
  });
});
