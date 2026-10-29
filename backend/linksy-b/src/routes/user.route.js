import { Router } from "express";
import { getUserProfile } from "../controllers/user.controller.js";
import { authenticateAccessToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/me/:userId", authenticateAccessToken, getUserProfile);

export default router;
