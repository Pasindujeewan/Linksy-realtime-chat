export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  imageToken: string;
  bio?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
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

export interface UpdateUserProfilePayload {
  username?: string;
  email?: string;
  bio?: string;
}

export interface DirectoryUser {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface UserDirectoryPage {
  users: DirectoryUser[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
    nextPage: number | null;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
