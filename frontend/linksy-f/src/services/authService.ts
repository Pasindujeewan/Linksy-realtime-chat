import type { ApiResponse, RegisterPayload, RegisteredUser } from "../types/auth";

const apiUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

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
