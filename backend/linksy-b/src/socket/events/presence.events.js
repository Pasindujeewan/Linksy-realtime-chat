// In-memory user connection tracking.
const onlineUsers = new Map();

export const registerPresenceEvents = (io, socket) => {
  const userId = socket.userId;

  // Get existing connections or create a new Set.
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  const userSockets = onlineUsers.get(userId);

  userSockets.add(socket.id);

  // Notify clients that this user is online.
  if (userSockets.size === 1) {
    io.emit("presence:update", {
      userId,
      isOnline: true,
    });
  }

  // Handle disconnection.
  socket.on("disconnect", () => {
    const connections = onlineUsers.get(userId);

    if (!connections) return;

    connections.delete(socket.id);

    // Mark offline only when all devices disconnect.
    if (connections.size === 0) {
      onlineUsers.delete(userId);

      io.emit("presence:update", {
        userId,
        isOnline: false,
        lastSeen: new Date(),
      });
    }
  });
};
