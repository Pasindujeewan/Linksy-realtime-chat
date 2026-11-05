import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/utils/redisUtils.js", () => ({
  setValue: vi.fn(),
  getValue: vi.fn(),
  deleteValue: vi.fn(),
}));

import { deleteValue, getValue, setValue } from "../src/utils/redisUtils.js";
import {
  deletePendingUpload,
  getPendingUpload,
  savePendingUpload,
  UPLOAD_TTL_SECONDS,
} from "../src/services/pendingUploadService.js";

describe("pending upload service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores an image key with its token and expiration time", async () => {
    setValue.mockResolvedValue(undefined);

    await savePendingUpload("upload-token", "profile-pending/image.png");

    expect(setValue).toHaveBeenCalledWith(
      "pending-profile-upload:upload-token",
      "profile-pending/image.png",
      UPLOAD_TTL_SECONDS,
    );
  });

  it("retrieves a pending image key by token", async () => {
    getValue.mockResolvedValue("profile-pending/image.png");

    await expect(getPendingUpload("upload-token")).resolves.toBe(
      "profile-pending/image.png",
    );
    expect(getValue).toHaveBeenCalledWith("pending-profile-upload:upload-token");
  });

  it("deletes a pending upload by token", async () => {
    deleteValue.mockResolvedValue(1);

    await expect(deletePendingUpload("upload-token")).resolves.toBe(1);
    expect(deleteValue).toHaveBeenCalledWith(
      "pending-profile-upload:upload-token",
    );
  });
});
