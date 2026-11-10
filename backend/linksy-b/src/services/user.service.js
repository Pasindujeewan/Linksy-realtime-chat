import User from "../models/user.model.js";
import { AppError } from "../errors/AppError.js";
import { generateImageUrl } from "../utils/generateImageUrl.js";

const USERS_PER_PAGE = 10;

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

export const getPublicUserProfile = async (userId) => {
  const user = await User.findOne({ _id: userId, isActive: true })
    .select("username email bio avatarUrl")
    .lean();

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatarUrl: user.avatarUrl
      ? await generateImageUrl(user.avatarUrl)
      : null,
  };
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

export const getOtherUsers = async (userId, page) => {
  const users = await User.find({
    _id: { $ne: userId },
    isActive: true,
  })
    .select("username avatarUrl")
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * USERS_PER_PAGE)
    .limit(USERS_PER_PAGE + 1)
    .lean();

  const hasMore = users.length > USERS_PER_PAGE;
  const pageUsers = users.slice(0, USERS_PER_PAGE);
  const profiles = await Promise.all(
    pageUsers.map(async (user) => ({
      id: user._id.toString(),
      username: user.username,
      avatarUrl: user.avatarUrl
        ? await generateImageUrl(user.avatarUrl)
        : null,
    })),
  );

  return {
    users: profiles,
    pagination: {
      page,
      limit: USERS_PER_PAGE,
      hasMore,
      nextPage: hasMore ? page + 1 : null,
    },
  };
};
