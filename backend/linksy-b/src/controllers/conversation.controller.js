import mongoose from "mongoose";
import { AppError } from "../errors/AppError.js";
import { getConversationMessages as fetchConversationMessages } from "../services/conversation.service.js";
import { successResponse } from "../utils/response.js";

const DEFAULT_MESSAGE_LIMIT = 50;
const MAX_MESSAGE_LIMIT = 100;

export const getConversationMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new AppError(
        "Invalid conversation ID",
        400,
        "INVALID_CONVERSATION_ID",
      );
    }

    const limitValue = req.query.limit ?? String(DEFAULT_MESSAGE_LIMIT);
    if (
      typeof limitValue !== "string" ||
      !/^[1-9]\d*$/.test(limitValue) ||
      Number(limitValue) > MAX_MESSAGE_LIMIT
    ) {
      throw new AppError(
        `Limit must be an integer between 1 and ${MAX_MESSAGE_LIMIT}`,
        400,
        "INVALID_MESSAGE_LIMIT",
      );
    }

    const { beforeCreatedAt, beforeId } = req.query;
    let before;
    if (beforeCreatedAt !== undefined || beforeId !== undefined) {
      if (
        typeof beforeCreatedAt !== "string" ||
        typeof beforeId !== "string" ||
        Number.isNaN(Date.parse(beforeCreatedAt)) ||
        !mongoose.Types.ObjectId.isValid(beforeId)
      ) {
        throw new AppError("Invalid message cursor", 400, "INVALID_CURSOR");
      }

      before = {
        createdAt: new Date(beforeCreatedAt),
        id: new mongoose.Types.ObjectId(beforeId),
      };
    }

    const result = await fetchConversationMessages(
      conversationId,
      req.user.sub,
      { limit: Number(limitValue), before },
    );

    return successResponse(
      res,
      result,
      "Conversation messages retrieved successfully",
    );
  } catch (error) {
    return next(error);
  }
};
