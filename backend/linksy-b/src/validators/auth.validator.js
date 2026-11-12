import { z } from "zod";

export const loginSchema = z
  .object({
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
  })
  .strict();

export const googleAuthSchema = z
  .object({
    idToken: z.string().trim().min(1).max(8192),
  })
  .strict();

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
    imageToken: z.string().optional(),
  })
  .strict();

export const updateUserProfileSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must contain at least 3 characters")
      .max(20, "Username cannot exceed 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can contain only letters, numbers, and underscores",
      )
      .optional(),
    email: z
      .string()
      .trim()
      .max(254)
      .pipe(z.email({ error: "Invalid email address" }))
      .transform((value) => value.toLowerCase())
      .optional(),
    bio: z.string().trim().max(160, "Bio cannot exceed 160 characters").optional(),
  })
  .strict()
  .refine((profile) => Object.keys(profile).length > 0, {
    message: "At least one profile field is required",
  });
