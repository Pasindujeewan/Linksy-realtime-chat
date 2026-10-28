import { describe, expect, it } from "vitest";
import {
  loginSchema,
  registerSchema,
} from "../src/validators/auth.validator.js";

// Test suite for the registerSchema validation
const validRegistration = {
  username: "linksy_user",
  email: "User@Example.com",
  password: "password123",
  avatarUrl: "https://example.com/avatar.png",
};

// Test suite for the registerSchema validation
describe("registerSchema", () => {
  it("accepts valid registration data and normalizes username and email", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      username: "  linksy_user  ",
    });

    expect(result.success).toBe(true);
    expect(result.data.username).toBe("linksy_user");
    expect(result.data.email).toBe("user@example.com");
  });

  it("rejects a short password", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password: "short",
    });

    expect(result.success).toBe(false);
    expect(result.error.issues.map(({ path }) => path.join("."))).toContain(
      "password",
    );
  });

  it("rejects unknown fields", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      isAdmin: true,
    });

    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("normalizes the email address", () => {
    const result = loginSchema.safeParse({
      email: " USER@Example.com ",
      password: "password123",
    });

    expect(result.success).toBe(true);
    expect(result.data.email).toBe("user@example.com");
  });

  it("rejects invalid credentials input and unknown fields", () => {
    expect(
      loginSchema.safeParse({ email: "invalid", password: "password123" })
        .success,
    ).toBe(false);
    expect(
      loginSchema.safeParse({
        email: "user@example.com",
        password: "password123",
        isAdmin: true,
      }).success,
    ).toBe(false);
  });
});
