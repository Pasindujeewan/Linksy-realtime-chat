import { randomUUID } from "node:crypto";

import { validateImage } from "../utils/imageUtils.js";
import { uploadImageToS3, deleteImageFromS3 } from "./s3StorageService.js";
import {
  savePendingUpload,
  UPLOAD_TTL_SECONDS,
} from "./pendingUploadService.js";

export async function uploadProfileImage(file) {
  const extension = validateImage(file);

  const imageId = randomUUID();
  const uploadToken = randomUUID();
  const imageKey = `profile-pending/${imageId}.${extension}`;

  await uploadImageToS3({ key: imageKey, file });

  try {
    await savePendingUpload(uploadToken, imageKey);
  } catch (error) {
    try {
      await deleteImageFromS3(imageKey);
    } catch (cleanupError) {
      console.error("Failed to clean up temporary S3 image:", cleanupError);
    }

    throw error;
  }

  return {
    uploadToken,
    expiresIn: UPLOAD_TTL_SECONDS,
  };
}
