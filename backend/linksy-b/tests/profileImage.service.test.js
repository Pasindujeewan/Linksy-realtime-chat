import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/services/s3StorageService.js", () => ({
  uploadImageToS3: vi.fn(),
  deleteImageFromS3: vi.fn(),
}));

vi.mock("../src/services/pendingUploadService.js", () => ({
  savePendingUpload: vi.fn(),
  UPLOAD_TTL_SECONDS: 9000,
}));

import { deleteImageFromS3, uploadImageToS3 } from "../src/services/s3StorageService.js";
import { savePendingUpload } from "../src/services/pendingUploadService.js";
import { uploadProfileImage } from "../src/services/profileImageService.js";

describe("uploadProfileImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uploadImageToS3.mockResolvedValue(undefined);
    savePendingUpload.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uploads a validated image and saves its pending-upload token", async () => {
    const file = { buffer: Buffer.from("image"), mimetype: "image/png" };

    const result = await uploadProfileImage(file);

    expect(uploadImageToS3).toHaveBeenCalledWith({
      key: expect.stringMatching(/^profile-pending\/.+\.png$/),
      file,
    });
    expect(savePendingUpload).toHaveBeenCalledWith(
      result.uploadToken,
      expect.stringMatching(/^profile-pending\/.+\.png$/),
    );
    expect(result).toEqual({
      uploadToken: expect.any(String),
      expiresIn: 9000,
    });
  });

  it("does not upload unsupported files", async () => {
    await expect(
      uploadProfileImage({
        buffer: Buffer.from("not an image"),
        mimetype: "text/plain",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: "UNSUPPORTED_FILE_TYPE",
    });

    expect(uploadImageToS3).not.toHaveBeenCalled();
    expect(savePendingUpload).not.toHaveBeenCalled();
  });

  it("deletes the uploaded image when saving the pending upload fails", async () => {
    const file = { buffer: Buffer.from("image"), mimetype: "image/jpeg" };
    const saveError = new Error("Redis unavailable");
    savePendingUpload.mockRejectedValue(saveError);

    await expect(uploadProfileImage(file)).rejects.toBe(saveError);

    const uploadedKey = uploadImageToS3.mock.calls[0][0].key;
    expect(deleteImageFromS3).toHaveBeenCalledWith(uploadedKey);
  });

  it("preserves the save error if cleanup also fails", async () => {
    const file = { buffer: Buffer.from("image"), mimetype: "image/webp" };
    const saveError = new Error("Redis unavailable");
    savePendingUpload.mockRejectedValue(saveError);
    deleteImageFromS3.mockRejectedValue(new Error("S3 unavailable"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(uploadProfileImage(file)).rejects.toBe(saveError);

    expect(consoleError).toHaveBeenCalledWith(
      "Failed to clean up temporary S3 image:",
      expect.any(Error),
    );
  });
});
