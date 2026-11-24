import Conversation from "../models/conversation.model.js";
import Message from "../models/meassage.model.js";
import { AppError } from "../errors/AppError.js";
import { generateParticipantKey } from "../utils/participantKey.js";
import { generateImageUrl } from "../utils/generateImageUrl.js";

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

export const getUserConversations = async (userId) => {
  const conversations = await Conversation.find({
    participants: userId,
    type: "private",
    lastMessage: { $ne: null },
  })
    .sort({ updatedAt: -1, _id: -1 })
    .populate({ path: "participants", select: "username avatarUrl isActive" })
    .populate({
      path: "lastMessage",
      select: "content senderId createdAt",
    })
    .lean();

  const summaries = await Promise.all(
    conversations.map(async (conversation) => {
      const participant = conversation.participants.find(
        (user) =>
          user &&
          user.isActive &&
          user._id.toString() !== userId.toString(),
      );
      const { lastMessage } = conversation;

      if (!participant || !lastMessage) return null;

      return {
        id: conversation._id.toString(),
        participant: {
          id: participant._id.toString(),
          username: participant.username,
          avatarUrl: participant.avatarUrl
            ? await generateImageUrl(participant.avatarUrl)
            : null,
        },
        lastMessage: {
          content: lastMessage.content,
          senderId: lastMessage.senderId.toString(),
          createdAt: lastMessage.createdAt?.toISOString(),
        },
        updatedAt: conversation.updatedAt?.toISOString(),
      };
    }),
  );

  return summaries.filter((summary) => summary !== null);
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

export const deleteConversation = async (conversationId, userId) => {
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

  await Message.deleteMany({ conversationId });
  await Conversation.deleteOne({ _id: conversationId, participants: userId });
};
