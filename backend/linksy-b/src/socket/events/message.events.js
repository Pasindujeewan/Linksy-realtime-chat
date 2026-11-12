import Conversation from "../../models/conversation.model.js";
import Message from "../../models/message.model.js";

export const registerMessageEvents = (io, socket) => {
  // Join a conversation room.
  socket.on("conversation:join", async (conversationId, callback) => {
    try {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.userId,
      });

      if (!conversation) {
        return callback?.({
          success: false,
          message: "Conversation not found or access denied",
        });
      }

      socket.join(`conversation:${conversationId}`);

      callback?.({ success: true });
    } catch (error) {
      callback?.({
        success: false,
        message: "Failed to join conversation",
      });
    }
  });

  // Send a message.
  socket.on("message:send", async (data, callback) => {
    try {
      const { conversationId, content } = data;

      if (
        !conversationId ||
        typeof content !== "string" ||
        !content.trim() ||
        content.length > 5000
      ) {
        return callback?.({
          success: false,
          message: "Invalid message data",
        });
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.userId,
      });

      if (!conversation) {
        return callback?.({
          success: false,
          message: "Conversation not found or access denied",
        });
      }

      const message = await Message.create({
        conversationId,
        senderId: socket.userId,
        content: content.trim(),
        messageType: "text",
        readBy: [socket.userId],
      });

      // Update the conversation's latest message.
      conversation.lastMessage = message._id;
      await conversation.save();

      const populatedMessage = await Message.findById(message._id).populate(
        "senderId",
        "username avatarUrl",
      );

      // Send to everyone in the conversation room.
      io.to(`conversation:${conversationId}`).emit(
        "message:new",
        populatedMessage,
      );

      callback?.({
        success: true,
        message: populatedMessage,
      });
    } catch (error) {
      console.error("Message sending error:", error);

      callback?.({
        success: false,
        message: "Failed to send message",
      });
    }
  });
};
