import type { RegisterPayload } from "../../../types/auth";

export type RegisterFields = Omit<RegisterPayload, "bio"> & {
  bio: string;
  confirmPassword: string;
};
export type RegisterFieldErrors = Partial<
  Record<keyof RegisterFields | "avatarFile", string>
>;
export type AvatarUploadStatus = "idle" | "uploading" | "uploaded";
