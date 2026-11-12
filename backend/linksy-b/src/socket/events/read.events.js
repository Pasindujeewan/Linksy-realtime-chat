import Conversation from "../../models/conversation.model.js";
import Message from "../../models/message.model.js";

export const registerReadEvents = (io, socket) => {
  socket.on("message:read", async (data, callback) => {
    try {
      const { conversationId } = data;

      if (!conversationId) {
        return callback?.({
          success: false,
          message: "Conversation ID is required",
        });
      }

      // Verify that the user belongs to this conversation.
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

      // Mark messages from other users as read.
      const result = await Message.updateMany(
        {
          conversationId,
          senderId: { $ne: socket.userId },
          readBy: { $ne: socket.userId },
        },
        {
          $addToSet: { readBy: socket.userId },
        },
      );

      // Notify other participants.
      socket.to(`conversation:${conversationId}`).emit("message:read", {
        conversationId,
        userId: socket.userId,
      });

      callback?.({
        success: true,
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error("Read receipt error:", error);

      callback?.({
        success: false,
        message: "Failed to update read status",
      });
    }
  });
};
