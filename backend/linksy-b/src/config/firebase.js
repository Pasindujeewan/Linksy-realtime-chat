import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { AppError } from "../errors/AppError.js";
import { env } from "./env.js";

let firebaseAuth;

export const getFirebaseAuth = () => {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
    env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new AppError(
      "Firebase authentication is not configured",
      503,
      "FIREBASE_NOT_CONFIGURED",
    );
  }

  if (!firebaseAuth) {
    const app =
      getApps().find((registeredApp) => registeredApp.name === "[DEFAULT]") ??
      initializeApp({
        credential: cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });

    firebaseAuth = getAuth(app);
  }

  return firebaseAuth;
};
