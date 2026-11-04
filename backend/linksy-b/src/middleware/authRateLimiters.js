import { createRateLimiter } from "./rateLimiter.js";

export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  prefix: "rate-limit:login:",
  message: "Too many login attempts. Try again later.",
});

export const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  prefix: "rate-limit:register:",
  message: "Too many registration attempts. Try again later.",
});

export const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  prefix: "rate-limit:password-reset:",
  message: "Too many password reset attempts. Try again later.",
});
