import type { ApiResponse, RegisterPayload, RegisteredUser } from "../types/auth";

const apiUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

interface AvatarUploadResponse {
  success: boolean;
  message: string;
  data: { url: string };
}

/** Uploads an avatar to the backend, which should return its public cloud URL. */
export async function uploadAvatar(file: File): Promise<string> {
  const body = new FormData();
  body.append("avatar", file);

  const response = await fetch(`${apiUrl}/api/uploads/avatar`, {
    method: "POST",
    credentials: "include",
    body,
  });
  const result = (await response.json()) as AvatarUploadResponse;

  if (!response.ok || !result.success || !result.data?.url) {
    throw new Error(result.message || "We couldn't upload your profile picture.");
  }

  return result.data.url;
}

export async function registerUser(payload: RegisterPayload): Promise<RegisteredUser> {
  const response = await fetch(`${apiUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const result = (await response.json()) as ApiResponse<{ user: RegisteredUser }>;
  if (!response.ok || !result.success) {
    throw new Error(result.message || "We couldn't create your account. Please try again.");
  }

  return result.data.user;
}
