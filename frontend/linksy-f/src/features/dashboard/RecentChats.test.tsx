import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getRecentConversations } from "../chat/services/chatApi";
import RecentChats from "./RecentChats";

vi.mock("../chat/services/chatApi", () => ({
  getRecentConversations: vi.fn(),
}));

vi.mock("../../contexts/ChatSocketContext", () => ({
  useChatSocket: () => ({
    socket: null,
    onlineUserIds: new Set<string>(),
  }),
}));

vi.mock("../../contexts/UserContext", () => ({
  useUser: () => ({
    user: { id: "current-user", username: "current" },
  }),
}));

const mockedGetRecentConversations = vi.mocked(getRecentConversations);

describe("RecentChats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows chats in backend order with the latest message preview", async () => {
    mockedGetRecentConversations.mockResolvedValue([
      {
        id: "conversation-1",
        participant: {
          id: "user-1",
          username: "alex",
          avatarUrl: null,
        },
        lastMessage: {
          content: "See you soon",
          senderId: "current-user",
          createdAt: "2026-11-24T10:00:00.000Z",
        },
        updatedAt: "2026-11-24T10:00:00.000Z",
      },
      {
        id: "conversation-2",
        participant: {
          id: "user-2",
          username: "jordan",
          avatarUrl: null,
        },
        lastMessage: {
          content: "Hello",
          senderId: "user-2",
          createdAt: "2026-11-23T10:00:00.000Z",
        },
        updatedAt: "2026-11-23T10:00:00.000Z",
      },
    ]);

    render(
      <MemoryRouter>
        <RecentChats />
      </MemoryRouter>,
    );

    const firstChat = await screen.findByRole("link", {
      name: "Open chat with alex",
    });
    const secondChat = screen.getByRole("link", {
      name: "Open chat with jordan",
    });

    const chatLinks = screen.getAllByRole("link", { name: /Open chat with/ });
    expect(chatLinks[0]).toBe(firstChat);
    expect(chatLinks[1]).toBe(secondChat);
    expect(within(firstChat).getByText("You: See you soon")).toBeInTheDocument();
    expect(within(secondChat).getByText("Hello")).toBeInTheDocument();
  });
});
