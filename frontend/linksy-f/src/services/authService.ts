import type {
  ApiResponse,
  LoginPayload,
  RegisterPayload,
  RegisteredUser,
  UserProfile,
} from "../types/auth";

const apiUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

interface ProfileImageUploadData {
  uploadToken: string;
  expiresIn: number;
}

interface ProfileImageUploadResponse {
  message: string;
  data: ProfileImageUploadData;
}

interface BackendUserProfile {
  id?: string;
  _id?: string;
  username: string;
  email?: string;
  avatarUrl?: string | null;
  bio?: string;
}

/** Uploads a profile image and returns the token required by registration. */
export async function uploadProfileImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("image", file);

  const response = await fetch(`${apiUrl}/api/upload/profile-image`, {
    method: "POST",
    credentials: "include",
    body,
  });
  const result = (await response.json()) as ApiResponse<ProfileImageUploadResponse>;

  if (!response.ok || !result.success || !result.data?.data?.uploadToken) {
    throw new Error(result.message || "We couldn't upload your profile picture.");
  }

  return result.data.data.uploadToken;
}

export async function registerUser(payload: RegisterPayload): Promise<RegisteredUser> {
  const response = await fetch(`${apiUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const result = (await response.json()) as ApiResponse<{ user?: RegisteredUser }>;
  if (!response.ok || !result.success || !result.data?.user) {
    throw new Error(result.message || "We couldn't create your account. Please try again.");
  }

  return result.data.user;
}

export async function loginUser(payload: LoginPayload): Promise<RegisteredUser> {
  const response = await fetch(`${apiUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const result = (await response.json()) as ApiResponse<{ user?: RegisteredUser }>;
  if (!response.ok || !result.success || !result.data?.user) {
    throw new Error(result.message || "We couldn't log you in. Please try again.");
  }

  return result.data.user;
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const response = await fetch(
    `${apiUrl}/api/user/me/${encodeURIComponent(userId)}`,
    { credentials: "include" },
  );
  const result = (await response.json()) as ApiResponse<BackendUserProfile>;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "We couldn't load your profile.");
  }

  const id = result.data.id ?? result.data._id;
  if (!id || !result.data.username) {
    throw new Error("The profile response is missing required user details.");
  }

  return {
    id,
    username: result.data.username,
    email: result.data.email,
    avatarUrl: result.data.avatarUrl,
    bio: result.data.bio,
  };
}
