export const generateParticipantKey = (userAId, userBId) => {
  return [userAId.toString(), userBId.toString()].sort().join(":");
};

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
    if (error.code === 11000) {
      return Conversation.findOne({ participantKey });
    }

    throw error;
  }
};
