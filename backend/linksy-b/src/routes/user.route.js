import { Router } from "express";
import {
  getOtherUserProfile,
  getOtherUserProfiles,
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controller.js";
import { authenticateAccessToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/others", authenticateAccessToken, getOtherUserProfiles);
router.get("/:userId", authenticateAccessToken, getOtherUserProfile);
router.get("/me/:userId", authenticateAccessToken, getUserProfile);
router.patch("/me/:userId", authenticateAccessToken, updateUserProfile);

export default router;
