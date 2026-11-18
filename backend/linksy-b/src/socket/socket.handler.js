import { registerMessageEvents } from "./events/message.events.js";
import { registerReadEvents } from "./events/read.events.js";
import { registerPresenceEvents } from "./events/presence.events.js";

// This module initializes socket event handlers and enforces access token expiry for connected sockets. It ensures that each socket connection is authenticated and manages the lifecycle of the socket based on the validity of the access token.
const MAX_TIMEOUT_MS = 2_147_483_647;

const enforceSocketTokenExpiry = (socket) => {
  const expiresAt = socket.data.accessTokenExpiresAt;
  let timeout;

  const disconnectAtExpiry = () => {
    const remainingMs = expiresAt - Date.now();
    if (remainingMs <= 0) {
      socket.disconnect(true);
      return;
    }

    timeout = setTimeout(
      disconnectAtExpiry,
      Math.min(Math.ceil(remainingMs), MAX_TIMEOUT_MS),
    );
  };

  socket.use((packet, next) => {
    if (Date.now() >= expiresAt) {
      socket.disconnect(true);
      return next(new Error("Access token expired"));
    }

    return next();
  });

  socket.once("disconnect", () => clearTimeout(timeout));
  disconnectAtExpiry();
};

export const initializeSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    enforceSocketTokenExpiry(socket);

    // Personal room for each user.
    socket.join(`user:${socket.userId}`);
    socket.join(`access-token:${socket.data.accessTokenBlacklistKey}`);

    registerMessageEvents(io, socket);
    registerReadEvents(io, socket);
    registerPresenceEvents(io, socket);
  });
};
