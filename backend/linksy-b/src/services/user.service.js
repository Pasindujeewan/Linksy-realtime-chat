import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import { AppError } from "../errors/AppError.js";
import { generateImageUrl } from "../utils/generateImageUrl.js";
import {
  getPublicUsersCache,
  getPublicUsersCacheVersion,
  invalidatePublicUsersCache,
  setPublicUsersCache,
} from "./publicUsersCacheService.js";
import { getUsersRedisKey } from "../utils/redisKeyGen.js";

const USERS_PER_PAGE = 10;

const createPublicUserProfiles = (profiles) =>
  Promise.all(
    profiles.map(async ({ id, username, avatarKey }) => ({
      id,
      username,
      avatarUrl: avatarKey ? await generateImageUrl(avatarKey) : null,
    })),
  );

const addLastMessages = async (profiles, userId) => {
  if (profiles.length === 0) return profiles;

  const conversations = await Conversation.find({
    $and: [
      { participants: userId },
      { participants: { $in: profiles.map(({ id }) => id) } },
    ],
    lastMessage: { $ne: null },
  })
    .select("participants lastMessage")
    .populate({ path: "lastMessage", select: "content" })
    .lean();

  const lastMessagesByUserId = new Map();
  for (const conversation of conversations) {
    const otherUserId = conversation.participants.find(
      (participantId) => participantId.toString() !== userId.toString(),
    );
    if (
      otherUserId &&
      conversation.lastMessage &&
      typeof conversation.lastMessage.content === "string"
    ) {
      lastMessagesByUserId.set(
        otherUserId.toString(),
        conversation.lastMessage.content,
      );
    }
  }

  return profiles.map((profile) => ({
    ...profile,
    lastMessage: lastMessagesByUserId.get(profile.id) ?? null,
  }));
};

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

    try {
      await invalidatePublicUsersCache();
    } catch (error) {
      console.error("Failed to invalidate public users cache:", error);
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
  const cacheVersion = await getPublicUsersCacheVersion();
  const cacheKey = getUsersRedisKey(
    userId,
    page,
    USERS_PER_PAGE,
    cacheVersion,
  );
  const cachedResult = await getPublicUsersCache(cacheKey);

  if (cachedResult) {
    return {
      users: await addLastMessages(
        await createPublicUserProfiles(cachedResult.users),
        userId,
      ),
      pagination: cachedResult.pagination,
    };
  }

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
  const profiles = pageUsers.map((user) => ({
    id: user._id.toString(),
    username: user.username,
    avatarKey: user.avatarUrl,
  }));
  const pagination = {
    page,
    limit: USERS_PER_PAGE,
    hasMore,
    nextPage: hasMore ? page + 1 : null,
  };

  await setPublicUsersCache(cacheKey, { users: profiles, pagination });

  return {
    users: await addLastMessages(
      await createPublicUserProfiles(profiles),
      userId,
    ),
    pagination,
  };
};

export const searchUsersByUsername = async (username, userId) => {
  // Escape regex characters so the username is treated as plain text.
  const escapedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const users = await User.find({
    _id: { $ne: userId },
    isActive: true,
    username: { $regex: escapedUsername, $options: "i" },
  })
    .select("username avatarUrl")
    .sort({ username: 1, _id: 1 })
    .limit(USERS_PER_PAGE)
    .lean();

  const profiles = await Promise.all(
    users.map(async (user) => ({
      id: user._id.toString(),
      username: user.username,
      avatarUrl: user.avatarUrl
        ? await generateImageUrl(user.avatarUrl)
        : null,
    })),
  );

  return addLastMessages(profiles, userId);
};
