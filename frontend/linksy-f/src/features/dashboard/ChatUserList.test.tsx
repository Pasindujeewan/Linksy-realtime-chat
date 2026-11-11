import { fireEvent, render, screen } from "@testing-library/react";
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

const mockedGetOtherUsers = vi.mocked(getOtherUsers);
const mockedSearchUsers = vi.mocked(searchUsers);

describe("ChatUserList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the first page and fetches more profiles on request", async () => {
    mockedGetOtherUsers
      .mockResolvedValueOnce({
        users: [{ id: "user-1", username: "alex", avatarUrl: null }],
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

    render(<ChatUserList />);

    expect(await screen.findByText("alex")).toBeInTheDocument();
    expect(mockedGetOtherUsers).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole("button", { name: "Load more" }));

    expect(await screen.findByText("jordan")).toBeInTheDocument();
    expect(mockedGetOtherUsers).toHaveBeenNthCalledWith(2, 2);
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "" })).toHaveAttribute(
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
      { id: "user-2", username: "alexander", avatarUrl: null },
    ]);

    render(<ChatUserList />);

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search users by username" }),
      { target: { value: "alex" } },
    );

    expect(await screen.findByText("alexander")).toBeInTheDocument();
    expect(mockedSearchUsers).toHaveBeenCalledWith("alex");
  });
});
