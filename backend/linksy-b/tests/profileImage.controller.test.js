import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/services/profileImageService.js", () => ({
  uploadProfileImage: vi.fn(),
}));

import { uploadProfileImage } from "../src/services/profileImageService.js";
import { uploadProfileImageController } from "../src/controllers/profileImage.controller.js";

const makeResponse = () => {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
};

describe("uploadProfileImageController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes a missing-file error to next", async () => {
    const next = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});

    await uploadProfileImageController({}, makeResponse(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, code: "NO_FILE_UPLOADED" }),
    );
    expect(uploadProfileImage).not.toHaveBeenCalled();
  });

  it("returns the result of a successful image upload", async () => {
    const file = { buffer: Buffer.from("image"), mimetype: "image/png" };
    const result = { uploadToken: "upload-token", expiresIn: 9000 };
    uploadProfileImage.mockResolvedValue(result);
    const res = makeResponse();
    const next = vi.fn();

    await uploadProfileImageController({ file }, res, next);

    expect(uploadProfileImage).toHaveBeenCalledWith(file);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: {
          message: "Profile image uploaded successfully",
          data: result,
        },
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("passes upload failures to next", async () => {
    const error = new Error("Upload failed");
    uploadProfileImage.mockRejectedValue(error);
    const next = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});

    await uploadProfileImageController(
      { file: { buffer: Buffer.from("image"), mimetype: "image/png" } },
      makeResponse(),
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });
});
