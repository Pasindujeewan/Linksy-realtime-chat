import { registerMessageEvents } from "./events/message.events.js";
import { registerReadEvents } from "./events/read.events.js";
import { registerPresenceEvents } from "./events/presence.events.js";

export const initializeSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Personal room for each user.
    socket.join(`user:${socket.userId}`);
    socket.join(`access-token:${socket.data.accessTokenBlacklistKey}`);

    registerMessageEvents(io, socket);
    registerReadEvents(io, socket);
    registerPresenceEvents(io, socket);
  });
};
