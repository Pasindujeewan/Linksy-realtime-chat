import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";
import { env } from "../config/env.js";
import { parseCookie } from "cookie";
import { getValue } from "../utils/redisUtils.js";
import { getAccessTokenBlacklistKey } from "../utils/token.js";

export const authenticateSocketToken = async (socket, next) => {
  const cookies = parseCookie(socket.handshake.headers.cookie || "");
  const token = cookies.accessToken;

  if (!token) {
    return next(new AppError("Access token is required", 401, "UNAUTHORIZED"));
  }

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch {
    return next(new AppError("Invalid access token", 401, "UNAUTHORIZED"));
  }

  if (typeof payload === "string" || !payload.sub) {
    return next(new AppError("Invalid access token", 401, "UNAUTHORIZED"));
  }

  const accessTokenBlacklistKey = getAccessTokenBlacklistKey(token);
  try {
    if (await getValue(accessTokenBlacklistKey)) {
      return next(
        new AppError("Access token has been revoked", 401, "TOKEN_REVOKED"),
      );
    }
  } catch (error) {
    return next(error);
  }

  socket.userId = payload.sub;
  socket.data.accessTokenBlacklistKey = accessTokenBlacklistKey;
  return next();
};
