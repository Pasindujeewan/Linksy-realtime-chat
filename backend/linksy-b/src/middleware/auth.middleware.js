import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { getValue } from "../utils/redisUtils.js";
import { getAccessTokenBlacklistKey } from "../utils/token.js";

export const authenticateAccessToken = async (req, res, next) => {
  const authorization = req.get("authorization");
  const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const accessToken = bearerToken || req.cookies?.accessToken;

  if (!accessToken) {
    return next(new AppError("Access token is required", 401, "UNAUTHORIZED"));
  }

  try {
    const payload = jwt.verify(accessToken, env.JWT_ACCESS_SECRET);
    if (typeof payload === "string" || !payload.sub) {
      throw new AppError("Invalid access token", 401, "INVALID_ACCESS_TOKEN");
    }

    const blacklistedToken = await getValue(
      getAccessTokenBlacklistKey(accessToken),
    );
    if (blacklistedToken) {
      throw new AppError("Access token has been revoked", 401, "TOKEN_REVOKED");
    }

    req.user = payload;
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(
        new AppError(
          "Invalid or expired access token",
          401,
          "INVALID_ACCESS_TOKEN",
        ),
      );
    }

    return next(error);
  }
};
