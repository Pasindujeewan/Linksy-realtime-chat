import { AppError } from "../errors/AppError.js";
import { successResponse } from "../utils/response.js";
import { getUserById } from "../services/user.service.js";

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
