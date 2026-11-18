import Conversation from "../models/conversation.model.js";
import { generateParticipantKey } from "../utils/participantKey.js";

// this function creates a new conversation or retrieves an existing one based on the participant key.
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
