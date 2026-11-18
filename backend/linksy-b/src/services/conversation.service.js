import Conversation from "../models/conversation.model.js";
import Message from "../models/meassage.model.js";
import { AppError } from "../errors/AppError.js";
import { generateParticipantKey } from "../utils/participantKey.js";

export const createOrGetConversation = async (userId, receiverId) => {
  const participantKey = generateParticipantKey(userId, receiverId);

  try {
    return await Conversation.findOneAndUpdate(
      { participantKey },
      {
        $setOnInsert: {
          participants: [userId, receiverId],
          participantKey,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );
  } catch (error) {
    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      return Conversation.findOne({ participantKey });
    }

    throw error;
  }
};

export const getConversationMessages = async (
  conversationId,
  userId,
  { limit = 50, before } = {},
) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  })
    .select("_id")
    .lean();

  if (!conversation) {
    throw new AppError(
      "Conversation not found or access denied",
      404,
      "CONVERSATION_NOT_FOUND",
    );
  }

  const messageQuery = { conversationId };
  if (before) {
    messageQuery.$or = [
      { createdAt: { $lt: before.createdAt } },
      { createdAt: before.createdAt, _id: { $lt: before.id } },
    ];
  }

  const results = await Message.find(messageQuery)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .populate("senderId", "username")
    .lean();

  const hasMore = results.length > limit;
  const messages = results.slice(0, limit).reverse();
  const oldestMessage = messages[0];

  return {
    messages,
    hasMore,
    nextCursor:
      hasMore && oldestMessage
        ? {
            createdAt: oldestMessage.createdAt.toISOString(),
            id: oldestMessage._id.toString(),
          }
        : null,
  };
};
