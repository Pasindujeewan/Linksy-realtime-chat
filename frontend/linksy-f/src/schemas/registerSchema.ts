import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must contain at least 3 characters")
      .max(20, "Username cannot exceed 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Use only letters, numbers, and underscores"),
    email: z.string().trim().max(254).pipe(z.email("Enter a valid email address")),
    password: z.string().min(8, "Password must contain at least 8 characters").max(128),
    bio: z.string().max(160, "Bio cannot exceed 160 characters").optional(),
    imageToken: z.string().optional(),
  })
  .strict();

export type RegisterRequest = z.infer<typeof registerSchema>;
