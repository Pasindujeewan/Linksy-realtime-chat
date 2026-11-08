import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controller.js";
import { authenticateAccessToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/me/:userId", authenticateAccessToken, getUserProfile);
router.patch("/me/:userId", authenticateAccessToken, updateUserProfile);

export default router;
