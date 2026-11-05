import { useState } from "react";
import { useNavigate } from "react-router";
import { useToast } from "../../../contexts/ToastContext";
import { useUser } from "../../../contexts/UserContext";
import { signInWithGoogle } from "../../../services/firebaseAuthService";
import { loginWithGoogle } from "../../../services/authService";

export function useGoogleSignIn() {
  const navigate = useNavigate();
  const toast = useToast();
  const { setAuthenticatedUser } = useUser();
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function handleGoogleSignIn() {
    setIsSigningIn(true);
    try {
      const idToken = await signInWithGoogle();
      const user = await loginWithGoogle(idToken);
      setAuthenticatedUser(user);
      toast.success("You’re signed in with Google. Welcome to Linksy!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error.code === "auth/popup-closed-by-user" ||
          error.code === "auth/cancelled-popup-request")
      ) {
        return;
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "We couldn't sign you in with Google. Please try again.",
      );
    } finally {
      setIsSigningIn(false);
    }
  }

  return { handleGoogleSignIn, isSigningIn };
}
