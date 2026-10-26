import { AppError } from "../errors/AppError.js";
import { successResponse } from "../utils/response.js";
import { uploadProfileImage } from "../services/profileImageService.js";

// Controller for handling profile image upload
export async function uploadProfileImageController(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError("No file uploaded", 400, "NO_FILE_UPLOADED");
    }

    const result = await uploadProfileImage(req.file);

    return successResponse(res, {
      message: "Profile image uploaded successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in uploadProfileImageController:", error);
    next(error);
  }
}
