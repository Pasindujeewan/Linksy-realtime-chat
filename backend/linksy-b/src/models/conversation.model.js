import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    type: {
      type: String,
      enum: ["private", "group"],
      default: "private",
    },

    participantKey: {
      type: String,
      unique: true,
      sparse: true,
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Find conversations belonging to a user
conversationSchema.index({
  participants: 1,
  updatedAt: -1,
});

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
