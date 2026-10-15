import User from "../models/user.model.js";
import { registerSchema } from "../validators/auth.validator.js";
import { AppError } from "../errors/AppError.js";
import argon2 from "argon2";
import { generateAccessToken } from "../utils/token.js";
import { successResponse } from "../utils/response.js";
import mongoose from "mongoose";

export const registerUser = async (req, res, next) => {
  try {
    const validateResult = registerSchema.safeParse(req.body);

    console.log("Validation Result:", validateResult);
    if (!validateResult.success) {
      const message = validateResult.error.issues
        .map((err) => err.message)
        .join(", ");
      throw new AppError(message, 400, "VALIDATION_FAIELD");
    }
    const { username, email, password, bio, avatarUrl } = validateResult.data;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    }).lean();

    if (existingUser) {
      throw new AppError(
        "User is already registered",
        409,
        "USER_ALREADY_EXSIT",
      );
    }
    const userId = new mongoose.Types.ObjectId();
    const accessToken = generateAccessToken(userId);

    const passwordHash = await argon2.hash(password);

    const user = await User.create({
      _id: userId,
      username,
      email,
      passwordHash,
      bio,
      avatarUrl,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return successResponse(
      res,
      {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
        },
      },
      "User registered successfully",
      201,
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
};
