import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/config/env.js", () => ({
  env: { JWT_ACCESS_SECRET: "test-secret" },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
    JsonWebTokenError: class JsonWebTokenError extends Error {},
  },
}));

vi.mock("../src/utils/redisUtils.js", () => ({
  getValue: vi.fn(),
}));

vi.mock("../src/utils/token.js", () => ({
  getAccessTokenBlacklistKey: vi.fn((token) => `blacklist:${token}`),
}));

import jwt from "jsonwebtoken";
import { getValue } from "../src/utils/redisUtils.js";
import { authenticateAccessToken } from "../src/middleware/auth.middleware.js";

const makeRequest = ({ authorization, cookieToken } = {}) => ({
  get: vi.fn(() => authorization),
  cookies: cookieToken ? { accessToken: cookieToken } : {},
});

describe("authenticateAccessToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getValue.mockResolvedValue(null);
  });

  it("passes an unauthorized error to next when no token is provided", async () => {
    const next = vi.fn();

    await authenticateAccessToken(makeRequest(), {}, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, code: "UNAUTHORIZED" }),
    );
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it("authenticates a bearer token and attaches its payload to the request", async () => {
    const req = makeRequest({ authorization: "Bearer access-token" });
    const payload = { sub: "user-1" };
    jwt.verify.mockReturnValue(payload);
    const next = vi.fn();

    await authenticateAccessToken(req, {}, next);

    expect(jwt.verify).toHaveBeenCalledWith("access-token", "test-secret");
    expect(getValue).toHaveBeenCalledWith("blacklist:access-token");
    expect(req.user).toBe(payload);
    expect(next).toHaveBeenCalledWith();
  });

  it("uses the access-token cookie when no bearer token is provided", async () => {
    const req = makeRequest({ cookieToken: "cookie-token" });
    jwt.verify.mockReturnValue({ sub: "user-2" });
    const next = vi.fn();

    await authenticateAccessToken(req, {}, next);

    expect(jwt.verify).toHaveBeenCalledWith("cookie-token", "test-secret");
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects a revoked token", async () => {
    const req = makeRequest({ authorization: "Bearer revoked-token" });
    jwt.verify.mockReturnValue({ sub: "user-3" });
    getValue.mockResolvedValue("revoked");
    const next = vi.fn();

    await authenticateAccessToken(req, {}, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, code: "TOKEN_REVOKED" }),
    );
    expect(req.user).toBeUndefined();
  });

  it("rejects a token whose payload has no subject", async () => {
    const req = makeRequest({ authorization: "Bearer malformed-token" });
    jwt.verify.mockReturnValue({});
    const next = vi.fn();

    await authenticateAccessToken(req, {}, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, code: "INVALID_ACCESS_TOKEN" }),
    );
  });

  it("converts JWT verification errors to an invalid-token error", async () => {
    const req = makeRequest({ authorization: "Bearer expired-token" });
    jwt.verify.mockImplementation(() => {
      throw new jwt.JsonWebTokenError("expired");
    });
    const next = vi.fn();

    await authenticateAccessToken(req, {}, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, code: "INVALID_ACCESS_TOKEN" }),
    );
  });
});
