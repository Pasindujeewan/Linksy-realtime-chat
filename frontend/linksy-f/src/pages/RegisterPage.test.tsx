import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterPage from "./RegisterPage";

vi.mock("../services/authService", () => ({
  registerUser: vi.fn(),
  uploadAvatar: vi.fn(),
}));

import { registerUser, uploadAvatar } from "../services/authService";

const mockedRegisterUser = vi.mocked(registerUser);
const mockedUploadAvatar = vi.mocked(uploadAvatar);

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Username"), "  alex_morgan  ");
  await user.type(screen.getByLabelText("Email address"), " alex@example.com ");
  await user.type(screen.getByLabelText("Password", { selector: "input" }), "securepass123");
  await user.type(screen.getByLabelText("Confirm password"), "securepass123");
  const avatar = new File(["image"], "avatar.png", { type: "image/png" });
  await user.upload(screen.getByLabelText("Profile picture"), avatar);
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
    mockedUploadAvatar.mockResolvedValue("https://cdn.example.com/avatar.png");
  });

  it("shows validation errors and does not submit invalid data", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText("Use 3–20 letters, numbers, or underscores.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(mockedRegisterUser).not.toHaveBeenCalled();
  });

  it("rejects unsupported profile picture formats", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<RegisterPage />);
    const invalidImage = new File(["not an image"], "avatar.svg", {
      type: "image/svg+xml",
    });

    await user.upload(screen.getByLabelText("Profile picture"), invalidImage);

    expect(screen.getByText("Choose a JPG, PNG, WEBP, or GIF image.")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Selected profile picture preview" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /create account/i }));
    expect(mockedUploadAvatar).not.toHaveBeenCalled();
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
      avatarUrl: "https://cdn.example.com/avatar.png",
      bio: "Hello there",
    }));
    expect(mockedUploadAvatar).toHaveBeenCalledWith(
      expect.objectContaining({ name: "avatar.png", type: "image/png" }),
    );
    expect(mockedUploadAvatar.mock.invocationCallOrder[0]).toBeLessThan(
      mockedRegisterUser.mock.invocationCallOrder[0],
    );
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

  it("shows an upload error and does not register when avatar upload fails", async () => {
    mockedUploadAvatar.mockRejectedValue(new Error("Avatar upload failed"));
    const user = userEvent.setup();
    render(<RegisterPage />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Avatar upload failed");
    expect(mockedRegisterUser).not.toHaveBeenCalled();
  });
});
