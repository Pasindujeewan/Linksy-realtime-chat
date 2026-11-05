import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/services/user.service.js", () => ({
  getUserById: vi.fn(),
}));

import { getUserById } from "../src/services/user.service.js";
import { getUserProfile } from "../src/controllers/user.controller.js";

const makeResponse = () => {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
};

describe("getUserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes a missing user ID error to next", async () => {
    const next = vi.fn();

    await getUserProfile({ params: {} }, makeResponse(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, code: "USER_ID_REQUIRED" }),
    );
    expect(getUserById).not.toHaveBeenCalled();
  });

  it("returns the requested user profile", async () => {
    const user = { id: "user-1", username: "alex" };
    getUserById.mockResolvedValue(user);
    const res = makeResponse();
    const next = vi.fn();

    await getUserProfile({ params: { userId: "user-1" } }, res, next);

    expect(getUserById).toHaveBeenCalledWith("user-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: user }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("passes service failures to next", async () => {
    const error = new Error("Lookup failed");
    getUserById.mockRejectedValue(error);
    const next = vi.fn();

    await getUserProfile(
      { params: { userId: "user-1" } },
      makeResponse(),
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });
});
