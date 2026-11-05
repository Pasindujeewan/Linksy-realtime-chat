import {
  GoogleAuthProvider,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signInWithPopup,
} from "firebase/auth";
import { getApps, initializeApp } from "firebase/app";

const getFirebaseAuth = () => {
  const {
    VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_APP_ID,
  } = import.meta.env;

  if (
    !VITE_FIREBASE_API_KEY ||
    !VITE_FIREBASE_AUTH_DOMAIN ||
    !VITE_FIREBASE_PROJECT_ID ||
    !VITE_FIREBASE_APP_ID
  ) {
    throw new Error(
      "Google sign-in is not configured. Add the Firebase web app settings to the frontend environment.",
    );
  }

  const app =
    getApps().find((registeredApp) => registeredApp.name === "linksy-auth") ??
    initializeApp(
      {
        apiKey: VITE_FIREBASE_API_KEY,
        authDomain: VITE_FIREBASE_AUTH_DOMAIN,
        projectId: VITE_FIREBASE_PROJECT_ID,
        appId: VITE_FIREBASE_APP_ID,
      },
      "linksy-auth",
    );

  return getAuth(app);
};

export async function signInWithGoogle(): Promise<string> {
  const auth = getFirebaseAuth();
  await setPersistence(auth, inMemoryPersistence);

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await signInWithPopup(auth, provider);
  return result.user.getIdToken();
}
