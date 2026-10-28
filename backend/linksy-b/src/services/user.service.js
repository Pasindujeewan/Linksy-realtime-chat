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
    const avatarUrl = await generateImageUrl(user.avatarUrl);

    return {
      ...user,
      avatarUrl: avatarUrl,
    };
  } catch (error) {
    console.error("Error in getUserById:", error);
    throw error;
  }
};
