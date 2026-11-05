import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../config/redis.js";
import { AppError } from "../errors/AppError.js";

// this function do open connection to redis if it is not open yet, this is to avoid the error of sending command to redis when the connection is closed.
async function ensureRedisConnection() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

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
      sendCommand: async (...args) => {
        await ensureRedisConnection();
        return redisClient.sendCommand(args);
      },
      prefix,
    }),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res, next) => {
      next(new AppError(message, 429, "TOO_MANY_REQUESTS"));
    },
  });
