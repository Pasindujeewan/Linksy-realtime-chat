import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must contain at least 3 characters")
      .max(20, "Username cannot exceed 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can contain only letters, numbers, and underscores",
      ),

    email: z
      .string()
      .trim()
      .max(254)
      .pipe(z.email({ error: "Invalid email address" }))
      .transform((value) => value.toLowerCase()),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(128, "Password cannot exceed 128 characters"),

    bio: z.string().max(160, "Bio cannot exceed 160 characters").optional(),
    avatarUrl: z.url("Avatar URL must be a valid URL"),
  })
  .strict();
