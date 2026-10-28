export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  imageToken: string;
  bio?: string;
}

export interface RegisteredUser {
  id: string;
  username: string;
}

export interface UserProfile extends RegisteredUser {
  email?: string;
  avatarUrl?: string | null;
  bio?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
