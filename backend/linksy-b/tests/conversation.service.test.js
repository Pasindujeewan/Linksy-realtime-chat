import { beforeEach, describe, expect, it, vi } from "vitest";

import Conversation from "../src/models/conversation.model.js";
import { getUserConversations } from "../src/services/conversation.service.js";
import { generateImageUrl } from "../src/utils/generateImageUrl.js";

vi.mock("../src/models/conversation.model.js", () => ({
  default: {
    find: vi.fn(),
  },
}));

vi.mock("../src/utils/generateImageUrl.js", () => ({
  generateImageUrl: vi.fn(),
}));

describe("getUserConversations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns private chats with latest message data ordered by activity", async () => {
    const updatedAt = new Date("2026-11-24T10:00:00.000Z");
    const createdAt = new Date("2026-11-24T09:59:00.000Z");
    const query = {
      sort: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        {
          _id: "conversation-1",
          participants: [
            {
              _id: "current-user",
              username: "current",
              isActive: true,
            },
            {
              _id: "other-user",
              username: "alex",
              avatarUrl: "avatar-key",
              isActive: true,
            },
          ],
          lastMessage: {
            content: "See you soon",
            senderId: "current-user",
            createdAt,
          },
          updatedAt,
        },
      ]),
    };
    Conversation.find.mockReturnValue(query);
    generateImageUrl.mockResolvedValue("https://images.example/alex");

    await expect(getUserConversations("current-user")).resolves.toEqual([
      {
        id: "conversation-1",
        participant: {
          id: "other-user",
          username: "alex",
          avatarUrl: "https://images.example/alex",
        },
        lastMessage: {
          content: "See you soon",
          senderId: "current-user",
          createdAt: createdAt.toISOString(),
        },
        updatedAt: updatedAt.toISOString(),
      },
    ]);

    expect(Conversation.find).toHaveBeenCalledWith({
      participants: "current-user",
      type: "private",
      lastMessage: { $ne: null },
    });
    expect(query.sort).toHaveBeenCalledWith({ updatedAt: -1, _id: -1 });
    expect(generateImageUrl).toHaveBeenCalledWith("avatar-key");
  });
});
