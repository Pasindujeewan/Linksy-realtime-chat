import { describe, expect, it } from "vitest";
import { registerSchema } from "../src/validators/auth.validator.js";

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
