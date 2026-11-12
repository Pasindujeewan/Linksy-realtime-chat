import jwt, { JsonWebTokenError } from "jsonwebtoken";
import AppError from "../errors/AppError.js";
import { env } from "../config/env.js";
import { parse } from "cookie";

export const authenticateSocketToken = (socket, next) => {
  try {
    // Extract the token from the socket handshake
    const cookies = parse(socket.handshake.headers.cookie || "");

    const token = cookies.accessToken;

    if (!token) {
      return next(
        new AppError("Access token is required", 401, "UNAUTHORIZED"),
      );
    }
    // Verify the token
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const userId = payload.sub;

    socket.userId = userId;
    next();
  } catch (error) {
    return next(new AppError("Invalid access token", 401, "UNAUTHORIZED"));
  }
};
