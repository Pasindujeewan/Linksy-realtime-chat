import Conversation from "../../models/conversation.model.js";
import Message from "../../models/meassage.model.js";
import { createOrGetConversation } from "../../services/conversation.service.js";

export const registerMessageEvents = (io, socket) => {
  // Join a conversation room.
  socket.on("conversation:join", async (data, callback) => {
    try {
      const { recipientId } = data;

      if (!recipientId) {
        return callback?.({
          success: false,
          message: "Recipient ID is required",
        });
      }

      // Prevent creating a conversation with yourself.
      if (recipientId.toString() === socket.userId.toString()) {
        return callback?.({
          success: false,
          message: "Cannot create a conversation with yourself",
        });
      }

      // Find existing conversation or create a new one.
      const conversation = await createOrGetConversation(
        socket.userId,
        recipientId,
      );

      // Join the conversation room.
      socket.join(`conversation:${conversation._id}`);

      callback?.({
        success: true,
        conversation,
      });
    } catch (error) {
      console.error("Join conversation error:", error);
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
        "username ",
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
