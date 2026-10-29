import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getUserProfile,
  logoutUser as requestLogoutUser,
} from "../services/authService";
import type { RegisteredUser, UserProfile } from "../types/auth";
import { useToast } from "./ToastContext";

const SESSION_USER_KEY = "linksy.sessionUser";

interface UserContextValue {
  user: UserProfile | null;
  isLoadingProfile: boolean;
  setAuthenticatedUser: (user: RegisteredUser) => void;
  clearAuthenticatedUser: () => void;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

function readSessionUser(): RegisteredUser | null {
  if (typeof window === "undefined") return null;

  const storedUser = window.sessionStorage.getItem(SESSION_USER_KEY);
  if (!storedUser) return null;

  try {
    const value: unknown = JSON.parse(storedUser);
    if (
      typeof value === "object" &&
      value !== null &&
      "id" in value &&
      typeof value.id === "string" &&
      value.id.length > 0 &&
      "username" in value &&
      typeof value.username === "string"
    ) {
      return { id: value.id, username: value.username };
    }
  } catch {
    window.sessionStorage.removeItem(SESSION_USER_KEY);
    return null;
  }

  window.sessionStorage.removeItem(SESSION_USER_KEY);
  return null;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [user, setUser] = useState<UserProfile | null>(readSessionUser);
  const [isLoadingProfile, setIsLoadingProfile] = useState(
    () => readSessionUser() !== null,
  );

  useEffect(() => {
    if (!user?.id) {
      setIsLoadingProfile(false);
      return;
    }

    let isCurrentRequest = true;
    setIsLoadingProfile(true);

    getUserProfile(user.id)
      .then((profile) => {
        if (isCurrentRequest) setUser(profile);
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) return;
        toast.error(
          error instanceof Error
            ? error.message
            : "We couldn't load your profile.",
        );
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoadingProfile(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [toast, user?.id]);

  const setAuthenticatedUser = useCallback((registeredUser: RegisteredUser) => {
    window.sessionStorage.setItem(
      SESSION_USER_KEY,
      JSON.stringify({
        id: registeredUser.id,
        username: registeredUser.username,
      }),
    );
    setUser(registeredUser);
  }, []);

  const clearAuthenticatedUser = useCallback(() => {
    window.sessionStorage.removeItem(SESSION_USER_KEY);
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    await requestLogoutUser();
    // Keep local auth state until the server confirms the token was revoked.
    clearAuthenticatedUser();
  }, [clearAuthenticatedUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        isLoadingProfile,
        setAuthenticatedUser,
        clearAuthenticatedUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider.");
  }
  return context;
}
