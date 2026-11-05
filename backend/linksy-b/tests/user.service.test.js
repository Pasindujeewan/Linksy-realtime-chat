import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import User from "../src/models/user.model.js";
import { generateImageUrl } from "../src/utils/generateImageUrl.js";
import { getUserById } from "../src/services/user.service.js";

vi.mock("../src/models/user.model.js", () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock("../src/utils/generateImageUrl.js", () => ({
  generateImageUrl: vi.fn(),
}));

describe("getUserById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the user with a generated avatar URL", async () => {
    const user = { _id: "user-1", username: "alex", avatarUrl: "avatar-key" };
    const lean = vi.fn().mockResolvedValue(user);
    User.findById.mockReturnValue({ lean });
    generateImageUrl.mockResolvedValue("https://images.example/avatar");

    await expect(getUserById("user-1")).resolves.toEqual({
      ...user,
      avatarUrl: "https://images.example/avatar",
    });

    expect(User.findById).toHaveBeenCalledWith("user-1");
    expect(lean).toHaveBeenCalledOnce();
    expect(generateImageUrl).toHaveBeenCalledWith("avatar-key");
  });

  it("returns a null avatar URL when the user has no avatar", async () => {
    const user = { _id: "user-2", username: "sam", avatarUrl: null };
    User.findById.mockReturnValue({
      lean: vi.fn().mockResolvedValue(user),
    });

    await expect(getUserById("user-2")).resolves.toEqual(user);

    expect(generateImageUrl).not.toHaveBeenCalled();
  });

  it("rejects with a not-found error when the user does not exist", async () => {
    User.findById.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    await expect(getUserById("missing-user")).rejects.toMatchObject({
      name: "AppError",
      message: "User not found",
      statusCode: 404,
      code: "USER_NOT_FOUND",
    });
    expect(generateImageUrl).not.toHaveBeenCalled();
  });
});
