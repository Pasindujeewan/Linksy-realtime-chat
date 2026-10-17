export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  avatarUrl: string;
  bio?: string;
}

export interface RegisteredUser {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
