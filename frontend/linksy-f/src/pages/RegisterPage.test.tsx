import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { UserProvider } from "../contexts/UserContext";
import DashboardPage from "../features/dashboard/DashboardPage";
import RegisterPage from "./RegisterPage";

vi.mock("../services/authService", () => ({
  getUserProfile: vi.fn(),
  registerUser: vi.fn(),
  uploadProfileImage: vi.fn(),
}));

import {
  getUserProfile,
  registerUser,
  uploadProfileImage,
} from "../services/authService";

const mockedGetUserProfile = vi.mocked(getUserProfile);
const mockedRegisterUser = vi.mocked(registerUser);
const mockedUploadProfileImage = vi.mocked(uploadProfileImage);

function renderRegisterFlow() {
  return render(
    <UserProvider>
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>
    </UserProvider>,
  );
}

async function fillValidForm(
  user: ReturnType<typeof userEvent.setup>,
  waitForUpload = true,
) {
  await user.type(screen.getByLabelText("Username"), "  alex_morgan  ");
  await user.type(screen.getByLabelText("Email address"), " alex@example.com ");
  await user.type(screen.getByLabelText("Password", { selector: "input" }), "securepass123");
  await user.type(screen.getByLabelText("Confirm password"), "securepass123");
  const avatar = new File(["image"], "avatar.png", { type: "image/png" });
  await user.upload(screen.getByLabelText("Profile picture"), avatar);
  if (waitForUpload) await screen.findByText("Profile picture uploaded.");
  await user.type(screen.getByLabelText(/A little about you/), "Hello there");
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    mockedRegisterUser.mockResolvedValue({
      id: "user-1",
      username: "alex_morgan",
    });
    mockedUploadProfileImage.mockResolvedValue("profile-upload-token");
    mockedGetUserProfile.mockResolvedValue({
      id: "user-1",
      username: "alex_morgan",
      email: "alex@example.com",
      avatarUrl: "https://cdn.example.com/avatar.png",
      bio: "Hello there",
    });
  });

  it("shows validation errors and does not submit invalid data", async () => {
    const user = userEvent.setup();
    renderRegisterFlow();

    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText("Use 3–20 letters, numbers, or underscores.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(mockedRegisterUser).not.toHaveBeenCalled();
  });

  it("validates password length and matching confirmation as the user types", async () => {
    const user = userEvent.setup();
    renderRegisterFlow();
    const password = screen.getByLabelText("Password", { selector: "input" });
    const confirmation = screen.getByLabelText("Confirm password", {
      selector: "input",
    });

    await user.type(password, "short");
    expect(screen.getByText("Password must be between 8 and 128 characters.")).toBeInTheDocument();

    await user.clear(password);
    await user.type(password, "securepass123");
    await user.type(confirmation, "different");
    expect(screen.getByText("Passwords don't match.")).toBeInTheDocument();

    await user.clear(confirmation);
    await user.type(confirmation, "securepass123");
    expect(screen.queryByText("Passwords don't match.")).not.toBeInTheDocument();
  });

  it("toggles password visibility independently for both password fields", async () => {
    const user = userEvent.setup();
    renderRegisterFlow();
    const password = screen.getByLabelText("Password", { selector: "input" });
    const confirmation = screen.getByLabelText("Confirm password", {
      selector: "input",
    });

    expect(password).toHaveAttribute("type", "password");
    expect(confirmation).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");
    expect(confirmation).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show confirm password" }));
    expect(confirmation).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(password).toHaveAttribute("type", "password");
    expect(confirmation).toHaveAttribute("type", "text");
  });

  it("rejects unsupported profile picture formats", async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderRegisterFlow();
    const invalidImage = new File(["not an image"], "avatar.svg", {
      type: "image/svg+xml",
    });

    await user.upload(screen.getByLabelText("Profile picture"), invalidImage);

    expect(screen.getByText("Choose a JPG, PNG, WEBP, or GIF image.")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Selected profile picture preview" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /create account/i }));
    expect(mockedUploadProfileImage).not.toHaveBeenCalled();
    expect(mockedRegisterUser).not.toHaveBeenCalled();
  });

  it("shows a spinner while the profile picture uploads and a check when complete", async () => {
    let finishUpload!: (url: string) => void;
    mockedUploadProfileImage.mockReturnValue(new Promise((resolve) => {
      finishUpload = resolve;
    }));
    const user = userEvent.setup();
    renderRegisterFlow();

    await user.upload(
      screen.getByLabelText("Profile picture"),
      new File(["image"], "avatar.png", { type: "image/png" }),
    );

    expect(screen.getByRole("img", { name: "Uploading profile picture" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Uploading profile picture…");
    expect(screen.getByRole("button", { name: /uploading profile picture/i })).toBeDisabled();

    finishUpload("https://cdn.example.com/avatar.png");

    expect(await screen.findByRole("img", { name: "Profile picture uploaded" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Profile picture uploaded.");
  });

  it("submits normalized registration fields without the confirmation password", async () => {
    const user = userEvent.setup();
    renderRegisterFlow();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(mockedRegisterUser).toHaveBeenCalledWith({
      username: "alex_morgan",
      email: "alex@example.com",
      password: "securepass123",
      imageToken: "profile-upload-token",
      bio: "Hello there",
    }));
    expect(mockedUploadProfileImage).toHaveBeenCalledWith(
      expect.objectContaining({ name: "avatar.png", type: "image/png" }),
    );
    expect(mockedUploadProfileImage.mock.invocationCallOrder[0]).toBeLessThan(
      mockedRegisterUser.mock.invocationCallOrder[0],
    );
    expect(await screen.findByRole("heading", { name: "Welcome, alex_morgan" })).toBeInTheDocument();
    expect(await screen.findByAltText("alex_morgan's profile")).toHaveAttribute(
      "src",
      "https://cdn.example.com/avatar.png",
    );
  });

  it("shows the API error when registration fails", async () => {
    mockedRegisterUser.mockRejectedValue(new Error("Email is already registered"));
    const user = userEvent.setup();
    renderRegisterFlow();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email is already registered",
    );
  });

  it("shows an upload error and does not register when avatar upload fails", async () => {
    mockedUploadProfileImage.mockRejectedValue(new Error("Avatar upload failed"));
    const user = userEvent.setup();
    renderRegisterFlow();
    await fillValidForm(user, false);

    expect(await screen.findByRole("alert")).toHaveTextContent("Avatar upload failed");
    expect(mockedRegisterUser).not.toHaveBeenCalled();
  });
});
