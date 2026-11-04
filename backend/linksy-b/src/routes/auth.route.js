import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/auth.controller.js";
import {
  loginLimiter,
  registerLimiter,
} from "../middleware/authRateLimiters.js";

const router = Router();

router.post("/register", registerLimiter, registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/logout", logoutUser);

export default router;
