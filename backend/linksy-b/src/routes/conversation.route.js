import { Router } from "express";
import { getConversationMessages } from "../controllers/conversation.controller.js";
import { authenticateAccessToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/:conversationId/messages",
  authenticateAccessToken,
  getConversationMessages,
);

export default router;
