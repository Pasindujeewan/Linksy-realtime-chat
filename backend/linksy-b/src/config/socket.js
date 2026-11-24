import { Server } from "socket.io";
import { authenticateSocketToken } from "../socket/socket.auth.js";
import { initializeSocketHandlers } from "../socket/socket.handler.js";

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  io.use(authenticateSocketToken);
  initializeSocketHandlers(io);

  return io;
};
