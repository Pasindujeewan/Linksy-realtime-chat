import { AppError } from "../errors/AppError.js";

const extensionByMimeType = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Get the file extension based on the MIME type
export function getImageExtension(mimeType) {
  return extensionByMimeType[mimeType] ?? null;
}

// Validate the uploaded image file
export function validateImage(file) {
  if (!file?.buffer || !file?.mimetype) {
    throw new AppError("Invalid file upload", 400, "INVALID_FILE_UPLOAD");
  }

  const extension = getImageExtension(file.mimetype);

  if (!extension) {
    throw new AppError(
      "Unsupported file type. Only JPEG, PNG, and WEBP are allowed.",
      400,
      "UNSUPPORTED_FILE_TYPE",
    );
  }

  return extension;
}
