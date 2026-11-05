import { createHash } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateAccessToken = (userId) => {
  return jwt.sign({ sub: userId.toString() }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
};

// this function hash original token and make redis key
export const getAccessTokenBlacklistKey = (accessToken) => {
  const tokenHash = createHash("sha256").update(accessToken).digest("hex");
  return `blacklisted_access_token:${tokenHash}`;
};
