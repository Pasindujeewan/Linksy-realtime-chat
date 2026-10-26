import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("../src/models/user.model.js", () => ({
  default: { findOne: vi.fn(), create: vi.fn() },
}));
vi.mock("argon2", () => ({ default: { hash: vi.fn() } }));
vi.mock("../src/utils/token.js", () => ({
  generateAccessToken: vi.fn(() => "signed-token"),
}));

import User from "../src/models/user.model.js";
import argon2 from "argon2";
import { registerUser } from "../src/controllers/auth.controller.js";

const validBody = {
  username: "linksy_user",
  email: "user@example.com",
  password: "password123",
  avatarUrl: "https://example.com/avatar.png",
};

// Helper function to create a mock response object
const makeResponse = () => {
  const res = {
    cookie: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
};

// Test suite for the registerUser function
describe("registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    User.findOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) });
    argon2.hash.mockResolvedValue("hashed-password");
  });

  it("passes validation errors to the error middleware", async () => {
    const req = { body: { ...validBody, password: "short" } };
    const res = makeResponse();
    const next = vi.fn();

    await registerUser(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, code: "VALIDATION_FAIELD" }),
    );
    expect(User.findOne).not.toHaveBeenCalled();
    expect(User.create).not.toHaveBeenCalled();
  });

  it("rejects a registration when the email or username already exists", async () => {
    User.findOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: "existing-user" }),
    });
    const res = makeResponse();
    const next = vi.fn();

    await registerUser({ body: validBody }, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 409, code: "USER_ALREADY_EXSIT" }),
    );
    expect(User.create).not.toHaveBeenCalled();
  });

  it("hashes the password, creates the user, sets a cookie, and returns 201", async () => {
    User.create.mockImplementation(async (user) => ({
      ...user,
      _id: user._id,
    }));
    const res = makeResponse();
    const next = vi.fn();

    await registerUser({ body: validBody }, res, next);

    expect(argon2.hash).toHaveBeenCalledWith(validBody.password);
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        username: validBody.username,
        email: validBody.email,
        passwordHash: "hashed-password",
      }),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      "accessToken",
      "signed-token",
      expect.objectContaining({ httpOnly: true, sameSite: "strict" }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          user: expect.objectContaining({
            username: validBody.username,
            email: validBody.email,
          }),
        }),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });
});
