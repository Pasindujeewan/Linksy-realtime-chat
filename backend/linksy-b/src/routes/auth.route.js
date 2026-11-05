import { Router } from "express";
import {
  googleAuth,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/auth.controller.js";
import {
  googleAuthLimiter,
  loginLimiter,
  registerLimiter,
} from "../middleware/authRateLimiters.js";

const router = Router();

router.post("/register", registerLimiter, registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/google", googleAuthLimiter, googleAuth);
router.post("/logout", logoutUser);

export default router;
