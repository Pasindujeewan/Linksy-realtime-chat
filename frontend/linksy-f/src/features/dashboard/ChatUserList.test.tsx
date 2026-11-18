import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getOtherUsers,
  searchUsers,
} from "../../services/authService";
import ChatUserList from "./ChatUserList";

vi.mock("../../services/authService", () => ({
  getOtherUsers: vi.fn(),
  searchUsers: vi.fn(),
}));

vi.mock("../../contexts/ChatSocketContext", () => ({
  useChatSocket: () => ({ onlineUserIds: new Set<string>() }),
}));

vi.mock("../../contexts/UserContext", () => ({
  useUser: () => ({
    user: { id: "current-user", username: "current" },
  }),
}));

const mockedGetOtherUsers = vi.mocked(getOtherUsers);
const mockedSearchUsers = vi.mocked(searchUsers);

describe("ChatUserList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the first page and fetches more profiles on request", async () => {
    mockedGetOtherUsers
      .mockResolvedValueOnce({
        users: [
          { id: "current-user", username: "current", avatarUrl: null },
          { id: "user-1", username: "alex", avatarUrl: null },
        ],
        pagination: {
          page: 1,
          limit: 10,
          hasMore: true,
          nextPage: 2,
        },
      })
      .mockResolvedValueOnce({
        users: [
          {
            id: "current-user",
            username: "current",
            avatarUrl: null,
          },
          {
            id: "user-2",
            username: "jordan",
            avatarUrl: "https://cdn.example.com/jordan.png",
          },
        ],
        pagination: {
          page: 2,
          limit: 10,
          hasMore: false,
          nextPage: null,
        },
      });

    render(
      <MemoryRouter>
        <ChatUserList />
      </MemoryRouter>,
    );

    expect(await screen.findByText("alex")).toBeInTheDocument();
    expect(screen.queryByText("current")).not.toBeInTheDocument();
    expect(mockedGetOtherUsers).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole("button", { name: "Load more" }));

    expect(await screen.findByText("jordan")).toBeInTheDocument();
    expect(screen.queryByText("current")).not.toBeInTheDocument();
    expect(mockedGetOtherUsers).toHaveBeenNthCalledWith(2, 2);
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
    expect(screen.getByRole("presentation")).toHaveAttribute(
      "src",
      "https://cdn.example.com/jordan.png",
    );
  });

  it("searches for users as the username changes", async () => {
    mockedGetOtherUsers.mockResolvedValue({
      users: [],
      pagination: {
        page: 1,
        limit: 10,
        hasMore: false,
        nextPage: null,
      },
    });
    mockedSearchUsers.mockResolvedValue([
      { id: "current-user", username: "current", avatarUrl: null },
      { id: "user-2", username: "alexander", avatarUrl: null },
    ]);

    render(
      <MemoryRouter>
        <ChatUserList />
      </MemoryRouter>,
    );

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search users by username" }),
      { target: { value: "alex" } },
    );

    expect(await screen.findByText("alexander")).toBeInTheDocument();
    expect(screen.queryByText("current")).not.toBeInTheDocument();
    expect(mockedSearchUsers).toHaveBeenCalledWith("alex");
  });
});
