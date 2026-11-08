import { AppError } from "../errors/AppError.js";
import { successResponse } from "../utils/response.js";
import {
  getOtherUsers,
  getUserById,
  updateUserById,
} from "../services/user.service.js";
import { updateUserProfileSchema } from "../validators/auth.validator.js";

const USERS_PER_PAGE = 10;

// Controller for handling user profile retrieval
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      throw new AppError("User ID is required", 400, "USER_ID_REQUIRED");
    }
    const user = await getUserById(req.params.userId);
    successResponse(res, user, 200);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (req.user.sub !== userId) {
      throw new AppError(
        "You can only update your own profile",
        403,
        "FORBIDDEN",
      );
    }
    console.log("Request body:", req.body); // Log the request body for debugging
    const validateResult = updateUserProfileSchema.safeParse(req.body);
    if (!validateResult.success) {
      const message = validateResult.error.issues
        .map((issue) => issue.message)
        .join(", ");
      throw new AppError(message, 400, "INVALID_PROFILE_DATA");
    }

    const user = await updateUserById(userId, validateResult.data);
    return successResponse(res, user, "User profile updated successfully");
  } catch (error) {
    next(error);
  }
};

export const getOtherUserProfiles = async (req, res, next) => {
  try {
    const pageValue = req.query.page ?? "1";
    if (
      typeof pageValue !== "string" ||
      !/^[1-9]\d*$/.test(pageValue) ||
      !Number.isSafeInteger(Number(pageValue)) ||
      Number(pageValue) > Math.floor(Number.MAX_SAFE_INTEGER / USERS_PER_PAGE)
    ) {
      throw new AppError("Page must be a positive integer", 400, "INVALID_PAGE");
    }

    const result = await getOtherUsers(req.user.sub, Number(pageValue));
    return successResponse(res, result, "User profiles retrieved successfully");
  } catch (error) {
    next(error);
  }
};
