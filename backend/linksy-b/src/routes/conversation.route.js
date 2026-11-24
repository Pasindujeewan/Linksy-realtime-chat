import { Router } from "express";
import {
  deleteConversation,
  getConversationMessages,
  getUserConversations,
} from "../controllers/conversation.controller.js";
import { authenticateAccessToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticateAccessToken, getUserConversations);
router.get(
  "/:conversationId/messages",
  authenticateAccessToken,
  getConversationMessages,
);
router.delete("/:conversationId", authenticateAccessToken, deleteConversation);

export default router;
