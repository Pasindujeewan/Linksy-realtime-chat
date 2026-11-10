import type {
  ApiResponse,
  UserDirectoryPage,
  DirectoryUser,
  LoginPayload,
  PublicUserProfile,
  RegisterPayload,
  RegisteredUser,
  UpdateUserProfilePayload,
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

interface BackendPublicUserProfile {
  id?: string;
  username?: string;
  email?: string;
  avatarUrl?: string | null;
  bio?: string;
}

interface BackendUserDirectoryPage {
  users: Array<{
    id: string;
    username: string;
    avatarUrl: string | null;
  }>;
  pagination: UserDirectoryPage["pagination"];
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

export async function loginWithGoogle(idToken: string): Promise<RegisteredUser> {
  const response = await fetch(`${apiUrl}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });

  const result = (await response.json()) as ApiResponse<{ user?: RegisteredUser }>;
  if (!response.ok || !result.success || !result.data?.user) {
    throw new Error(
      result.message || "We couldn't sign you in with Google. Please try again.",
    );
  }

  return result.data.user;
}

export async function logoutUser(): Promise<void> {
  const response = await fetch(`${apiUrl}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  const result = (await response.json()) as ApiResponse<null>;
  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "We couldn't log you out. Please try again.",
    );
  }
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

export async function getOtherUserProfile(
  userId: string,
): Promise<PublicUserProfile> {
  const response = await fetch(
    `${apiUrl}/api/user/${encodeURIComponent(userId)}`,
    { credentials: "include" },
  );
  const result =
    (await response.json()) as ApiResponse<BackendPublicUserProfile>;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "We couldn't load this profile.");
  }

  const { id, username, email, avatarUrl, bio } = result.data;
  if (
    typeof id !== "string" ||
    typeof username !== "string" ||
    typeof email !== "string" ||
    (avatarUrl !== null && typeof avatarUrl !== "string") ||
    typeof bio !== "string"
  ) {
    throw new Error("The profile response is missing required user details.");
  }

  return { id, username, email, avatarUrl, bio };
}

export async function getOtherUsers(page: number): Promise<UserDirectoryPage> {
  const response = await fetch(
    `${apiUrl}/api/user/others?page=${encodeURIComponent(page)}`,
    { credentials: "include" },
  );
  const result =
    (await response.json()) as ApiResponse<BackendUserDirectoryPage>;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "We couldn't load the people directory.");
  }

  const { users, pagination } = result.data;
  if (
    !Array.isArray(users) ||
    !pagination ||
    !Number.isInteger(pagination.page) ||
    !Number.isInteger(pagination.limit) ||
    typeof pagination.hasMore !== "boolean" ||
    (pagination.nextPage !== null && !Number.isInteger(pagination.nextPage))
  ) {
    throw new Error("The people directory response is invalid.");
  }

  const profiles: DirectoryUser[] = users.map((profile) => {
    if (
      typeof profile.id !== "string" ||
      typeof profile.username !== "string" ||
      (profile.avatarUrl !== null && typeof profile.avatarUrl !== "string")
    ) {
      throw new Error("The people directory response is invalid.");
    }

    return profile;
  });

  return { users: profiles, pagination };
}

export async function updateUserProfile(
  userId: string,
  payload: UpdateUserProfilePayload,
): Promise<UserProfile> {
  const response = await fetch(
    `${apiUrl}/api/user/me/${encodeURIComponent(userId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    },
  );
  const result = (await response.json()) as ApiResponse<BackendUserProfile>;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "We couldn't update your profile.");
  }

  const id = result.data.id ?? result.data._id;
  if (!id || !result.data.username) {
    throw new Error("The updated profile response is missing required user details.");
  }

  return {
    id,
    username: result.data.username,
    email: result.data.email,
    avatarUrl: result.data.avatarUrl,
    bio: result.data.bio,
  };
}
