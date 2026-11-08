import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { ToastProvider } from "../../contexts/ToastContext";
import { UserProvider } from "../../contexts/UserContext";
import DashboardPage from "../dashboard/DashboardPage";
import { getUserProfile } from "../../services/authService";
import ProfilePage from "./ProfilePage";

vi.mock("../../services/authService", () => ({
  getUserProfile: vi.fn(),
  logoutUser: vi.fn(),
}));

const mockedGetUserProfile = vi.mocked(getUserProfile);

describe("profile navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.setItem(
      "linksy.sessionUser",
      JSON.stringify({ id: "user-1", username: "alex_morgan" }),
    );
    mockedGetUserProfile.mockResolvedValue({
      id: "user-1",
      username: "alex_morgan",
      email: "alex@example.com",
      avatarUrl: "https://cdn.example.com/avatar.png",
      bio: "Hello there",
    });
  });

  it("opens the loaded user profile when the dashboard avatar is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <UserProvider>
          <MemoryRouter initialEntries={["/dashboard"]}>
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </MemoryRouter>
        </UserProvider>
      </ToastProvider>,
    );

    await user.click(screen.getByRole("link", { name: "View your profile" }));

    expect(await screen.findByText("alex@example.com")).toBeInTheDocument();
    expect(screen.getByText("Hello there")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "alex_morgan's profile" })).toHaveAttribute(
      "src",
      "https://cdn.example.com/avatar.png",
    );
    expect(mockedGetUserProfile).toHaveBeenCalledWith("user-1");
  });
});
