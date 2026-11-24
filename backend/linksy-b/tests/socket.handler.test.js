import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/socket/events/message.events.js", () => ({
  registerMessageEvents: vi.fn(),
}));
vi.mock("../src/socket/events/read.events.js", () => ({
  registerReadEvents: vi.fn(),
}));
vi.mock("../src/socket/events/presence.events.js", () => ({
  registerPresenceEvents: vi.fn(),
}));

import { initializeSocketHandlers } from "../src/socket/socket.handler.js";

describe("initializeSocketHandlers", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("disconnects a socket when its access token expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    let handleConnection;
    const io = {
      on: vi.fn((event, handler) => {
        if (event === "connection") handleConnection = handler;
      }),
    };
    const socket = {
      id: "socket-1",
      userId: "user-1",
      data: {
        accessTokenBlacklistKey: "token-key",
        accessTokenExpiresAt: Date.now() + 1_000,
      },
      disconnect: vi.fn(),
      join: vi.fn(),
      once: vi.fn(),
      on: vi.fn(),
      use: vi.fn(),
    };

    initializeSocketHandlers(io);
    handleConnection(socket);

    vi.advanceTimersByTime(999);
    expect(socket.disconnect).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(socket.disconnect).toHaveBeenCalledWith(true);
  });
});
