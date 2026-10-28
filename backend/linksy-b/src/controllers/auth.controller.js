import User from "../models/user.model.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
import { AppError } from "../errors/AppError.js";
import argon2 from "argon2";
import { generateAccessToken } from "../utils/token.js";
import { successResponse } from "../utils/response.js";
import mongoose from "mongoose";
import { getPendingUpload } from "../services/pendingUploadService.js";

export const loginUser = async (req, res, next) => {
  try {
    const validateResult = loginSchema.safeParse(req.body);
    if (!validateResult.success) {
      const message = validateResult.error.issues
        .map((err) => err.message)
        .join(", ");
      throw new AppError(message, 400, "INVALID_LOGIN_DATA");
    }

    const { email, password } = validateResult.data;
    const user = await User.findOne({ email })
      .select("+passwordHash")
      .lean();

    if (
      !user ||
      !user.passwordHash ||
      user.authProvider !== "local" ||
      !user.isActive ||
      !(await argon2.verify(user.passwordHash, password))
    ) {
      throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    const accessToken = generateAccessToken(user._id);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    return successResponse(
      res,
      {
        user: {
          id: user._id.toString(),
          username: user.username,
        },
      },
      "User logged in successfully",
    );
  } catch (error) {
    next(error);
  }
};

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
    const { username, email, password, bio, imageToken } = validateResult.data;

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

    const pendingUpload = await getPendingUpload(imageToken);
    console.log("Pending Upload:", pendingUpload);
    if (!pendingUpload) {
      throw new AppError(
        "Invalid or expired image token",
        400,
        "INVALID_IMAGE_TOKEN",
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
      avatarUrl: pendingUpload, // Save the S3 image key as avatarUrl
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
