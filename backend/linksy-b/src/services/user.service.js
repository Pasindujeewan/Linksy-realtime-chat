import User from "../models/user.model.js";
import { AppError } from "../errors/AppError.js";
import { generateImageUrl } from "../utils/generateImageUrl.js";

// Get user by ID and generate a signed URL for the avatar
export const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    console.log("User found:", user);
    const avatarUrl = user.avatarUrl
      ? await generateImageUrl(user.avatarUrl)
      : null;

    return {
      ...user,
      avatarUrl: avatarUrl,
    };
  } catch (error) {
    console.error("Error in getUserById:", error);
    throw error;
  }
};

export const updateUserById = async (userId, updates) => {
  try {
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const avatarUrl = user.avatarUrl
      ? await generateImageUrl(user.avatarUrl)
      : null;

    return {
      ...user,
      avatarUrl,
    };
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError(
        "Username or email is already in use",
        409,
        "USER_ALREADY_EXISTS",
      );
    }
    throw error;
  }
};
