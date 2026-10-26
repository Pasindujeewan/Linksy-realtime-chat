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
    confirmPassword: z.string(),
    bio: z.string().max(160, "Bio cannot exceed 160 characters"),
    avatar: z
      .file()
      .mime(["image/jpeg", "image/png", "image/webp", "image/gif"], "Choose a JPG, PNG, WEBP, or GIF image")
      .max(5 * 1024 * 1024, "Image must be 5 MB or smaller"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

export type RegisterFields = z.infer<typeof registerSchema>;
export type RegisterFieldErrors = Partial<Record<keyof RegisterFields, string>>;
