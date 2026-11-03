import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../config/redis.js";

export const createRateLimiter = ({
  windowMs,
  limit,
  prefix,
  message = "Too many requests. Please try again later.",
}) =>
  rateLimit({
    windowMs,
    limit,
    store: new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix,
    }),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });
